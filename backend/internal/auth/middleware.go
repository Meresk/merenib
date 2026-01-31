package auth

import (
	"errors"

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

	c.Locals("user_id", claims["user_id"])
	c.Locals("login", claims["sub"])

	return c.Next()
}
