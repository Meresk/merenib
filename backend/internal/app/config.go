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
}

func LoadConfig() Config {
	cfg := Config{
		Port:                 getEnv("PORT", "8080"),
		JWTSecret:            getEnv("JWT_SECRET", "dev-secret"),
		DBPath:               getEnv("DB_PATH", "./data/app.db"),
		DefaultAdminPassword: getEnv("DEFAULT_ADMIN_PASSWORD", "admin"),
	}

	if cfg.JWTSecret == "dev-secret" {
		log.Println("⚠️  using default JWT secret")
	}

	if cfg.DefaultAdminPassword == "admin" {
		log.Println("⚠️  using default admin password")
	}

	return cfg
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
