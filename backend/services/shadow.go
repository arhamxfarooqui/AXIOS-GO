package services

import (
	"fmt"
	"strings"
	"time"

	"axios-backend/database"
	"axios-backend/models"
)

// GetWeakConcepts returns the top 3 weakest concepts for a user in a given domain.
// "Weakest" = lowest Proficiency score. Used to inject context into every AI prompt.
func GetWeakConcepts(userID uint, domain string) ([]models.ShadowMemory, error) {
	var concepts []models.ShadowMemory
	err := database.DB.
		Where("user_id = ? AND domain = ?", userID, domain).
		Order("proficiency ASC").
		Limit(3).
		Find(&concepts).Error
	if err != nil {
		return nil, fmt.Errorf("shadow memory query failed: %w", err)
	}
	return concepts, nil
}

// UpdateProficiency upserts a concept's proficiency score for a user in a domain.
// If the concept already exists, it updates the score and LastNotedAt timestamp.
// If not, it creates a new entry.
func UpdateProficiency(userID uint, domain string, concept string, score int) error {
	// Clamp score to valid range [1, 10]
	if score < 1 {
		score = 1
	}
	if score > 10 {
		score = 10
	}

	var existing models.ShadowMemory
	result := database.DB.
		Where("user_id = ? AND domain = ? AND concept = ?", userID, domain, concept).
		First(&existing)

	if result.Error != nil {
		// Record doesn't exist — create it
		newEntry := models.ShadowMemory{
			UserID:      userID,
			Domain:      domain,
			Concept:     concept,
			Proficiency: score,
			LastNotedAt: time.Now(),
		}
		if err := database.DB.Create(&newEntry).Error; err != nil {
			return fmt.Errorf("failed to create shadow memory entry: %w", err)
		}
		return nil
	}

	// Record exists — update it
	if err := database.DB.Model(&existing).Updates(map[string]interface{}{
		"proficiency":   score,
		"last_noted_at": time.Now(),
	}).Error; err != nil {
		return fmt.Errorf("failed to update shadow memory entry: %w", err)
	}
	return nil
}

// FormatContextString converts a slice of ShadowMemory entries into a concise
// natural language string to be pre-pended to any LLM system prompt.
// Example output:
//
//	"User struggles with: Dynamic Programming (Score: 3/10), Segment Trees (Score: 4/10)"
func FormatContextString(concepts []models.ShadowMemory) string {
	if len(concepts) == 0 {
		return ""
	}

	var parts []string
	for _, c := range concepts {
		parts = append(parts, fmt.Sprintf("%s (Score: %d/10)", c.Concept, c.Proficiency))
	}

	return fmt.Sprintf("User's known weak concepts: %s.", strings.Join(parts, ", "))
}
