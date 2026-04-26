package controllers

import (
	"net/http"

	"axios-backend/database"
	"axios-backend/models"
	"axios-backend/services"

	"github.com/gin-gonic/gin"
)

// GET /api/wings/ml/curate
func GetMLCuration(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	// 1. Identify weaknesses from Shadow Memory
	weaknesses, err := services.GetWeakConcepts(userID, "ML")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch shadow memory"})
		return
	}

	if len(weaknesses) == 0 {
		// Fallback: Fetch general beginner resources if no memory exists
		var resources []models.Resource
		database.DB.Where("wing_id = ? AND difficulty_level = ?", "ML", "beginner").Limit(5).Find(&resources)
		c.JSON(http.StatusOK, gin.H{
			"status":    "exploring",
			"message":   "No specific weaknesses identified yet. Here are some introductory materials.",
			"resources": resources,
		})
		return
	}

	// 2. Query Resource table for materials targeting these weaknesses
	// We search for resources where the Subject matches a weak Concept
	var results []models.Resource
	for _, w := range weaknesses {
		var res []models.Resource
		// Simple keyword match for Stage 3
		database.DB.Where("wing_id = ? AND (subject ILIKE ? OR title ILIKE ?)", "ML", "%"+w.Concept+"%", "%"+w.Concept+"%").
			Limit(2).
			Find(&res)
		results = append(results, res...)
	}

	c.JSON(http.StatusOK, gin.H{
		"status":     "targeting_weaknesses",
		"weaknesses": weaknesses,
		"resources":  results,
	})
}
