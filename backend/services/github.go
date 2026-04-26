package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

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
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github api search error: %d", resp.StatusCode)
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
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github api users error: %d", resp.StatusCode)
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
	resp, err := http.Get(readmeURL)
	if err == nil && resp.StatusCode == http.StatusOK {
		health.HasReadme = true
		health.Score += 20
	}
	if resp != nil {
		resp.Body.Close()
	}

	// 2. Check recent activity (commits)
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30).Format(time.RFC3339)
	commitsURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/commits?since=%s", owner, repo, thirtyDaysAgo)
	resp, err = http.Get(commitsURL)
	if err == nil && resp.StatusCode == http.StatusOK {
		var commits []interface{}
		if err := json.NewDecoder(resp.Body).Decode(&commits); err == nil && len(commits) > 0 {
			health.ActiveLast30 = true
			health.Score += 20
		}
	}
	if resp != nil {
		resp.Body.Close()
	}

	// 3. Issue Ratio (Simplified check for total issues vs open)
	repoURL := fmt.Sprintf("https://api.github.com/repos/%s/%s", owner, repo)
	resp, err = http.Get(repoURL)
	if err == nil && resp.StatusCode == http.StatusOK {
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
	if resp != nil {
		resp.Body.Close()
	}

	if health.Score > 100 {
		health.Score = 100
	}

	return health, nil
}
