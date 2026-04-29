package services

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

// SubTask is one atomic unit of work identified by the Orchestrator.
type SubTask struct {
	Description string `json:"description"`
	TargetWing  string `json:"target_wing"`  // "CP", "ML", "Web", "App", "FOSS", "InfoSec"
	ActionType  string `json:"action_type"`  // "code_review" | "concept_nudge" | "routing" | "analysis"
}

// OrchestratorPlan is the full decomposition plan returned by DeepSeek.
type OrchestratorPlan struct {
	SubTasks []SubTask `json:"sub_tasks"`
	Summary  string    `json:"summary"` // One-line summary of what the user is asking
}

const orchestratorSystemPrompt = `You are the AXIOS-GO Routing Orchestrator — an internal AI planner, NOT a user-facing chatbot.

Your only job is to analyze the user's request and break it into 1-3 atomic sub-tasks that domain-specific sub-agents will execute.

STRICT RULES:
1. You MUST return ONLY raw JSON. No markdown, no backticks, no explanations outside JSON.
2. The JSON must exactly match this schema:
   {"sub_tasks":[{"description":"...","target_wing":"...","action_type":"..."}],"summary":"..."}
3. Valid target_wing values: "CP", "ML", "Web", "App", "FOSS", "InfoSec"
4. Valid action_type values: "code_review", "concept_nudge", "routing", "analysis"
5. NEVER include full code solutions in sub-task descriptions.
6. For CP or InfoSec: action_type must be "concept_nudge" — sub-agents will provide hints only.
7. Keep each sub-task description concise (1-2 sentences max).
8. summary must be one sentence describing the user's overall intent.`

func DecomposeTask(userPrompt string, weakConcepts string) (*OrchestratorPlan, error) {
	apiKey := os.Getenv("DEEPSEEK_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("DEEPSEEK_API_KEY is not set in environment")
	}

	var userMessage string
	if weakConcepts != "" {
		userMessage = fmt.Sprintf(
			"SHADOW MEMORY CONTEXT:\n%s\n\nUSER REQUEST:\n%s",
			weakConcepts,
			userPrompt,
		)
	} else {
		userMessage = fmt.Sprintf("USER REQUEST:\n%s", userPrompt)
	}

	rawText, err := CallOpenAICompatible("https://api.deepseek.com/v1/chat/completions", apiKey, "deepseek-reasoner", orchestratorSystemPrompt, userMessage)
	if err != nil {
		return nil, fmt.Errorf("orchestrator: DeepSeek API call failed: %w", err)
	}

	// Sanitize: strip any stray markdown backticks
	rawText = strings.TrimSpace(rawText)
	rawText = strings.TrimPrefix(rawText, "```json")
	rawText = strings.TrimPrefix(rawText, "```")
	rawText = strings.TrimSuffix(rawText, "```")
	rawText = strings.TrimSpace(rawText)

	start := strings.Index(rawText, "{")
	end := strings.LastIndex(rawText, "}")
	if start == -1 || end == -1 || end <= start {
		return nil, fmt.Errorf("orchestrator: DeepSeek did not return valid JSON. Raw response: %s", rawText)
	}
	rawText = rawText[start : end+1]

	var plan OrchestratorPlan
	if err := json.Unmarshal([]byte(rawText), &plan); err != nil {
		return nil, fmt.Errorf("orchestrator: failed to parse DeepSeek response: %w. Raw: %s", err, rawText)
	}

	if len(plan.SubTasks) == 0 {
		return nil, fmt.Errorf("orchestrator: DeepSeek returned an empty sub_tasks array")
	}

	return &plan, nil
}
