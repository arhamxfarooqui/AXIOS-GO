package database

import (
	"log"
	"axios-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	// TODO: Use environment variables
	dsn := "host=localhost user=postgres password=lordarhamking dbname=axios port=5432 sslmode=disable"
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	log.Println("Database connected successfully")

	// Auto Migrate
	err = DB.AutoMigrate(&models.User{}, &models.Resource{})
	if err != nil {
		log.Println("Migration failed: ", err)
	}
}
