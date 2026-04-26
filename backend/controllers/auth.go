package controllers

import (
	"net/http"

	"axios-backend/database"
	"axios-backend/models"
	"axios-backend/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Name             string   `json:"name" binding:"required"`
	Email            string   `json:"email" binding:"required,email"`
	Password         string   `json:"password" binding:"required"`
	CollegeID        string   `json:"college_id" binding:"required"`
	Wings            []string `json:"wings"`
	CodeforcesHandle string   `json:"codeforces_handle" binding:"required"` // Mandatory
	CodechefHandle   string   `json:"codechef_handle"`
	GithubHandle     string   `json:"github_handle" binding:"required"` // Mandatory
	KaggleHandle     string   `json:"kaggle_handle"`
	CTFHandle        string   `json:"ctf_handle"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}

	user := models.User{
		Name:             input.Name,
		Email:            input.Email,
		Password:         string(hashedPassword),
		CollegeID:        input.CollegeID,
		Wings:            input.Wings,
		CodeforcesHandle: input.CodeforcesHandle,
		CodechefHandle:   input.CodechefHandle,
		GithubHandle:     input.GithubHandle,
		KaggleHandle:     input.KaggleHandle,
		CTFHandle:        input.CTFHandle,
	}
    
    // Attempt to fetch stats initially (optional, might slow down register)
    // For now, let's just save.

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists or invalid data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registration successful"})
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}
