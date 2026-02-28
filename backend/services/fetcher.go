package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"axios-backend/models"
)

type CFResponse struct {
	Status  string `json:"status"`
	Comment string `json:"comment"` // For error messages
	Result  []struct {
		Rating int `json:"rating"`
	} `json:"result"`
}

type GHResponse struct {
	PublicRepos int `json:"public_repos"`
    Message     string `json:"message"` // Helper for handling "Not Found"
}

func FetchCodeforcesStats(handle string) (int, error) {
	if handle == "" {
		return 0, nil
	}
	// Using public API as authorization is only needed for private data as per docs
	resp, err := http.Get(fmt.Sprintf("https://codeforces.com/api/user.info?handles=%s", handle))
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	var cfResp CFResponse
	if err := json.NewDecoder(resp.Body).Decode(&cfResp); err != nil {
		return 0, err
	}

	if cfResp.Status == "FAILED" {
		return 0, fmt.Errorf("codeforces error: %s", cfResp.Comment)
	}

	if len(cfResp.Result) == 0 {
		return 0, fmt.Errorf("no user data found")
	}

	return cfResp.Result[0].Rating, nil
}

type CFStatusResponse struct {
	Status  string `json:"status"`
    Comment string `json:"comment"`
	Result  []struct {
		Verdict string `json:"verdict"`
		Problem struct {
			ContestId int      `json:"contestId"`
			Index     string   `json:"index"`
            Name      string   `json:"name"`
            Tags      []string `json:"tags"`
            Rating    int      `json:"rating"`
		} `json:"problem"`
	} `json:"result"`
}

type DetailedStats struct {
    TotalSolved int
    MaxRating   int
    TopTags     map[string]int
    EasyCount   int // < 1200
    MediumCount int // 1200 - 1600
    HardCount   int // > 1600
}

// Fetch detailed stats including tags and difficulties
func FetchCodeforcesDetails(handle string) (DetailedStats, error) {
    stats := DetailedStats{
        TopTags: make(map[string]int),
    }
    
    if handle == "" {
        return stats, nil
    }

    resp, err := http.Get(fmt.Sprintf("https://codeforces.com/api/user.status?handle=%s", handle))
    if err != nil {
        return stats, err
    }
    defer resp.Body.Close()

    var cfResp CFStatusResponse
    if err := json.NewDecoder(resp.Body).Decode(&cfResp); err != nil {
        return stats, err
    }

    if cfResp.Status == "FAILED" {
        return stats, fmt.Errorf("codeforces status error: %s", cfResp.Comment)
    }

    solved := make(map[string]bool)
    
    for _, submission := range cfResp.Result {
        if submission.Verdict == "OK" {
             id := fmt.Sprintf("%d%s", submission.Problem.ContestId, submission.Problem.Index)
             if solved[id] {
                 continue
             }
             solved[id] = true
             
             // Update Stats
             stats.TotalSolved++
             if submission.Problem.Rating > stats.MaxRating {
                 stats.MaxRating = submission.Problem.Rating
             }
             
             // Difficulty
             r := submission.Problem.Rating
             if r > 0 {
                 if r < 1200 {
                     stats.EasyCount++
                 } else if r <= 1600 {
                     stats.MediumCount++
                 } else {
                     stats.HardCount++
                 }
             }
             
             // Tags
             for _, tag := range submission.Problem.Tags {
                 stats.TopTags[tag]++
             }
        }
    }

    return stats, nil
}

func FetchCodeforcesSolved(handle string) (int, error) {
    stats, err := FetchCodeforcesDetails(handle)
    return stats.TotalSolved, err
}

func FetchGithubStats(handle string) (int, error) {
	if handle == "" {
		return 0, nil
	}
	
	resp, err := http.Get(fmt.Sprintf("https://api.github.com/users/%s", handle))
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return 0, fmt.Errorf("github api returned status: %d", resp.StatusCode)
    }

	var ghResp GHResponse
	if err := json.NewDecoder(resp.Body).Decode(&ghResp); err != nil {
		return 0, err
	}

	return ghResp.PublicRepos, nil
}


// Helper to extract top languages from repos
func FetchGithubLanguages(handle string) ([]string, string, error) {
	if handle == "" {
		return nil, "", nil
	}

	resp, err := http.Get(fmt.Sprintf("https://api.github.com/users/%s/repos?sort=updated&per_page=10", handle))
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("github api error: %d", resp.StatusCode)
	}

	var repos []struct {
		Language    string `json:"language"`
        Description string `json:"description"`
        Stargazers  int    `json:"stargazers_count"`
        Name        string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&repos); err != nil {
		return nil, "", err
	}

	langMap := make(map[string]int)
    var topRepo string
    maxStars := -1

	for _, repo := range repos {
		if repo.Language != "" {
			langMap[repo.Language]++
		}
        // Find most popular repo in this batch
        if repo.Stargazers > maxStars {
            maxStars = repo.Stargazers
            desc := repo.Description
            if desc == "" { desc = "No description" }
            topRepo = fmt.Sprintf("%s: %s", repo.Name, desc)
        }
	}

	// Just return top 3 for simplicity
	var topLangs []string
	for l := range langMap {
		topLangs = append(topLangs, l)
		if len(topLangs) >= 5 {
			break
		}
	}
	return topLangs, topRepo, nil
}

// Basic check if Kaggle profile exists (Scraping is brittle, using existence check)
func FetchKaggleStats(handle string) (string, error) {
    if handle == "" { return "", nil }
    
    // Just check if page 200s
    resp, err := http.Get(fmt.Sprintf("https://www.kaggle.com/%s", handle))
    if err != nil { return "", err }
    defer resp.Body.Close()
    
    if resp.StatusCode == 404 {
        return "Invalid Handle", nil
    }
    if resp.StatusCode == 200 {
        return "Active", nil // Ideally we'd scrape "Grandmaster" etc but cloudflare might block
    }
    return "Unknown", nil
}

func FetchCTFStats(handle string) (string, error) {
    if handle == "" { return "", nil }

    // TryHackMe check
    resp, err := http.Get(fmt.Sprintf("https://tryhackme.com/p/%s", handle))
    if err != nil { return "", err }
    defer resp.Body.Close()

    if resp.StatusCode == 200 {
        return "Active on TryHackMe", nil
    }
    return "Unknown", nil
}

func UpdateUserStats(user *models.User) error {
	if user.CodeforcesHandle != "" {
		rating, err := FetchCodeforcesStats(user.CodeforcesHandle)
		if err == nil {
			user.CodeforcesRating = rating
		}
        
        solved, err := FetchCodeforcesSolved(user.CodeforcesHandle)
        if err == nil {
            user.TotalSolved = solved
        }
	}
    
    if user.GithubHandle != "" {
        repos, err := FetchGithubStats(user.GithubHandle)
        if err == nil {
            user.GithubRepos = repos
        }
    }
    
	return nil
}
