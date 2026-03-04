package auth

import (
	"database/sql"
	"errors"
	"merenib/backend/internal/db"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

type AuthMiddleware struct {
	JwtSecret string
}

func NewMiddleware(jwtSecret string) *AuthMiddleware {
	return &AuthMiddleware{JwtSecret: jwtSecret}
}

func (m *AuthMiddleware) RequireLogin(c *fiber.Ctx) error {
	tokenStr := c.Cookies("auth_token")
	if tokenStr == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "missing token",
		})
	}

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(m.JwtSecret), nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid token",
		})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "invalid token claims"})
	}

	userID := 0
	switch v := claims["user_id"].(type) {
	case float64:
		userID = int(v)
	case int:
		userID = v
	default:
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid user_id"})
	}

	c.Locals("user_id", userID)

	return c.Next()
}

func (m *AuthMiddleware) RequireAdmin(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(int)

	var isAdmin bool
	err := db.DB.QueryRow(
		"SELECT is_admin FROM users WHERE id = ?",
		userID,
	).Scan(&isAdmin)

	if err != nil || !isAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "admin access required",
		})
	}

	return c.Next()
}

func (m *AuthMiddleware) RequireUserAccess(c *fiber.Ctx) error {
	curUserID := c.Locals("user_id").(int)
	var isAdmin bool
	err := db.DB.QueryRow("SELECT is_admin FROM users WHERE id = ?", curUserID).Scan(&isAdmin)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "user not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "db error"})
	}

	paramID, convErr := strconv.Atoi(c.Params("id"))
	if convErr != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	if isAdmin || curUserID == paramID {
		return c.Next()
	}

	return c.SendStatus(fiber.StatusForbidden)
}
