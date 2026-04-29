package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

var githubClient = &http.Client{
	Timeout: 10 * time.Second,
}

// executeGitHubRequest handles creating the request and injecting the token
func executeGitHubRequest(method string, reqURL string, customAcceptHeader string) (*http.Response, error) {
	req, err := http.NewRequest(method, reqURL, nil)
	if err != nil {
		return nil, err
	}

	// Inject the Auth Token if it exists
	token := os.Getenv("GITHUB_TOKEN")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	// Set custom Accept header (used for PR diffs), otherwise default to v3 JSON
	if customAcceptHeader != "" {
		req.Header.Set("Accept", customAcceptHeader)
	} else {
		req.Header.Set("Accept", "application/vnd.github.v3+json")
	}

	return githubClient.Do(req)
}

// Simplified Issue data for the Dev Wing UI
type GoodFirstIssue struct {
	Title    string `json:"title"`
	URL      string `json:"url"`
	RepoName string `json:"repo_name"`
}

type GHSearchResponse struct {
	Items []struct {
		Title      string `json:"title"`
		HTMLURL    string `json:"html_url"`
		Repository struct {
			FullName string `json:"full_name"`
		} `json:"repository"`
	} `json:"items"`
}

// FetchGoodFirstIssues queries GitHub for open issues labeled "good first issue".
func FetchGoodFirstIssues(languages []string) ([]GoodFirstIssue, error) {
	query := `label:"good first issue" is:open no:assignee`
	if len(languages) > 0 {
		query += fmt.Sprintf(" language:%s", strings.Join(languages, " language:"))
	}

	url := fmt.Sprintf("https://api.github.com/search/issues?q=%s", query)
	resp, err := executeGitHubRequest("GET", url, "")
	if err != nil {
		return nil, fmt.Errorf("github api request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusForbidden {
		return nil, fmt.Errorf("GitHub API Rate Limit Exceeded or Invalid Token (403)")
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API returned status: %d", resp.StatusCode)
	}

	var searchResp GHSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&searchResp); err != nil {
		return nil, err
	}

	var issues []GoodFirstIssue
	for _, item := range searchResp.Items {
		issues = append(issues, GoodFirstIssue{
			Title:    item.Title,
			URL:      item.HTMLURL,
			RepoName: item.Repository.FullName,
		})
	}

	return issues, nil
}

type GHRepo struct {
	Name            string    `json:"name"`
	FullName        string    `json:"full_name"`
	Owner           struct {
		Login string `json:"login"`
	} `json:"owner"`
	StargazersCount int       `json:"stargazers_count"`
	OpenIssuesCount int       `json:"open_issues_count"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// FetchUserRepos returns a list of public repositories for a user.
func FetchUserRepos(githubHandle string) ([]GHRepo, error) {
	url := fmt.Sprintf("https://api.github.com/users/%s/repos?sort=updated&per_page=30", githubHandle)
	resp, err := executeGitHubRequest("GET", url, "")
	if err != nil {
		return nil, fmt.Errorf("github api request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusForbidden {
		return nil, fmt.Errorf("GitHub API Rate Limit Exceeded or Invalid Token (403)")
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API returned status: %d", resp.StatusCode)
	}

	var repos []GHRepo
	if err := json.NewDecoder(resp.Body).Decode(&repos); err != nil {
		return nil, err
	}

	return repos, nil
}

type ProjectHealth struct {
	Score       int    `json:"score"`
	HasReadme   bool   `json:"has_readme"`
	ActiveLast30 bool   `json:"active_last_30"`
	IssueRatio  float64 `json:"issue_ratio"` // closed / total (simulated for Phase 1)
}

// CalculateProjectHealth computes a 0-100 score based on available repo metrics.
func CalculateProjectHealth(owner, repo string) (ProjectHealth, error) {
	health := ProjectHealth{Score: 50} // Baseline

	// 1. Check for README
	readmeURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/readme", owner, repo)
	resp, err := executeGitHubRequest("GET", readmeURL, "")
	if err != nil {
		return health, fmt.Errorf("github readme check failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusForbidden {
		return health, fmt.Errorf("GitHub API Rate Limit Exceeded or Invalid Token (403)")
	}
	if resp.StatusCode == http.StatusOK {
		health.HasReadme = true
		health.Score += 20
	}

	// 2. Check recent activity (commits)
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30).Format(time.RFC3339)
	commitsURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/commits?since=%s", owner, repo, thirtyDaysAgo)
	resp, err = executeGitHubRequest("GET", commitsURL, "")
	if err != nil {
		return health, fmt.Errorf("github activity check failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusForbidden {
		return health, fmt.Errorf("GitHub API Rate Limit Exceeded or Invalid Token (403)")
	}
	if resp.StatusCode == http.StatusOK {
		var commits []interface{}
		if err := json.NewDecoder(resp.Body).Decode(&commits); err == nil && len(commits) > 0 {
			health.ActiveLast30 = true
			health.Score += 20
		}
	}

	// 3. Issue Ratio (Simplified check for total issues vs open)
	repoURL := fmt.Sprintf("https://api.github.com/repos/%s/%s", owner, repo)
	resp, err = executeGitHubRequest("GET", repoURL, "")
	if err != nil {
		return health, fmt.Errorf("github repo check failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusForbidden {
		return health, fmt.Errorf("GitHub API Rate Limit Exceeded or Invalid Token (403)")
	}
	if resp.StatusCode == http.StatusOK {
		var repoData struct {
			OpenIssues int `json:"open_issues_count"`
			HasIssues  bool `json:"has_issues"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&repoData); err == nil {
			if repoData.OpenIssues < 5 {
				health.Score += 10
			}
		}
	}

	if health.Score > 100 {
		health.Score = 100
	}

	return health, nil
}

// FetchPRDiff retrieves the raw diff for a specific GitHub Pull Request.
func FetchPRDiff(prURL string) (string, error) {
	// 1. Validation Logic
	if !strings.Contains(prURL, "/pull/") {
		if strings.Contains(prURL, "github.com/") {
			return "", fmt.Errorf("please provide a specific Pull Request URL, not a repository URL")
		}
		return "", fmt.Errorf("invalid GitHub PR URL format")
	}

	parts := strings.Split(prURL, "/")
	if len(parts) < 7 {
		return "", fmt.Errorf("invalid GitHub PR URL format")
	}

	owner := parts[3]
	repo := parts[4]
	prNumber := parts[6]

	// 2. API Call
	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/pulls/%s", owner, repo, prNumber)
	
	resp, err := executeGitHubRequest("GET", apiURL, "application/vnd.github.v3.diff")
	if err != nil {
		return "", fmt.Errorf("github diff request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusForbidden {
		return "", fmt.Errorf("GitHub API Rate Limit Exceeded or Invalid Token (403)")
	}
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("GitHub API returned status: %d", resp.StatusCode)
	}

	diffBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(diffBytes), nil
}

// FetchRecentCommits retrieves the last 10 commit messages for a repo.
func FetchRecentCommits(owner string, repo string) ([]string, error) {
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/commits?per_page=10", owner, repo)
	resp, err := executeGitHubRequest("GET", url, "")
	if err != nil {
		return nil, fmt.Errorf("github commits request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusForbidden {
		return nil, fmt.Errorf("GitHub API Rate Limit Exceeded or Invalid Token (403)")
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API returned status: %d", resp.StatusCode)
	}

	var commitData []struct {
		Commit struct {
			Message string `json:"message"`
		} `json:"commit"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&commitData); err != nil {
		return nil, err
	}

	var messages []string
	for _, c := range commitData {
		messages = append(messages, c.Commit.Message)
	}

	return messages, nil
}
