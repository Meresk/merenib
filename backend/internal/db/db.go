package db

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

var DB *sql.DB

func Init(dbPath, defAdminPassword string) {
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		log.Fatalf("failed to create db dir: %v", err)
	}

	var err error
	DB, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}

	if err := DB.Ping(); err != nil {
		log.Fatalf("failed to ping db: %v", err)
	}

	createTables()
	seedAdmin(defAdminPassword)
	log.Println("✅ database initialized")
}

func createTables() {
	userTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		login TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`

	boardTable := `
	CREATE TABLE IF NOT EXISTS boards (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		name TEXT NOT NULL,
		data TEXT NOT NULL,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(user_id) REFERENCES users(id)
	);
	`

	if _, err := DB.Exec(userTable); err != nil {
		log.Fatalf("failed to create users table: %v", err)
	}

	if _, err := DB.Exec(boardTable); err != nil {
		log.Fatalf("failed to create boards table: %v", err)
	}
}

func seedAdmin(defAdminPassword string) {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM users WHERE login = ?", "admin").Scan(&count)
	if err != nil {
		log.Fatal("failed to check admin:", err)
	}

	if count == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte(defAdminPassword), bcrypt.DefaultCost)
		_, _ = DB.Exec("INSERT INTO users (login, password_hash) VALUES (?, ?)", "admin", string(hash))
		log.Println("✅ Seeding success, admin user created")
	}
}
