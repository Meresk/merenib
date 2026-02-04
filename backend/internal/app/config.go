package app

import (
	"log"
	"os"
)

type Config struct {
	Port                 string
	JWTSecret            string
	DBPath               string
	DefaultAdminPassword string
	AllowOrigins         string
	AllowMethods         string
	AllowHeaders         string
}

func LoadConfig() Config {
	cfg := Config{
		Port:                 getEnv("PORT", "8080"),
		JWTSecret:            getEnv("JWT_SECRET", "dev-secret"),
		DBPath:               getEnv("DB_PATH", "./data/app.db"),
		DefaultAdminPassword: getEnv("DEFAULT_ADMIN_PASSWORD", "admin"),
		AllowOrigins:         getEnv("CORS_ALLOW_ORIGINS", "http://localhost:5173"),
		AllowMethods:         getEnv("CORS_ALLOW_METHODS", "GET, POST, PUT, DELETE, OPTIONS"),
		AllowHeaders:         getEnv("CORS_ALLOW_HEADERS", "Origin, Content-Type, Accept"),
	}

	if cfg.JWTSecret == "dev-secret" {
		log.Println("⚠️  using default JWT secret")
	}

	if cfg.DefaultAdminPassword == "admin" {
		log.Println("⚠️  using default admin password")
	}

	if cfg.AllowOrigins == "http://localhost:5173" {
		log.Println("⚠️  using default allow origins")
	}

	return cfg
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
