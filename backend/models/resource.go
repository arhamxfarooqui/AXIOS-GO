package models

import "gorm.io/gorm"

type Resource struct {
	gorm.Model

	// --- Existing Fields (Preserved) ---
	Title       string `json:"title"`
	Description string `json:"description"`
	Link        string `json:"link"`  // Original URL field — kept for backwards compatibility
	Type        string `json:"type"`  // e.g., "Paper", "Slide", "Video", "video", "repo", "pdf", "article"
	Year        int    `json:"year"`
	Subject     string `json:"subject"`

	// --- Phase 1 Extensions ---
	// WingID scopes this resource to a specific wing: "CP", "ML", "Web", "App", "FOSS", "InfoSec"
	WingID string `json:"wing_id" gorm:"index"`

	// SubmittedByID tracks which user contributed this resource (0 = admin/seeded)
	SubmittedByID uint `json:"submitted_by_id"`

	// Upvotes allows community curation of the resource hub
	Upvotes int `json:"upvotes" gorm:"default:0"`

	// DifficultyLevel for resource filtering: "beginner", "intermediate", "advanced"
	DifficultyLevel string `json:"difficulty_level"`
}
