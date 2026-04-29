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
			ai.POST("/codesensei", controllers.CodeSensei)
			ai.POST("/roadmap", controllers.GenerateRoadmap)
			ai.GET("/analysis", controllers.GetProfileAnalysis)
			ai.POST("/analyze", controllers.AnalyzeWithOrchestrator)
		}

		// Wing-Specific Routes
		wings := api.Group("/wings")
		wings.Use(middleware.AuthMiddleware())
		{
			// CP Wing
			wings.GET("/cp/upsolves", controllers.GetUpsolveQueue)
			wings.POST("/cp/upsolves/:id/status", controllers.UpdateUpsolveStatus)
			wings.POST("/cp/mock", controllers.GenerateMockContest)
			wings.POST("/cp/sync", controllers.SyncUpsolves)

			// Dev Wing
			wings.GET("/dev/first-issues", controllers.GetGoodFirstIssues)
			wings.GET("/dev/health", controllers.GetDevHealth)
			wings.POST("/dev/review", controllers.ReviewPullRequest)
			wings.POST("/dev/resume", controllers.GenerateResumeBullets)

			// ML Wing
			wings.GET("/ml/curate", controllers.GetMLCuration)
		}

		public := api.Group("/public")
		{
			public.GET("/leaderboard", controllers.GetOverallLeaderboard)
			public.GET("/leaderboard/wing", controllers.GetWingLeaderboard)
			
			// Resources
			public.GET("/resources", controllers.GetResources)
			public.POST("/resources", controllers.CreateResource) // TODO: Add Auth/Admin check
		}
	}
}
