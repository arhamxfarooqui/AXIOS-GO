package controllers

import (
	"fmt"
	"net/http"
	"regexp"
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

	// Task 3: Verify GitHub Handle
	if user.GithubHandle == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "GitHub handle not linked. Please update your profile in Settings."})
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
	var input struct {
		PRURL string `json:"pr_url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PR URL is required"})
		return
	}

	// 1. Fetch PR Diff from GitHub via specialized service
	diffContent, err := services.FetchPRDiff(input.PRURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Truncate if diff is massive to save tokens
	if len(diffContent) > 8000 {
		diffContent = diffContent[:8000] + "\n... (Diff truncated for review) ..."
	}

	// 2. Persona-Locked AI Review
	systemPrompt := "You are The Architect, a Senior Backend Engineer and System Design expert. You STRICTLY ONLY answer questions regarding software development, system architecture, Go, React, databases, CI/CD, and GitHub workflows."
	aiPrompt := fmt.Sprintf("You are The Architect. Review this GitHub PR diff. Focus on security vulnerabilities, Go/React anti-patterns, and performance bottlenecks. Be concise and format with Markdown.\n\nDiff:\n```diff\n%s\n```", diffContent)

	response, persona, err := services.MultiCall("dev", aiPrompt, systemPrompt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Architect failed: " + err.Error()})
		return
	}

	// Task 1: Sanitize Response (Remove <think> blocks)
	re := regexp.MustCompile(`(?s)<think>.*?</think>\n*`)
	response = re.ReplaceAllString(response, "")

	c.JSON(http.StatusOK, gin.H{
		"review":  response,
		"persona": persona,
	})
}

// POST /api/wings/dev/resume
func GenerateResumeBullets(c *gin.Context) {
	var input struct {
		RepoURL string `json:"repo_url" binding:"required"` // e.g., https://github.com/user/repo
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Repo URL is required"})
		return
	}

	// 1. Parse Owner and Repo from URL
	// Pattern: https://github.com/owner/repo
	trimmedURL := strings.TrimSuffix(input.RepoURL, "/")
	parts := strings.Split(trimmedURL, "/")
	if len(parts) < 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid GitHub repository URL"})
		return
	}
	owner := parts[3]
	repo := parts[4]

	// 2. Fetch Recent Commits
	commits, err := services.FetchRecentCommits(owner, repo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch commits: " + err.Error()})
		return
	}

	commitSummary := strings.Join(commits, "\n- ")
	if len(commitSummary) > 5000 {
		commitSummary = commitSummary[:5000]
	}

	// 3. AI Handoff
	systemPrompt := "You are an Expert Tech Recruiter specializing in Software Engineering internships and entry-level roles."
	aiPrompt := fmt.Sprintf("Turn these raw git commit messages into 3 powerful, professional resume bullet points using the STAR (Situation, Task, Action, Result) method. Focus on impact, technical keywords, and quantitative metrics where possible. \n\nCommits:\n- %s", commitSummary)

	response, _, err := services.MultiCall("dev", aiPrompt, systemPrompt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Recruiter AI failed: " + err.Error()})
		return
	}

	// Task 1: Sanitize Response (Remove <think> blocks)
	re := regexp.MustCompile(`(?s)<think>.*?</think>\n*`)
	response = re.ReplaceAllString(response, "")

	c.JSON(http.StatusOK, gin.H{
		"bullets": response,
	})
}
