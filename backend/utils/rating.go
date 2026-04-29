package utils

import "math"

// CalculateAxiosRating standardizes cross-domain achievements into a single integer score.
// Weights for Phase 1:
// - Codeforces Rating: 50% weight (base metric)
// - Codeforces Problems Solved: 5 points each
// - GitHub Repos: 20 points each
// - GitHub PRs (Simulated in Phase 1 by Repo activity): 50 points each
func CalculateAxiosRating(cfRating int, cfSolved int, githubRepos int, githubPRs int) int {
	// 1. Handle unrated users (CF returns 0 or -1 for unrated)
	normalizedCF := float64(cfRating)
	if normalizedCF <= 0 {
		normalizedCF = 0
	}

	// 2. Base Calculation
	// (cfRating * 0.5) + (cfSolved * 5) + (githubRepos * 20) + (githubPRs * 50)
	score := (normalizedCF * 0.5) + 
			 (float64(cfSolved) * 5.0) + 
			 (float64(githubRepos) * 20.0) + 
			 (float64(githubPRs) * 50.0)

	// 3. Round to nearest integer
	return int(math.Round(score))
}
