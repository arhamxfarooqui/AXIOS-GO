package services

import (
	"fmt"
	"os"
	"strings"
)

type RoadmapRequest struct {
	CFRating     int      `json:"cf_rating"`
	TotalSolved  int      `json:"total_solved"`
	Wings        []string `json:"wings"`
	TopLanguages []string `json:"top_languages"`
	TopRepo      string   `json:"top_repo"`
	KaggleStatus string   `json:"kaggle_status"`
	CTFStatus    string   `json:"ctf_status"`
}

func GenerateRoadmap(stats RoadmapRequest) (string, error) {
	apiKey := os.Getenv("DEEPSEEK_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("DEEPSEEK_API_KEY not set")
	}

	systemPrompt := `You are the AXIOS Roadmap Generator. Analyze the user's current stats and Shadow Memory to output a strictly valid JSON roadmap.
Output strictly valid JSON only. No markdown formatting, no explanatory text.`

	userPrompt := fmt.Sprintf(`
Generate a rigorous **12-week Technical Roadmap** for a student with these stats:
- Codeforces Rating: %d (Total Solved: %d)
- Interested Wings: %v
- Top Languages: %s

The roadmap must be divided into 3 Phases (4 weeks each).

REQUIRED JSON STRUCTURE:
{
  "current_level": "Beginner/Intermediate/Advanced",
  "summary": "Brief analysis of their technical profile.",
  "phases": [
    {
      "phase_name": "Phase 1: [Name] (Weeks 1-4)",
      "goal": "Specific goal (e.g., Reach Specialist, Master React, Kaggle Bronze)",
      "weeks": [
        {
          "week": 1,
          "theme": "Graph Theory / Frontend / ML Basics",
          "goals": ["Goal 1", "Goal 2"],
          "resources": [
             {"title": "Resource Title", "url": "https://..."}
          ],
          "tips": "Context-specific advice."
        }
      ]
    }
  ]
}
`, stats.CFRating, stats.TotalSolved, stats.Wings, strings.Join(stats.TopLanguages, ", "))

	response, err := CallOpenAICompatible("https://api.deepseek.com/v1/chat/completions", apiKey, "deepseek-reasoner", systemPrompt, userPrompt)
	if err != nil {
		fmt.Printf("Roadmap: DeepSeek failed (%v). Falling back to Groq\n", err)
		groqKey := os.Getenv("GROQ_API_KEY")
		if groqKey != "" {
			response, err = CallOpenAICompatible("https://api.groq.com/openai/v1/chat/completions", groqKey, "llama-3.3-70b-versatile", systemPrompt, userPrompt)
		}
		if err != nil {
			return "", err
		}
	}

	// Clean up JSON if model adds markdown wrappers
	text := strings.TrimSpace(response)
	start := strings.Index(text, "{")
	end := strings.LastIndex(text, "}")
	if start != -1 && end != -1 && end > start {
		text = text[start : end+1]
	}

	return text, nil
}
