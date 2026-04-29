package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"axios-backend/database"
	"axios-backend/models"
	"axios-backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetOverallLeaderboard fetches the global ranking sorted by Axios Rating.
func GetOverallLeaderboard(c *gin.Context) {
	// 1. Attempt Cache Hit
	if services.RedisClient != nil {
		cachedData, err := services.RedisClient.Get(services.Ctx, "global_leaderboard").Result()
		if err == nil && cachedData != "" {
			var users []models.User
			if err := json.Unmarshal([]byte(cachedData), &users); err == nil {
				c.JSON(http.StatusOK, users)
				return // Cache Hit Success
			}
		}
	}

	// 2. Cache Miss: Fetch from DB
	var users []models.User

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	if page < 1 { page = 1 }
	offset := (page - 1) * limit

	if err := database.DB.Order("axios_rating desc").
		Limit(limit).
		Offset(offset).
		Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch global leaderboard"})
		return
	}

	// 3. Populate Cache
	if services.RedisClient != nil {
		if jsonData, err := json.Marshal(users); err == nil {
			services.RedisClient.Set(services.Ctx, "global_leaderboard", jsonData, 5*time.Minute)
		}
	}

	c.JSON(http.StatusOK, users)
}

// GetWingLeaderboard fetches ranking filtered by a specific Wing.
func GetWingLeaderboard(c *gin.Context) {
	wingName := c.Query("wing")
	if wingName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wing parameter is required"})
		return
	}

	var users []models.User
	var query *gorm.DB

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	if page < 1 { page = 1 }
	offset := (page - 1) * limit

	// Mapping shorthand IDs to DB strings
	switch strings.ToLower(wingName) {
	case "cp":
		query = database.DB.Where("wings @> ?", "[\"Competitive Programming\"]").Order("codeforces_rating desc")
	case "dev", "web":
		query = database.DB.Where("wings @> ?", "[\"Web Development\"]").Order("github_repos desc")
	case "ml":
		query = database.DB.Where("wings @> ?", "[\"Machine Learning\"]").Order("axios_rating desc")
	default:
		query = database.DB.Where("wings @> ?", "[\""+wingName+"\"]").Order("axios_rating desc")
	}

	if err := query.Limit(limit).Offset(offset).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch wing leaderboard"})
		return
	}

	c.JSON(http.StatusOK, users)
}
