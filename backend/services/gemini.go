package services

import (
	"context"
	"fmt"
	"log"
    "strings"
    "errors"
    "net/http"
    "encoding/json"
    "bytes"
    "io"

	"google.golang.org/genai"
    "google.golang.org/api/iterator"
)

func ValidateKey(apiKey string) ([]string, error) {
    fmt.Println("--- DEBUG: ValidateKey called (Hybrid v3) ---")
    ctx := context.Background()
    if apiKey == "" {
        return nil, fmt.Errorf("API key is required")
    }

    client, err := genai.NewClient(ctx, &genai.ClientConfig{
        APIKey: apiKey,
    })
    if err != nil {
        return nil, fmt.Errorf("failed to create client: %v", err)
    }

    var validModels []string

    // Strategy 1: Dynamic Listing (Preferred)
    // We try to list models. If this fails (e.g. key has no list permission? or strange 400 error?), 
    // we log it and proceed to Strategy 2.
    iter, err := client.Models.List(ctx, nil)
    if err == nil {
        for {
            model, err := iter.Next(ctx)
            if errors.Is(err, iterator.Done) {
                break
            }
            if err != nil {
                // If it fails mid-stream, just stop listing and keep what we have
                log.Printf("Listing stopped early: %v", err)
                break
            }

            if strings.Contains(strings.ToLower(model.Name), "gemini") {
                cleanName := strings.TrimPrefix(model.Name, "models/")
                validModels = append(validModels, cleanName)
            }
        }
    } else {
        log.Printf("ListModels failed completely: %v. proceed to probing.", err)
    }

    // Strategy 2: Probing (Fallback)
    // If Listing failed to find any models (or crashed), we manually probe common models.
    var probeErrors []string
    if len(validModels) == 0 {
        candidates := []string{
            "gemini-1.5-flash", 
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-1.5-flash-8b",
            "gemini-1.5-pro", 
            "gemini-1.5-pro-latest",
            "gemini-1.5-pro-001",
            "gemini-1.5-pro-002",
            "gemini-2.0-flash-exp",
        }
        
        for _, model := range candidates {
             _, err := client.Models.GenerateContent(ctx, model, genai.Text("Hi"), nil)
             if err == nil {
                 validModels = append(validModels, model)
             } else {
                 errMsg := fmt.Sprintf("[%s: %v]", model, err)
                 
                // CRITICAL FIX: If the error is 429 (Quota Exceeded), the key IS valid and the model EXISTS.
                 // We should accept this as a valid connection so the user can get into the UI.
                 if strings.Contains(strings.ToLower(errMsg), "429") || 
                    strings.Contains(strings.ToLower(errMsg), "quota") || 
                    strings.Contains(strings.ToLower(errMsg), "exhausted") {
                     validModels = append(validModels, model)
                     log.Printf("Model %s is valid but rate limited (429). Adding anyway.", model)
                     // FOUND ONE! Stop probing to save quota.
                     break
                 } else {
                     probeErrors = append(probeErrors, errMsg)
                     log.Println("Probe failed:", errMsg)
                 }
             }
             
             // Optimization: If we found a model, stop.
             if len(validModels) > 0 {
                 break
             }
        }
    }

    // FINAL FALLBACK (Optimistic):
    // If we still have no valid models, but the error wasn't strictly "API Key Invalid", 
    // we should just let the user in. It's better to fail during Chat (where they can see the specific error)
    // than to block them here.
    // We only block if we are 100% sure the key is garbage.
    if len(validModels) == 0 {
        // Check if any error clearly stated "API_KEY_INVALID"
        allErrors := strings.Join(probeErrors, " ")
        if strings.Contains(allErrors, "API_KEY_INVALID") {
             return nil, fmt.Errorf("API Key is invalid. Please check your key.")
        }
        
        // Otherwise (Quota, 404s, Network issues), assume it's fine and return defaults.
        fmt.Println("Validation failed but assuming valid key (Optimistic Mode). returning default models.")
        return []string{"gemini-1.5-flash", "gemini-1.5-pro"}, nil
    }

    if len(validModels) == 0 {
        // This is unreachable due to above logic, but keeping for safety
        return nil, fmt.Errorf("no supported models found. Probe errors: %s", strings.Join(probeErrors, "; "))
    }

    // Sort: Preferred models (Flash/Pro) first
    preferred := []string{}
    others := []string{}
    
    unique := make(map[string]bool)
    for _, m := range validModels {
        if unique[m] { continue }
        unique[m] = true
        
        if strings.Contains(m, "flash") || strings.Contains(m, "1.5-pro") {
            preferred = append(preferred, m)
        } else {
            others = append(others, m)
        }
    }
    
    return append(preferred, others...), nil
}

func GenerateCoachingResponse(apiKey string, modelName string, systemContext string, userQuery string) (string, error) {
    ctx := context.Background()

    if apiKey == "" {
        return "", fmt.Errorf("API key is required")
    }
    
    if modelName == "" {
        modelName = "gemini-1.5-flash"
    }

    // Initialize the client with the provided API key
    client, err := genai.NewClient(ctx, &genai.ClientConfig{
        APIKey: apiKey,
    })
    if err != nil {
        return "", fmt.Errorf("failed to create gemini client: %v", err)
    }

    // Combine context and query
    finalPrompt := fmt.Sprintf("%s\n\nUser Question: %s", systemContext, userQuery)

    // Call the API
    result, err := client.Models.GenerateContent(
        ctx,
        modelName,
        genai.Text(finalPrompt),
        nil,
    )
    if err != nil {
        log.Printf("Gemini API Error: %v", err)
        return "", err
    }

    return result.Text(), nil
}

type RoadmapRequest struct {
    CFRating       int      `json:"cf_rating"`
    Wings          []string `json:"wings"`
    TopLanguages   []string `json:"top_languages"`
    TopRepo        string   `json:"top_repo"`
    TotalSolved    int      `json:"total_solved"`
    KaggleStatus   string   `json:"kaggle_status"`
    CTFStatus      string   `json:"ctf_status"`
}

func GenerateRoadmap(apiKey string, stats RoadmapRequest) (string, error) {
    // 1. Construct the prompt
    prompt := fmt.Sprintf(`
    You are an expert competitive programming and tech career coach.
    Generate a comprehensive **12-week structured learning roadmap** for a student with these stats:
    - Codeforces Rating: %d (Total Solved: %d)
    - Preferred Languages: %s
    - Notable Project: %s
    - Interests (Wings): %s
    - Access to Kaggle: %s
    - Access to CTFs: %s

    Output STRICT JSON format ONLY. No markdown, no "json" label.
    The roadmap must be divided into 3 Phases (4 weeks each).

    Structure:
    {
      "current_level": "Beginner/Intermediate/Advanced",
      "summary": "Brief 1-sentence analysis of where they stand.",
      "phases": [
        {
          "phase_name": "Phase 1: Foundation Building (Weeks 1-4)",
          "goal": "Solidify basics and graph traversal",
          "weeks": [
            {
              "week": 1,
              "theme": "Graph Theory Basics",
              "goals": ["Learn BFS/DFS", "Solve 3 easy problems"],
              "resources": [
                 {"title": "CP-Algorithms BFS", "url": "..."}
              ],
              "tips": "Focus on implementation details."
            }
          ]
        },
        {
          "phase_name": "Phase 2: Skill Development (Weeks 5-8)",
          "goal": "Dynamic Programming and Trees",
          "weeks": [] 
        },
        {
          "phase_name": "Phase 3: Mastering & Refinement (Weeks 9-12)",
          "goal": "Advanced Topics and Virtual Contests",
          "weeks": []
        }
      ]
    }
    Make the resources specific and high quality (CP-Algorithms, O'Reilly, etc).
    `, stats.CFRating, stats.TotalSolved, strings.Join(stats.TopLanguages, ", "), stats.TopRepo, strings.Join(stats.Wings, ", "), stats.KaggleStatus, stats.CTFStatus)

    // 2. Prepare JSON body for REST API
    reqBody, err := json.Marshal(map[string]interface{}{
        "contents": []interface{}{
            map[string]interface{}{
                "parts": []interface{}{
                     map[string]string{"text": prompt},
                },
            },
        },
    })
    if err != nil {
        return "", fmt.Errorf("failed to marshal request: %v", err)
    }

    // 3. Make Direct HTTP Request to v1 Endpoint (Gemini 1.5 Flash)
    url := "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + apiKey
    resp, err := http.Post(url, "application/json", bytes.NewBuffer(reqBody))
    if err != nil {
        return "", fmt.Errorf("failed to call Gemini API: %v", err)
    }
    defer resp.Body.Close()

    // 4. Parse Response
    if resp.StatusCode != http.StatusOK {
        bodyBytes, _ := io.ReadAll(resp.Body)
        return "", fmt.Errorf("gemini api error: staus %d, body: %s", resp.StatusCode, string(bodyBytes))
    }

    var genResp struct {
        Candidates []struct {
            Content struct {
                Parts []struct {
                    Text string `json:"text"`
                } `json:"parts"`
            } `json:"content"`
        } `json:"candidates"`
    }

    if err := json.NewDecoder(resp.Body).Decode(&genResp); err != nil {
        return "", fmt.Errorf("failed to decode response: %v", err)
    }

    if len(genResp.Candidates) == 0 || len(genResp.Candidates[0].Content.Parts) == 0 {
        return "", fmt.Errorf("no content generated")
    }

    // 5. Clean up result
    text := genResp.Candidates[0].Content.Parts[0].Text
    text = strings.TrimPrefix(text, "```json")
    text = strings.TrimPrefix(text, "```")
    text = strings.TrimSuffix(text, "```")
    text = strings.TrimSpace(text)

    return text, nil
}
