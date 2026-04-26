package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name      string `json:"name"`
	Email     string `json:"email" gorm:"uniqueIndex"`
	Password  string `json:"-"`
	CollegeID string `json:"college_id"`

	// Coding Profile Handles (LeetCode removed — no stable public API)
	CodeforcesHandle string `json:"codeforces_handle"`
	CodechefHandle   string `json:"codechef_handle"`
	GithubHandle     string `json:"github_handle"`
	KaggleHandle     string `json:"kaggle_handle"`
	CTFHandle        string `json:"ctf_handle"`

	// Wing Interests — stored as a JSON array in Postgres
	// Standard Wing IDs: "CP", "ML", "Web", "App", "FOSS", "InfoSec"
	Wings []string `json:"wings" gorm:"serializer:json"`

	// Stats (cached for leaderboards — refreshed via /api/user/refresh)
	CodeforcesRating int `json:"codeforces_rating"`
	CodechefRating   int `json:"codechef_rating"`
	TotalSolved      int `json:"total_solved"`
	GithubRepos      int `json:"github_repos"`

	// Phase 1: Unified Axios Rating — computed by the normalization engine
	AxiosRating int `json:"axios_rating" gorm:"default:0"`

	// Phase 1: Lightweight admin flag — no full RBAC yet
	IsAdmin bool `json:"is_admin" gorm:"default:false"`
}
