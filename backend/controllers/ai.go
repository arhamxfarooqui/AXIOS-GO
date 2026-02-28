package controllers

import (
	"fmt"
	"net/http"
    "strings"

	"os"
	"axios-backend/database"
	"axios-backend/models"
	"axios-backend/services"

	"github.com/gin-gonic/gin"
)

// getAIKey returns the provided key, the environment variable HF_TOKEN, or a hardcoded fallback.
func getAIKey(providedKey string) string {
    if providedKey != "" {
        return providedKey
    }
    envKey := os.Getenv("HF_TOKEN")
    if envKey != "" {
        return envKey
    }
    return "" // Removed hardcoded key to pass GitHub secret scanning
}

type ConnectInput struct {
    ApiKey string `json:"api_key"`
}

type ChatInput struct {
	Message string `json:"message" binding:"required"`
    ApiKey  string `json:"api_key"`
    Model   string `json:"model"` // Optional
}

func ConnectToCoach(c *gin.Context) {
    var input ConnectInput
    if err := c.ShouldBindJSON(&input); err != nil && err.Error() != "EOF" {
        // Just proceed, API Key is optional
    }

    apiKey := getAIKey(input.ApiKey)
    err := services.ValidateTokenHF(apiKey)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid API Key or no supported models found: " + err.Error()})
        return
    }

    defaultModel := "meta-llama/Meta-Llama-3.1-8B-Instruct"
    c.JSON(http.StatusOK, gin.H{
        "message": "Connected successfully", 
        "models": []string{defaultModel},
        "default_model": defaultModel,
    })
}

func ChatWithCoach(c *gin.Context) {
    // fmt.Println("--- ENTERED ChatWithCoach ---")
	var input ChatInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message and API Key are required"})
		return
	}

	userIDVal, exists := c.Get("user_id")
	if !exists {
        // fmt.Println("Auth failed: user_id not in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
    
    // safe cast to uint
    var userID uint
    switch v := userIDVal.(type) {
    case uint:
        userID = v
    case float64:
        userID = uint(v)
    default:
        // fmt.Printf("UserID type mismatch: %T\n", userIDVal)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal UserID Error"})
        return
    }

    // fmt.Printf("AI Chat Request from UserID: %d\n", userID)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
        // fmt.Println("User lookup failed:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Construct User Context
	// Fetch Detailed Stats
    detailedStats, _ := services.FetchCodeforcesDetails(user.CodeforcesHandle)
    
    // Format Top Tags (Top 5)
    var tags []string
    for t, c := range detailedStats.TopTags {
        tags = append(tags, fmt.Sprintf("%s (%d)", t, c))
    }
    // Simple sort or just take first few (map order random) - for now just join all or first 10
    if len(tags) > 10 { tags = tags[:10] }
    topTagsStr := strings.Join(tags, ", ")

	// Construct User Context
    wings := strings.Join(user.Wings, ", ")
	context := fmt.Sprintf(`
You are "CodeSensei", an expert coding coach for the Axios technical wing.
You are talking to %s.

Here is their DETAILED Codeforces Profile:
- Handle: %s (Rating: %d, Max Rank: %s)
- Total Solved: %d
- Max Problem Rating Solved: %d
- Difficulty Breakdown:
  - Easy (<1200): %d
  - Medium (1200-1600): %d
  - Hard (>1600): %d
- Top Topics Solved: %s

Other Stats:
- GitHub: %s (Repos: %d)
- Interested Wings: %s
- Kaggle: %s
- CTF: %s

Your goal is to provide specific, actionable advice.
- If they ask for problems, look at their difficulty breakdown and recommend problems +100-200 rating above their max or current rating.
- If they are weak in a topic (low solve count), suggest resources for that topic.
- Use the detailed context to give personalized advice.
- Keep responses concise, encouraging, and technical. Use Markdown.
`, user.Name, user.CodeforcesHandle, user.CodeforcesRating, "Unranked", detailedStats.TotalSolved, 
   detailedStats.MaxRating, detailedStats.EasyCount, detailedStats.MediumCount, detailedStats.HardCount, topTagsStr,
   user.GithubHandle, user.GithubRepos, wings, user.KaggleHandle, user.CTFHandle)

    apiKey := getAIKey(input.ApiKey)
	response, err := services.ChatWithCoachHF(apiKey, context, input.Message)
	if err != nil {
		fmt.Println("Hugging Face Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to contact AI Coach: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"response": response})
}

func GenerateRoadmap(c *gin.Context) {
    var input ConnectInput // Re-use for just ApiKey
    if err := c.ShouldBindJSON(&input); err != nil && err.Error() != "EOF" {
        // Proceed, ApiKey is optional
    }

    userIDVal, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    // safe cast pattern
    var userID uint
    switch v := userIDVal.(type) {
    case uint: userID = v
    case float64: userID = uint(v)
    }

    // 1. Get User from DB
    var user models.User
    if err := database.DB.First(&user, userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }

    // 2. Fetch Live Stats (Parallelize if slow, but linear is safer for now)
    // Codeforces
    if user.CodeforcesHandle != "" {
        rating, err := services.FetchCodeforcesStats(user.CodeforcesHandle)
        if err == nil { user.CodeforcesRating = rating }
        solved, err := services.FetchCodeforcesSolved(user.CodeforcesHandle)
        if err == nil { user.TotalSolved = solved }
    }
    
    // GitHub (Get Languages and Top Repo)
    var topLangs []string
    var topRepo string
    if user.GithubHandle != "" {
        langs, repo, err := services.FetchGithubLanguages(user.GithubHandle)
        if err == nil { 
            topLangs = langs 
            topRepo = repo
        }
    }

    // Kaggle
    kaggleStatus := "Not Linked"
    if user.KaggleHandle != "" {
        status, err := services.FetchKaggleStats(user.KaggleHandle)
        if err == nil { kaggleStatus = status }
    }
   
    // CTF
    ctfStatus := "Not Linked"
    if user.CTFHandle != "" {
        status, err := services.FetchCTFStats(user.CTFHandle)
        if err == nil { ctfStatus = status }
    }

    // 3. Build Request
    stats := services.RoadmapRequest{
        CFRating:     user.CodeforcesRating,
        Wings:        user.Wings,
        TopLanguages: topLangs,
        TopRepo:      topRepo,
        TotalSolved:  user.TotalSolved,
        KaggleStatus: kaggleStatus,
        CTFStatus:    ctfStatus,
    }

    apiKey := getAIKey(input.ApiKey)
    jsonRoadmap, err := services.GenerateRoadmapHF(apiKey, stats)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "AI Generation Verification Failed: " + err.Error()})
        return
    }

    // 5. Return JSON
    c.Header("Content-Type", "application/json")
    c.String(http.StatusOK, jsonRoadmap) // Return raw JSON string from Gemini
}

func GetProfileAnalysis(c *gin.Context) {
    userIDVal, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    var userID uint
    switch v := userIDVal.(type) {
    case uint: userID = v
    case float64: userID = uint(v)
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
    if len(tags) > 10 { tags = tags[:10] }
    topTagsStr := strings.Join(tags, ", ")

    contextPrompt := fmt.Sprintf(`You are CodeSensei, an expert coding coach. Analyze this user's profile and provide motivation. User: %s, Codeforces: %s (Rating: %d), Total Solved: %d (Easy: %d, Medium: %d, Hard: %d). Top Tags: %s. GitHub: %s, Kaggle: %s, CTF: %s. Keep the analysis encouraging, highlight strengths, and suggest one actionable area for improvement. Format nicely in Markdown.`, user.Name, user.CodeforcesHandle, user.CodeforcesRating, detailedStats.TotalSolved, detailedStats.EasyCount, detailedStats.MediumCount, detailedStats.HardCount, topTagsStr, user.GithubHandle, user.KaggleHandle, user.CTFHandle)

    apiKey := getAIKey("")
    response, err := services.ChatWithCoachHF(apiKey, contextPrompt, "Please analyze my profile and give me actionable advice and encouragement.")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate analysis: " + err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"analysis": response})
}

