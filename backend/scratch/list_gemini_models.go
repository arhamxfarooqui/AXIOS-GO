package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"google.golang.org/api/generativelanguage/v1beta"
	"google.golang.org/api/option"
)

func main() {
	godotenv.Load()
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY not set")
	}

	ctx := context.Background()
	svc, err := v1beta.NewService(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatal(err)
	}

	resp, err := svc.Models.List().Do()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Available Models:")
	for _, m := range resp.Models {
		fmt.Printf("- %s (Methods: %v)\n", m.Name, m.SupportedGenerationMethods)
	}
}
