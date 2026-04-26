package models

import (
	"time"

	"gorm.io/gorm"
)

// ShadowMemory powers the AI's long-term context retention.
// Each row tracks how proficient a specific user is in a specific concept
// within a domain (wing). Before any AI sub-agent call, the orchestrator
// queries this table to inject weakness context into the system prompt.
type ShadowMemory struct {
	gorm.Model

	// UserID links to the User who owns this memory entry
	UserID uint `json:"user_id" gorm:"index;not null"`

	// Domain maps to a Wing ID: "CP", "ML", "Web", "App", "FOSS", "InfoSec"
	Domain string `json:"domain" gorm:"not null"`

	// Concept is the specific technical topic, e.g. "Dynamic Programming", "SQL Injection"
	Concept string `json:"concept" gorm:"not null"`

	// Proficiency is a 1-10 scale set by the AI after evaluating user performance.
	// 1 = severe weakness, 10 = mastery. The orchestrator prioritizes concepts below 5.
	Proficiency int `json:"proficiency" gorm:"not null;default:5"`

	// LastNotedAt tracks when this concept was last observed/updated by the AI
	LastNotedAt time.Time `json:"last_noted_at"`
}
