package routes

import (
	"axios-backend/controllers"
	"axios-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
		}

		user := api.Group("/user")
		user.Use(middleware.AuthMiddleware())
		{
			user.GET("/profile", controllers.GetProfile)
			user.POST("/refresh", controllers.RefreshStats)
		}

		// AI Routes
		ai := api.Group("/ai")
		ai.Use(middleware.AuthMiddleware())
		{
            ai.POST("/connect", controllers.ConnectToCoach)
			ai.POST("/chat", controllers.ChatWithCoach)
            ai.POST("/roadmap", controllers.GenerateRoadmap)
            ai.GET("/analysis", controllers.GetProfileAnalysis)
		}

		public := api.Group("/public")
		{
			public.GET("/leaderboard", controllers.GetOverallLeaderboard)
			public.GET("/leaderboard/:wing", controllers.GetWingLeaderboard)
			
			// Resources
			public.GET("/resources", controllers.GetResources)
			public.POST("/resources", controllers.CreateResource) // TODO: Add Auth/Admin check
		}
	}
}
