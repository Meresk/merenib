package auth

import (
	"database/sql"
	"log"
	"merenib/backend/internal/db"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	JwtSecret string
}

func NewHandler(jwtSecret string) *AuthHandler {
	return &AuthHandler{JwtSecret: jwtSecret}
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var input struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invealid request"})
	}

	var id int
	var hash string
	err := db.DB.QueryRow("SELECT id, password_hash FROM users WHERE login = $1", input.Login).Scan(&id, &hash)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
		}
		log.Println("db error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	err = bcrypt.CompareHashAndPassword([]byte(hash), []byte(input.Password))
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	token, err := h.generateToken(id, input.Login)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "cannot create token"})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "auth_token",
		Value:    token,
		HTTPOnly: true,
		Secure:   false, // true для https
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		SameSite: "Strict",
	})

	return c.JSON(fiber.Map{"ok": true})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "auth_token",
		Value:    "",
		HTTPOnly: true,
		Path:     "/",
		Expires:  time.Now().Add(-1 * time.Hour),
	})
	return c.JSON(fiber.Map{"ok": true})
}

func (h *AuthHandler) generateToken(id int, login string) (string, error) {
	claims := jwt.MapClaims{
		"sub":     login,
		"user_id": id,
		"exp":     time.Now().Add(time.Hour * 2).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.JwtSecret))
}
