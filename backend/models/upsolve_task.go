package models

import "gorm.io/gorm"

// UpsolveTask represents a problem the user failed during a Codeforces contest.
// The background cron worker (robfig/cron, every 4h) fetches recent submissions,
// filters for non-"OK" verdicts, deduplicates, and populates this table.
// The CP Wing UI surfaces this as a personalized "upsolve queue".
type UpsolveTask struct {
	gorm.Model

	// UserID links to the user who failed this problem
	UserID uint `json:"user_id" gorm:"index;not null"`

	// ProblemURL is the direct Codeforces link, e.g. https://codeforces.com/contest/1234/problem/A
	ProblemURL string `json:"problem_url"`

	// ProblemName is the human-readable name for the UI, e.g. "Beautiful Matrix"
	ProblemName string `json:"problem_name"`

	// ContestID is the Codeforces contest number (used for deduplication)
	ContestID int `json:"contest_id"`

	// Rating is the official Codeforces difficulty rating of the problem
	Rating int `json:"rating"`

	// Tags stores the problem's topic tags as a JSON string array, e.g. '["dp","graphs"]'
	// Stored as text instead of a separate relation to keep the schema simple for Phase 1.
	Tags string `json:"tags" gorm:"type:text"`

	// Status tracks the user's progress on this task.
	// Allowed values: "pending" (default), "solved", "skipped"
	Status string `json:"status" gorm:"default:'pending'"`
}
