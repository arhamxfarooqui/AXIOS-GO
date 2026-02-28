package controllers

import (
	"net/http"

	"axios-backend/database"
	"axios-backend/models"

	"github.com/gin-gonic/gin"
)

func GetOverallLeaderboard(c *gin.Context) {
	var users []models.User
	// Sort by total solved or rating. For now, using TotalSolved.
	if err := database.DB.Order("total_solved desc").Limit(50).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch leaderboard"})
		return
	}

	c.JSON(http.StatusOK, users)
}

func GetWingLeaderboard(c *gin.Context) {
	wingName := c.Param("wing")
	var users []models.User
	
	// This uses a JSON query for Postgres.
	// Syntax: wings @> '["wingName"]'
	// Note: GORM/Postgres JSON querying can be tricky.
	// For simplicity in this demo, fetching all and filtering or using simple LIKE if string.
	// But since it's an array of strings in JSONB (if using Postgres), we can use the @> operator.
	
	if err := database.DB.Where("wings @> ?", "[\""+wingName+"\"]").Order("total_solved desc").Limit(50).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch wing leaderboard"})
		return
	}

	c.JSON(http.StatusOK, users)
}
