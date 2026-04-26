package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"google.golang.org/genai"
)

// ---------------------------------------------------------------------------
// Types — the strict JSON schema Gemini must return
// ---------------------------------------------------------------------------

// SubTask is one atomic unit of work identified by the Orchestrator.
type SubTask struct {
	Description string `json:"description"`
	TargetWing  string `json:"target_wing"`  // "CP", "ML", "Web", "App", "FOSS", "InfoSec"
	ActionType  string `json:"action_type"`  // "code_review" | "concept_nudge" | "routing" | "analysis"
}

// OrchestratorPlan is the full decomposition plan returned by Gemini.
type OrchestratorPlan struct {
	SubTasks []SubTask `json:"sub_tasks"`
	Summary  string    `json:"summary"` // One-line summary of what the user is asking
}

// ---------------------------------------------------------------------------
// System Prompt — the strict persona/rules for Gemini as Orchestrator
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// DecomposeTask — the main orchestration function
// ---------------------------------------------------------------------------

// DecomposeTask sends the user's prompt and their shadow memory context to
// Gemini (acting as the Orchestrator). Gemini returns a strict JSON plan
// which is then parsed into an OrchestratorPlan struct.
//
// weakConcepts should be the output of FormatContextString() — an empty string
// is valid and means no known weaknesses have been recorded yet.
func DecomposeTask(userPrompt string, weakConcepts string) (*OrchestratorPlan, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY is not set in environment")
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey: apiKey,
	})
	if err != nil {
		return nil, fmt.Errorf("orchestrator: failed to create Gemini client: %w", err)
	}

	// Build the full user message, injecting shadow memory context if available
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

	// Combine system prompt + user message into a single prompt for Gemini.
	// We use a single-turn approach since Gemini's genai SDK handles it cleanly.
	fullPrompt := fmt.Sprintf("%s\n\n%s", orchestratorSystemPrompt, userMessage)

	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-1.5-flash",
		genai.Text(fullPrompt),
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("orchestrator: Gemini API call failed: %w", err)
	}

	rawText := result.Text()

	// Sanitize: strip any stray markdown backticks Gemini might add despite instructions
	rawText = strings.TrimSpace(rawText)
	rawText = strings.TrimPrefix(rawText, "```json")
	rawText = strings.TrimPrefix(rawText, "```")
	rawText = strings.TrimSuffix(rawText, "```")
	rawText = strings.TrimSpace(rawText)

	// Extract only the JSON object in case there is leading/trailing text
	start := strings.Index(rawText, "{")
	end := strings.LastIndex(rawText, "}")
	if start == -1 || end == -1 || end <= start {
		return nil, fmt.Errorf("orchestrator: Gemini did not return valid JSON. Raw response: %s", rawText)
	}
	rawText = rawText[start : end+1]

	// Parse into struct
	var plan OrchestratorPlan
	if err := json.Unmarshal([]byte(rawText), &plan); err != nil {
		return nil, fmt.Errorf("orchestrator: failed to parse Gemini response into OrchestratorPlan: %w. Raw: %s", err, rawText)
	}

	// Validate — ensure we got at least one sub-task
	if len(plan.SubTasks) == 0 {
		return nil, fmt.Errorf("orchestrator: Gemini returned an empty sub_tasks array")
	}

	return &plan, nil
}
