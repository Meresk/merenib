package user

import (
	"database/sql"
	"fmt"
	"log"
	"merenib/backend/internal/db"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct{}

func NewHandler() *UserHandler {
	return &UserHandler{}
}

type User struct {
	ID    int    `json:"id"`
	Login string `json:"login"`
}

func (h *UserHandler) Create(c *fiber.Ctx) error {
	var input struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}

	if input.Login == "" || input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "login and password required",
		})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Println("bcrypt error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	res, err := db.DB.Exec(
		"INSERT INTO users (login, password_hash) VALUES (?, ?)",
		input.Login, string(hash),
	)

	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "login already exists"})
		}

		log.Println("db error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	id, _ := res.LastInsertId()

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id":    id,
		"login": input.Login,
	})
}

func (h *UserHandler) List(c *fiber.Ctx) error {
	rows, err := db.DB.Query("SELECT id, login FROM users ORDER BY id")
	if err != nil {
		log.Println("db error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}
	defer rows.Close()

	users := make([]User, 0)
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Login); err != nil {
			log.Println("scan error:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
		}
		users = append(users, u)
	}

	return c.Status(fiber.StatusOK).JSON(users)
}

func (h *UserHandler) GetById(c *fiber.Ctx) error {
	id := c.Params("id")

	var u User
	err := db.DB.QueryRow(
		"SELECT id, login FROM users WHERE id = ?",
		id,
	).Scan(&u.ID, &u.Login)

	if err == sql.ErrNoRows {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "user not found"})
	}
	if err != nil {
		log.Println("db error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	return c.Status(fiber.StatusOK).JSON(u)
}

func (h *UserHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")

	var input struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}

	if input.Login == "" && input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "login and password required"})
	}

	tx, err := db.DB.Begin()
	if err != nil {
		log.Println("tx begin error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}
	defer tx.Rollback()

	if input.Login != "" {
		_, err := tx.Exec(
			"UPDATE users SET login = ? WHERE id = ?",
			input.Login, id,
		)
		if err != nil {
			if strings.Contains(err.Error(), "UNIQUE") {
				return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "login already exists"})
			}
			log.Println("db error:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
		}
	}

	if input.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Println("bcrypt error:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
		}

		_, err = tx.Exec(
			"UPDATE users SET password_hash = ? WHERE id = ?",
			string(hash), id,
		)
		if err != nil {
			log.Println("db error:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
		}
	}

	if err := tx.Commit(); err != nil {
		log.Println("tx commit error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	return c.SendStatus(fiber.StatusOK)
}

func (h *UserHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")

	// get all users boards ids
	rows, err := db.DB.Query(`SELECT id FROM boards WHERE user_id = ?`, id)
	if err != nil {
		log.Println("db error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}
	defer rows.Close()

	var boardIDs []int
	for rows.Next() {
		var boardID int
		if err := rows.Scan(&boardID); err == nil {
			boardIDs = append(boardIDs, boardID)
		}
	}

	// remove all dirs of deleted user
	for _, boardID := range boardIDs {
		dir := fmt.Sprintf("./uploads/boards/%d", boardID)
		if err := os.RemoveAll(dir); err != nil {
			log.Printf("failed to remove dir %s: %v\n", dir, err)
		}
	}

	res, err := db.DB.Exec("DELETE FROM users WHERE id = ?", id)
	if err != nil {
		log.Println("db error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "user not found"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
