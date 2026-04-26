package controllers

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"time"

	"axios-backend/database"
	"axios-backend/models"

	"github.com/gin-gonic/gin"
)

// GET /api/wings/cp/upsolves
func GetUpsolveQueue(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var tasks []models.UpsolveTask
	if err := database.DB.Where("user_id = ? AND status = ?", userID, "pending").Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch upsolve queue"})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

// POST /api/wings/cp/upsolves/:id/status
func UpdateUpsolveStatus(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	taskID := c.Param("id")

	var input struct {
		Status string `json:"status" binding:"required"` // "solved", "skipped"
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	result := database.DB.Model(&models.UpsolveTask{}).
		Where("id = ? AND user_id = ?", taskID, userID).
		Update("status", input.Status)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found or unauthorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated successfully"})
}

type CFProblemSet struct {
	Status string `json:"status"`
	Result struct {
		Problems []struct {
			ContestId int      `json:"contestId"`
			Index     string   `json:"index"`
			Name      string   `json:"name"`
			Rating    int      `json:"rating"`
			Tags      []string `json:"tags"`
		} `json:"problems"`
	} `json:"result"`
}

// POST /api/wings/cp/mock
func GenerateMockContest(c *gin.Context) {
	var input struct {
		Rating int `json:"rating" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Target rating is required"})
		return
	}

	// Fetch global problemset
	resp, err := http.Get("https://codeforces.com/api/problemset.problems")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Codeforces problemset"})
		return
	}
	defer resp.Body.Close()

	var ps CFProblemSet
	if err := json.NewDecoder(resp.Body).Decode(&ps); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode problemset"})
		return
	}

	// Filter problems within rating ± 200
	var pool []interface{}
	for _, p := range ps.Result.Problems {
		if p.Rating >= input.Rating-200 && p.Rating <= input.Rating+200 {
			pool = append(pool, p)
		}
	}

	if len(pool) < 4 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not enough problems found for this rating range"})
		return
	}

	// Randomly select 4
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(pool), func(i, j int) { pool[i], pool[j] = pool[j], pool[i] })

	c.JSON(http.StatusOK, gin.H{
		"target_rating": input.Rating,
		"problems":      pool[:4],
	})
}
