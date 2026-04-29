package workers

import (
	"encoding/json"
	"log"

	"axios-backend/database"
	"axios-backend/models"
	"axios-backend/services"
)

// StartCFConsumer listens to the codeforces_sync queue and processes sync requests
func StartCFConsumer() {
	if services.RabbitChannel == nil {
		log.Println("RabbitMQ channel not initialized, skipping CFConsumer")
		return
	}

	msgs, err := services.RabbitChannel.Consume(
		"codeforces_sync", // queue
		"",                // consumer
		false,             // auto-ack (manual acking for reliability)
		false,             // exclusive
		false,             // no-local
		false,             // no-wait
		nil,               // args
	)
	if err != nil {
		log.Fatalf("Failed to register a consumer: %v", err)
	}

	log.Println("CF Sync Worker started. Waiting for messages...")

	for d := range msgs {
		var payload services.CFSyncPayload
		if err := json.Unmarshal(d.Body, &payload); err != nil {
			log.Printf("Error decoding CF sync payload: %v\n", err)
			d.Nack(false, false) // discard invalid messages
			continue
		}

		log.Printf("Received CF sync request for UserID: %d\n", payload.UserID)

		var user models.User
		if err := database.DB.First(&user, payload.UserID).Error; err != nil {
			log.Printf("User %d not found, discarding message: %v\n", payload.UserID, err)
			d.Ack(false) // Ack to remove from queue since user is gone
			continue
		}

		// Perform the heavy API fetching and DB updates
		if err := services.SyncUserUpsolves(&user); err != nil {
			log.Printf("Failed to sync upsolves for UserID %d: %v\n", payload.UserID, err)
			d.Nack(false, true) // requeue if transient API error
			continue
		}

		log.Printf("Successfully synced CF upsolves for UserID: %d\n", payload.UserID)
		d.Ack(false) // acknowledge success
	}
}
