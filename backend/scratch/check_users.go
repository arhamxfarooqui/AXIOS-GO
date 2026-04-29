package main

import (
	"axios-backend/database"
	"axios-backend/models"
	"fmt"
	"log"
)

func main() {
	database.Connect()
	var users []models.User
	if err := database.DB.Find(&users).Error; err != nil {
		log.Fatal(err)
	}

	for _, u := range users {
		fmt.Printf("ID: %d, Name: %s, Email: %s\n", u.ID, u.Name, u.Email)
	}
}
