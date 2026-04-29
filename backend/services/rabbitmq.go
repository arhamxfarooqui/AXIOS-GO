package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

var RabbitConn *amqp.Connection
var RabbitChannel *amqp.Channel

// InitRabbitMQ connects to RabbitMQ and declares the required queues
func InitRabbitMQ() {
	var err error
	RabbitConn, err = amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Printf("Warning: Failed to connect to RabbitMQ: %v. Async tasks will be disabled.", err)
		return
	}

	RabbitChannel, err = RabbitConn.Channel()
	if err != nil {
		log.Printf("Warning: Failed to open RabbitMQ channel: %v", err)
		return
	}

	// Declare durable queue
	_, err = RabbitChannel.QueueDeclare(
		"codeforces_sync", // name
		true,              // durable
		false,             // delete when unused
		false,             // exclusive
		false,             // no-wait
		nil,               // arguments
	)
	if err != nil {
		log.Printf("Warning: Failed to declare RabbitMQ queue: %v", err)
		return
	}

	fmt.Println("RabbitMQ connected successfully")
}

// CFSyncPayload defines the message structure for the Codeforces sync queue
type CFSyncPayload struct {
	UserID   uint   `json:"user_id"`
	CFHandle string `json:"cf_handle"`
}

// PublishCFSync serializes and publishes a sync request to RabbitMQ
func PublishCFSync(userID uint, cfHandle string) error {
	payload := CFSyncPayload{
		UserID:   userID,
		CFHandle: cfHandle,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = RabbitChannel.PublishWithContext(ctx,
		"",                // exchange
		"codeforces_sync", // routing key
		false,             // mandatory
		false,             // immediate
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         body,
			DeliveryMode: amqp.Persistent,
		})
	if err != nil {
		return fmt.Errorf("failed to publish message: %w", err)
	}

	return nil
}
