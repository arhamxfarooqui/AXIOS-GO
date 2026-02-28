package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

const HF_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions"

// OpenAI-compatible structs
type ChatMessage struct {
    Role    string `json:"role"`
    Content string `json:"content"`
}

type ChatRequest struct {
    Model       string        `json:"model"`
    Messages    []ChatMessage `json:"messages"`
    MaxTokens   int           `json:"max_tokens"`
    Temperature float64       `json:"temperature"`
    Stream      bool          `json:"stream"`
}

type ChatResponse struct {
    Choices []struct {
        Message struct {
            Content string `json:"content"`
        } `json:"message"`
    } `json:"choices"`
}

func ValidateTokenHF(token string) error {
	// Bypass strict validation as requested, just check prefix since the token works
    if !strings.HasPrefix(token, "hf_") {
        return fmt.Errorf("invalid token format")
    }
	return nil
}

func GenerateRoadmapHF(token string, stats RoadmapRequest) (string, error) {
	systemPrompt := `You are an expert Competitive Programming (CP) coach. 
Your ONLY goal is to help the student improve their Codeforces rating. 
Do NOT generate roadmaps for Web Development, AI, or InfoSec, even if the user has those interests.
Focus EXCLUSIVELY on Data Structures, Algorithms, and Math for CP.
Output strictly valid JSON only. No markdown formatting, no explanatory text.`

	userPrompt := fmt.Sprintf(`
Generate a rigorous **12-week Competitive Programming roadmap** for a student with these stats:
- Codeforces Rating: %d (Total Solved: %d)
- Current Level: %s
- Top Languages: %s

IGNORE the user's "Wings" or "Projects". This is purely for CP improvement.

The roadmap must be divided into 3 Phases (4 weeks each).

REQUIRED JSON STRUCTURE:
{
  "current_level": "Beginner/Intermediate/Advanced",
  "summary": "Brief analysis of their CP profile.",
  "phases": [
    {
      "phase_name": "Phase 1: [Name] (Weeks 1-4)",
      "goal": "Specific CP goal (e.g., Reach Specialist, Master DP)",
      "weeks": [
        {
          "week": 1,
          "theme": "Graph Theory / DP / Math",
          "goals": ["Solve 5 *800 problems", "Learn BFS"],
          "resources": [
             {"title": "CP-Algorithms: BFS", "url": "https://cp-algorithms.com/..."}
          ],
          "tips": "Focus on implementation speed."
        }
      ]
    }
  ]
}
Make resources specific and high quality (CP-Algorithms, USACO Guide, Codeforces Blogs).
`, stats.CFRating, stats.TotalSolved, "Determined by Rating", strings.Join(stats.TopLanguages, ", "))

    // Build OpenAI-style Request
    reqBody := ChatRequest{
        Model: HF_MODEL,
        Messages: []ChatMessage{
            {Role: "system", Content: systemPrompt},
            {Role: "user", Content: userPrompt},
        },
        MaxTokens:   2048,
        Temperature: 0.7,
        Stream:      false,
    }

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, _ := http.NewRequest("POST", HF_API_URL, bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("hugging face api error: %d - %s", resp.StatusCode, string(body))
	}

	var chatResp ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return "", err
	}

	if len(chatResp.Choices) == 0 {
		return "", fmt.Errorf("no content generated")
	}

	// Clean up JSON
	text := chatResp.Choices[0].Message.Content
	text = strings.TrimSpace(text)
	text = strings.TrimPrefix(text, "```json")
	text = strings.TrimPrefix(text, "```")
	text = strings.TrimSuffix(text, "```")
	
    // Sometimes models add extra text
    start := strings.Index(text, "{")
    end := strings.LastIndex(text, "}")
    if start != -1 && end != -1 && end > start {
        text = text[start : end+1]
    }

	return text, nil
}

func ChatWithCoachHF(token string, systemContext string, userQuery string) (string, error) {
    // Build OpenAI-style Request
    reqBody := ChatRequest{
        Model: HF_MODEL,
        Messages: []ChatMessage{
            {Role: "system", Content: systemContext},
            {Role: "user", Content: userQuery},
        },
        MaxTokens:   1024, // Chat messages are shorter
        Temperature: 0.7,
        Stream:      false,
    }

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, _ := http.NewRequest("POST", HF_API_URL, bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("hugging face api error: %d - %s", resp.StatusCode, string(body))
	}

	var chatResp ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return "", err
	}

	if len(chatResp.Choices) == 0 {
		return "", fmt.Errorf("no content generated")
	}

	return chatResp.Choices[0].Message.Content, nil
}


