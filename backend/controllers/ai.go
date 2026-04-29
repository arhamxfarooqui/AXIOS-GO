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

// POST /api/ai/codesensei
func CodeSensei(c *gin.Context) {
	var input struct {
		Message string `json:"message" binding:"required"`
		Wing    string `json:"wing"` // Optional, defaults to general
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message is required"})
		return
	}

	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var userID uint
	switch v := userIDVal.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Context Construction
	context := fmt.Sprintf("User: %s. CF Rating: %d. Solved: %d. Wings: %v.", user.Name, user.CodeforcesRating, user.TotalSolved, user.Wings)
	
	systemPrompt := "You are CodeSensei. Your goal is to guide the student technically. Identify logical errors but NEVER provide the full solution code. Use 'nudge' hints only. Use Markdown."
	
	if strings.ToLower(input.Wing) == "cp" {
		systemPrompt = "You are CodeSensei, an elite Competitive Programming Grandmaster. You STRICTLY ONLY answer questions regarding data structures, algorithms, math, and competitive programming logic. If the user asks about FOSS, web development, general knowledge, or anything outside of CP, you MUST decline and aggressively steer the conversation back to competitive programming. Do not write full solutions, only give nudges."
	} else if strings.ToLower(input.Wing) == "dev" {
		systemPrompt = "You are The Architect, a Senior Backend Engineer and System Design expert. You STRICTLY ONLY answer questions regarding software development, system architecture, Go, React, databases, CI/CD, and GitHub workflows. If the user asks about competitive programming, algorithms like DP, or non-dev topics, politely refuse and steer them back to software engineering."
	}

	response, persona, err := services.MultiCall(input.Wing, input.Message, systemPrompt+"\nContext: "+context)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI Service Failure: " + err.Error()})
		return
	}

	// Task 1: Sanitize Response (Remove <think> blocks)
	re := regexp.MustCompile(`(?s)<think>.*?</think>\n*`)
	response = re.ReplaceAllString(response, "")

	c.JSON(http.StatusOK, gin.H{
		"response": response,
		"persona":  persona,
	})
}

// POST /api/ai/roadmap
func GenerateRoadmap(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var userID uint
	switch v := userIDVal.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Fetch detailed stats for roadmap
	stats := services.RoadmapRequest{
		CFRating:     user.CodeforcesRating,
		TotalSolved:  user.TotalSolved,
		Wings:        user.Wings,
		TopLanguages: []string{"C++", "Python"},
		TopRepo:      user.GithubHandle,
		KaggleStatus: "Active",
		CTFStatus:    "Active",
	}

	roadmap, err := services.GenerateRoadmap(stats)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Roadmap Generation Failed: " + err.Error()})
		return
	}

	c.Header("Content-Type", "application/json")
	c.String(http.StatusOK, roadmap)
}

// POST /api/ai/analyze
func AnalyzeWithOrchestrator(c *gin.Context) {
	var input struct {
		Prompt string `json:"prompt" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Prompt is required"})
		return
	}

	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var userID uint
	switch v := userIDVal.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	}

	// 1. Fetch Shadow Memory Context
	weaknesses, _ := services.GetWeakConcepts(userID, "Web") // Default domain
	memoryContext := services.FormatContextString(weaknesses)

	// 2. Task Decomposition (DeepSeek Orchestrator)
	plan, err := services.DecomposeTask(input.Prompt, memoryContext)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Orchestrator failure: " + err.Error()})
		return
	}

	// 3. Execution (Multi-Provider Sub-Agents)
    type SubTaskResult struct {
        Description string `json:"description"`
        TargetWing  string `json:"target_wing"`
        ActionType  string `json:"action_type"`
        Status      string `json:"status"`
        Result      string `json:"result"`
    }
    
    var results []SubTaskResult
    
	for _, task := range plan.SubTasks {
		systemPrompt := fmt.Sprintf("You are a specialized %s sub-agent. Provide CONCEPTUAL NUDGES ONLY. No full solutions. Focus on %s.", task.TargetWing, task.ActionType)
		
		res, _, err := services.MultiCall(task.TargetWing, task.Description, systemPrompt)
		
		// Sanitize sub-task results too
		re := regexp.MustCompile(`(?s)<think>.*?</think>\n*`)
		res = re.ReplaceAllString(res, "")
        
        status := "completed"
		if err != nil {
			status = "failed"
            res = err.Error()
		}

        results = append(results, SubTaskResult{
            Description: task.Description,
            TargetWing:  task.TargetWing,
            ActionType:  task.ActionType,
            Status:      status,
            Result:      res,
        })
	}

	c.JSON(http.StatusOK, gin.H{
        "summary": plan.Summary,
        "tasks":   results,
    })
}

func GetProfileAnalysis(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var userID uint
	switch v := userIDVal.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	detailedStats, _ := services.FetchCodeforcesDetails(user.CodeforcesHandle)
	var tags []string
	for t, count := range detailedStats.TopTags {
		tags = append(tags, fmt.Sprintf("%s (%d)", t, count))
	}
	if len(tags) > 10 {
		tags = tags[:10]
	}
	topTagsStr := strings.Join(tags, ", ")

	contextPrompt := fmt.Sprintf(`Analyze this user's profile and provide motivation. User: %s, Codeforces: %s (Rating: %d), Total Solved: %d. Top Tags: %s. Keep the analysis encouraging, highlight strengths, and suggest one actionable area for improvement. Format nicely in Markdown.`, user.Name, user.CodeforcesHandle, user.CodeforcesRating, detailedStats.TotalSolved, topTagsStr)

	response, _, err := services.MultiCall("general", contextPrompt, "You are CodeSensei. Analyze the profile.")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate analysis: " + err.Error()})
		return
	}

	// Sanitize analysis
	re := regexp.MustCompile(`(?s)<think>.*?</think>\n*`)
	response = re.ReplaceAllString(response, "")

	c.JSON(http.StatusOK, gin.H{"analysis": response})
}
