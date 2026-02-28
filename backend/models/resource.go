package models

import "gorm.io/gorm"

type Resource struct {
	gorm.Model
	Title       string `json:"title"`
	Description string `json:"description"`
	Link        string `json:"link"`
	Type        string `json:"type"` // e.g., "Paper", "Slide", "Video"
	Year        int    `json:"year"`
	Subject     string `json:"subject"`
}
