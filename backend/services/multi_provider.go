package services

import (
	"fmt"
	"os"
	"strings"
)

// Provider Constants
const (
	ProviderGroq     = "groq"
	ProviderDeepSeek = "deepseek"
)

// Personas
const (
	PersonaCodeSensei = "Logic Engine (CodeSensei)"
	PersonaArchitect  = "Architect (Dev Wing)"
	PersonaScout      = "Concept Lab (Scout)"
)

// MultiCall routes the request to the appropriate provider based on wing/task
func MultiCall(wing string, prompt string, systemPrompt string) (string, string, error) {
	var provider, model, persona string

	switch strings.ToLower(wing) {
	case "cp":
		provider = ProviderDeepSeek
		model = "deepseek-reasoner"
		persona = PersonaCodeSensei
	case "dev", "web":
		provider = ProviderGroq
		model = "qwen/qwen3-32b"
		persona = PersonaArchitect
	case "ml":
		provider = ProviderGroq
		model = "meta-llama/llama-4-scout-17b-16e-instruct"
		persona = PersonaScout
	default:
		provider = ProviderDeepSeek
		model = "deepseek-reasoner"
		persona = "AXIOS Core (DeepSeek)"
	}

	apiKey := getProviderKey(provider)
	if apiKey == "" {
		// Fallback to whichever key exists
		if os.Getenv("GROQ_API_KEY") != "" {
			provider = ProviderGroq
			model = "llama-3.3-70b-versatile"
			apiKey = os.Getenv("GROQ_API_KEY")
		} else {
			provider = ProviderDeepSeek
			model = "deepseek-reasoner"
			apiKey = os.Getenv("DEEPSEEK_API_KEY")
		}
	}

	var response string
	var err error

	switch provider {
	case ProviderGroq:
		response, err = CallOpenAICompatible("https://api.groq.com/openai/v1/chat/completions", apiKey, model, systemPrompt, prompt)
	case ProviderDeepSeek:
		response, err = CallOpenAICompatible("https://api.deepseek.com/v1/chat/completions", apiKey, model, systemPrompt, prompt)
	}

	// FALLBACK LOGIC: If the primary choice fails (e.g. 402 Insufficient Balance), try the alternative
	if err != nil {
		fmt.Printf("--- Provider %s failed (%v). Attempting global fallback ---\n", provider, err)
		
		if provider == ProviderDeepSeek {
			// DeepSeek failed -> Try Groq
			groqKey := os.Getenv("GROQ_API_KEY")
			if groqKey != "" {
				response, err = CallOpenAICompatible("https://api.groq.com/openai/v1/chat/completions", groqKey, "llama-3.3-70b-versatile", systemPrompt, prompt)
				if err == nil {
					persona = persona + " (Groq Fallback)"
					return response, persona, nil
				}
			}
		} else if provider == ProviderGroq {
			// Groq failed -> Try DeepSeek
			dsKey := os.Getenv("DEEPSEEK_API_KEY")
			if dsKey != "" {
				response, err = CallOpenAICompatible("https://api.deepseek.com/v1/chat/completions", dsKey, "deepseek-reasoner", systemPrompt, prompt)
				if err == nil {
					persona = persona + " (DeepSeek Fallback)"
					return response, persona, nil
				}
			}
		}
	}

	return response, persona, err
}

func getProviderKey(provider string) string {
	switch provider {
	case ProviderGroq:
		return os.Getenv("GROQ_API_KEY")
	case ProviderDeepSeek:
		return os.Getenv("DEEPSEEK_API_KEY")
	default:
		return ""
	}
}
