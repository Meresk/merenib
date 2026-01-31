package app

import (
	"log"
	"merenib/backend/internal/auth"
	"merenib/backend/internal/board"
	"merenib/backend/internal/db"
	"merenib/backend/internal/user"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func Run(cfg Config) {
	db.Init(cfg.DBPath, cfg.DefaultAdminPassword)

	app := fiber.New()
	app.Use(logger.New())

	// Handlers
	userHandler := user.NewHandler(cfg.JWTSecret)
	boardHandler := board.NewHandler()
	authHandler := auth.NewHandler(cfg.JWTSecret)
	authMiddleware := auth.NewMiddleware(cfg.JWTSecret)

	api := app.Group("/api")

	// Auth endpoints (login/logout)
	authGroup := api.Group("/auth")
	authGroup.Post("/login", authHandler.Login)
	authGroup.Post("/logout", authHandler.Logout)

	// User endpoints (CRUD)
	userGroup := api.Group("/users", authMiddleware.RequireLogin)
	userGroup.Post("/", userHandler.Create)

	// Board endpoints (CRUD)
	boardGroup := api.Group("/boards", authMiddleware.RequireLogin)
	boardGroup.Post("/", boardHandler.Create)

	log.Fatal(app.Listen(":" + cfg.Port))
}
