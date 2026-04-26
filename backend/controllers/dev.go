package controllers

import (
	"fmt"
	"io"
	"net/http"
	"strings"

	"axios-backend/database"
	"axios-backend/models"
	"axios-backend/services"

	"github.com/gin-gonic/gin"
)

// GET /api/wings/dev/first-issues
func GetGoodFirstIssues(c *gin.Context) {
	langParam := c.Query("language")
	var langs []string
	if langParam != "" {
		langs = strings.Split(langParam, ",")
	}

	issues, err := services.FetchGoodFirstIssues(langs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "GitHub API error: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, issues)
}

// GET /api/wings/dev/health
func GetDevHealth(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.GithubHandle == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "GitHub handle not linked"})
		return
	}

	repos, err := services.FetchUserRepos(user.GithubHandle)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch repos: " + err.Error()})
		return
	}

	// Pick top 3 most recently updated
	limit := 3
	if len(repos) < 3 {
		limit = len(repos)
	}

	type RepoHealthResponse struct {
		Name   string                 `json:"name"`
		Health services.ProjectHealth `json:"health"`
	}

	var results []RepoHealthResponse
	for i := 0; i < limit; i++ {
		health, err := services.CalculateProjectHealth(repos[i].Owner.Login, repos[i].Name)
		if err == nil {
			results = append(results, RepoHealthResponse{
				Name:   repos[i].FullName,
				Health: health,
			})
		}
	}

	c.JSON(http.StatusOK, results)
}

// POST /api/wings/dev/review
func ReviewPullRequest(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var input struct {
		PRURL string `json:"pr_url" binding:"required"` // e.g., https://github.com/owner/repo/pull/1
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PR URL is required"})
		return
	}

	// 1. Fetch PR Diff from GitHub
	// Standard PR URL: https://github.com/owner/repo/pull/1
	// API PR URL: https://api.github.com/repos/owner/repo/pulls/1
	apiURL := strings.Replace(input.PRURL, "github.com", "api.github.com/repos", 1)
	apiURL = strings.Replace(apiURL, "/pull/", "/pulls/", 1)

	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("Accept", "application/vnd.github.v3.diff")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch PR diff: " + err.Error()})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadGateway, gin.H{"error": fmt.Sprintf("GitHub API returned %d", resp.StatusCode)})
		return
	}

	diffBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read diff"})
		return
	}
	diffContent := string(diffBytes)
	if len(diffContent) > 10000 {
		diffContent = diffContent[:10000] + "\n... (diff truncated)"
	}

	// 2. Fetch Shadow Memory Context
	weaknesses, _ := services.GetWeakConcepts(userID, "Web") // Defaulting to Web for Dev wing
	memoryContext := services.FormatContextString(weaknesses)

	// 3. Orchestrator Handoff
	aiPrompt := fmt.Sprintf("Review this GitHub PR diff for security, anti-patterns, and performance:\n\n%s", diffContent)
	plan, err := services.DecomposeTask(aiPrompt, memoryContext)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Orchestrator error: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, plan)
}
