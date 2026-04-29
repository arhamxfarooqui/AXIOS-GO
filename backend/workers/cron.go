package workers

import (
	"log"
	"time"

	"axios-backend/database"
	"axios-backend/models"
	"axios-backend/services"
	"axios-backend/utils"

	"github.com/robfig/cron/v3"
)

// StartCronJobs initializes and starts the background task scheduler.
func StartCronJobs() {
	c := cron.New()

	// Task 1: Codeforces Upsolve Engine (Every 4 hours)
	_, err := c.AddFunc("0 */4 * * *", syncCodeforcesUpsolves)
	if err != nil {
		log.Fatalf("Failed to schedule Codeforces Upsolve job: %v", err)
	}

	// Task 2: Global Rating Sync (Every day at midnight)
	_, err = c.AddFunc("0 0 * * *", SyncGlobalRatings)
	if err != nil {
		log.Fatalf("Failed to schedule Global Rating sync: %v", err)
	}

	c.Start()
	log.Println("Background cron workers started successfully")
}

// SyncGlobalRatings refreshes metrics for all users and updates their AxiosRating.
func SyncGlobalRatings() {
	log.Println("[CRON] Starting Global Rating synchronization...")

	var users []models.User
	if err := database.DB.Find(&users).Error; err != nil {
		log.Printf("[CRON] Error fetching users for rating sync: %v", err)
		return
	}

	for _, user := range users {
		// 1. Fetch fresh stats
		// Using existing UpdateUserStats from services/fetcher.go
		if err := services.UpdateUserStats(&user); err != nil {
			log.Printf("[CRON] Failed to fetch fresh stats for %s: %v", user.Email, err)
			continue
		}

		// 2. Calculate Axios Rating
		// githubPRs is simulated for now as it's not in the model yet
		newRating := utils.CalculateAxiosRating(
			user.CodeforcesRating,
			user.TotalSolved,
			user.GithubRepos,
			0, // PRs placeholder
		)

		// 3. Update DB
		database.DB.Model(&user).Updates(models.User{
			CodeforcesRating: user.CodeforcesRating,
			TotalSolved:      user.TotalSolved,
			GithubRepos:      user.GithubRepos,
			AxiosRating:      newRating,
		})

		time.Sleep(500 * time.Millisecond) // Be gentle
	}

	log.Println("[CRON] Global Rating synchronization completed.")
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
		services.SyncUserUpsolves(&user)
		// Respect rate limits
		time.Sleep(1 * time.Second)
	}

	log.Println("[CRON] Codeforces Upsolve sync completed.")
}
