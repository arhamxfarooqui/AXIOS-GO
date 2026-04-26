package workers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"axios-backend/database"
	"axios-backend/models"
	"axios-backend/services"

	"github.com/robfig/cron/v3"
)

// StartCronJobs initializes and starts the background task scheduler.
func StartCronJobs() {
	c := cron.New()

	// Task 1: Codeforces Upsolve Engine (Every 4 hours)
	// Schedule: At minute 0 of every 4th hour
	_, err := c.AddFunc("0 */4 * * *", syncCodeforcesUpsolves)
	if err != nil {
		log.Fatalf("Failed to schedule Codeforces Upsolve job: %v", err)
	}

	c.Start()
	log.Println("Background cron workers started successfully")
}

// syncCodeforcesUpsolves iterates through all users, fetches their recent 
// submissions, and populates the UpsolveTask table with non-OK results.
func syncCodeforcesUpsolves() {
	log.Println("[CRON] Starting Codeforces Upsolve sync...")

	var users []models.User
	if err := database.DB.Where("codeforces_handle != ?", "").Find(&users).Error; err != nil {
		log.Printf("[CRON] Error fetching users from DB: %v", err)
		return
	}

	for _, user := range users {
		log.Printf("[CRON] Syncing upsolves for user: %s (%s)", user.Name, user.CodeforcesHandle)
		
		// 1. Fetch recent 20 submissions
		url := fmt.Sprintf("https://codeforces.com/api/user.status?handle=%s&from=1&count=20", user.CodeforcesHandle)
		resp, err := http.Get(url)
		if err != nil {
			log.Printf("[CRON] Error fetching status for %s: %v", user.CodeforcesHandle, err)
			continue
		}

		var cfResp services.CFStatusResponse
		if err := json.NewDecoder(resp.Body).Decode(&cfResp); err != nil {
			resp.Body.Close()
			log.Printf("[CRON] Error decoding JSON for %s: %v", user.CodeforcesHandle, err)
			continue
		}
		resp.Body.Close()

		if cfResp.Status != "OK" {
			log.Printf("[CRON] CF API returned error for %s: %s", user.CodeforcesHandle, cfResp.Comment)
			continue
		}

		// 2. Identify non-OK verdicts
		for _, sub := range cfResp.Result {
			// Verdicts like WRONG_ANSWER, TIME_LIMIT_EXCEEDED, etc.
			// OK means they already solved it.
			if sub.Verdict == "OK" || sub.Verdict == "TESTING" {
				continue
			}

			problemURL := fmt.Sprintf("https://codeforces.com/contest/%d/problem/%s", sub.Problem.ContestId, sub.Problem.Index)

			// 3. Check if task already exists for this user
			var existing models.UpsolveTask
			err := database.DB.Where("user_id = ? AND problem_url = ?", user.ID, problemURL).First(&existing).Error
			if err == nil {
				// Already in queue
				continue
			}

			// 4. Create new UpsolveTask
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
				log.Printf("[CRON] Error creating UpsolveTask for %s: %v", user.CodeforcesHandle, err)
			}
		}

		// Respect rate limits
		time.Sleep(1 * time.Second)
	}

	log.Println("[CRON] Codeforces Upsolve sync completed.")
}
