package app

import (
	"log"
	"merenib/backend/internal/auth"
	"merenib/backend/internal/board"
	"merenib/backend/internal/db"
	"merenib/backend/internal/user"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func Run(cfg Config) {
	db.Init(cfg.DBPath, cfg.DefaultAdminPassword)

	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowOrigins,
		AllowHeaders:     cfg.AllowHeaders,
		AllowMethods:     cfg.AllowMethods,
		AllowCredentials: true,
	}))

	// Handlers
	userHandler := user.NewHandler()
	boardHandler := board.NewHandler()
	authHandler := auth.NewHandler(cfg.JWTSecret)
	authMiddleware := auth.NewMiddleware(cfg.JWTSecret)

	api := app.Group("/api")

	// Auth endpoints (login/logout)
	authGroup := api.Group("/auth")
	authGroup.Post("/login", authHandler.Login)
	authGroup.Post("/logout", authHandler.Logout)
	authGroup.Get("/me", authMiddleware.RequireLogin, authHandler.Me)

	// User endpoints (CRUD)
	userGroup := api.Group("/users", authMiddleware.RequireLogin, authMiddleware.RequireAdmin)
	userGroup.Post("/", userHandler.Create)
	userGroup.Get("/", userHandler.List)
	userGroup.Get("/:id", userHandler.GetById)
	userGroup.Put("/:id", userHandler.Update)
	userGroup.Delete("/:id", userHandler.Delete)

	// Board endpoints (CRUD)
	boardGroup := api.Group("/boards", authMiddleware.RequireLogin)
	boardGroup.Post("/", boardHandler.Create)
	boardGroup.Get("/", boardHandler.List)
	boardGroup.Get("/:id", boardHandler.Get)
	boardGroup.Put("/:id", boardHandler.Update)
	boardGroup.Delete("/:id", boardHandler.Delete)

	log.Fatal(app.Listen(":" + cfg.Port))
}
