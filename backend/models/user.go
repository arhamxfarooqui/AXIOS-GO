package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name            string `json:"name"`
	Email           string `json:"email" gorm:"uniqueIndex"`
	Password        string `json:"-"`
	CollegeID       string `json:"college_id"`
	
	// Coding Profile Handles
	CodeforcesHandle string `json:"codeforces_handle"`
	CodechefHandle   string `json:"codechef_handle"`
	LeetcodeHandle   string `json:"leetcode_handle"`
	GithubHandle     string `json:"github_handle"`
	KaggleHandle     string `json:"kaggle_handle"`
	CTFHandle        string `json:"ctf_handle"`

	// Wing Interests (Stored as array of strings or can be a separate relation)
	Wings []string `json:"wings" gorm:"serializer:json"` 

    // Stats (Cached for leaderboards)
    CodeforcesRating int `json:"codeforces_rating"`
    CodechefRating   int `json:"codechef_rating"`
    LeetcodeRating   int `json:"leetcode_rating"` // or logic based on problems solved
    TotalSolved      int `json:"total_solved"`
    GithubRepos      int `json:"github_repos"`
}
