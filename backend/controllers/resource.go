package controllers

import (
	"net/http"

	"axios-backend/database"
	"axios-backend/models"

	"github.com/gin-gonic/gin"
)

func GetResources(c *gin.Context) {
	var resources []models.Resource
	subject := c.Query("subject")
	year := c.Query("year")
	
	query := database.DB
	if subject != "" {
		query = query.Where("subject = ?", subject)
	}
	if year != "" {
		query = query.Where("year = ?", year)
	}
	
	if err := query.Find(&resources).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch resources"})
		return
	}

	c.JSON(http.StatusOK, resources)
}

// Admin only route ideally, but open for now or protected
func CreateResource(c *gin.Context) {
	var input models.Resource
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create resource"})
		return
	}

	c.JSON(http.StatusOK, input)
}
