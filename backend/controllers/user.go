package controllers

import (
	"net/http"
	"axios-backend/database"
	"axios-backend/models"
	"axios-backend/services"
	"github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {
	userId, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

func RefreshStats(c *gin.Context) {
	userId, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Fetch Codeforces Stats
    var warnings []string
	if user.CodeforcesHandle != "" {
		rating, err := services.FetchCodeforcesStats(user.CodeforcesHandle)
		if err == nil {
			user.CodeforcesRating = rating
		} else {
            warnings = append(warnings, "Codeforces Rating: "+err.Error())
        }

        solved, err := services.FetchCodeforcesSolved(user.CodeforcesHandle)
        if err == nil {
            user.TotalSolved = solved
        } else {
             warnings = append(warnings, "Codeforces Solved: "+err.Error())
        }
	}
    
    // Fetch GitHub Stats
    if user.GithubHandle != "" {
        repos, err := services.FetchGithubStats(user.GithubHandle)
        if err == nil {
            user.GithubRepos = repos
        } else {
            warnings = append(warnings, "GitHub: "+err.Error())
        }
    }

    // Update DB
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user stats"})
		return
	}

    c.JSON(http.StatusOK, gin.H{
        "message": "Stats sync completed", 
        "user": user,
        "warnings": warnings,
    })
}
