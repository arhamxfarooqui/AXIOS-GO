package services

import (
	"axios-backend/database"
	"axios-backend/models"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// SyncUserUpsolves fetches recent submissions for a specific user and populates the UpsolveTask table.
func SyncUserUpsolves(user *models.User) error {
	if user.CodeforcesHandle == "" {
		return fmt.Errorf("no Codeforces handle linked")
	}

	log.Printf("[SYNC] Syncing upsolves for user: %s (%s)", user.Name, user.CodeforcesHandle)

	// Fetch recent 20 submissions
	url := fmt.Sprintf("https://codeforces.com/api/user.status?handle=%s&from=1&count=20", user.CodeforcesHandle)
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("error fetching status: %w", err)
	}
	defer resp.Body.Close()

	var cfResp CFStatusResponse
	if err := json.NewDecoder(resp.Body).Decode(&cfResp); err != nil {
		return fmt.Errorf("error decoding JSON: %w", err)
	}

	if cfResp.Status != "OK" {
		return fmt.Errorf("CF API error: %s", cfResp.Comment)
	}

	// Identify non-OK verdicts
	for _, sub := range cfResp.Result {
		if sub.Verdict == "OK" || sub.Verdict == "TESTING" {
			continue
		}

		problemURL := fmt.Sprintf("https://codeforces.com/contest/%d/problem/%s", sub.Problem.ContestId, sub.Problem.Index)

		// Check if task already exists for this user
		var existing models.UpsolveTask
		err := database.DB.Where("user_id = ? AND problem_url = ?", user.ID, problemURL).First(&existing).Error
		if err == nil {
			// Already in queue
			continue
		}

		// Create new UpsolveTask
		tagsJSON, _ := json.Marshal(sub.Problem.Tags)
		newTask := models.UpsolveTask{
			UserID:      user.ID,
			ProblemURL:  problemURL,
			ProblemName: sub.Problem.Name,
			ContestID:   sub.Problem.ContestId,
			Rating:      sub.Problem.Rating,
			Tags:        string(tagsJSON),
			Status:      "pending",
		}

		if err := database.DB.Create(&newTask).Error; err != nil {
			log.Printf("[SYNC] Error creating UpsolveTask: %v", err)
		}
	}

	return nil
}
