package auth

import (
	"errors"
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

	userID := int(claims["user_id"].(float64))
	isAdmin := claims["is_admin"].(bool)
	login := claims["sub"].(string)

	c.Locals("user_id", userID)
	c.Locals("is_admin", isAdmin)
	c.Locals("login", login)

	return c.Next()
}

func (m *AuthMiddleware) RequireAdmin(c *fiber.Ctx) error {
	isAdmin, ok := c.Locals("is_admin").(bool)
	if !ok || !isAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "admin access required",
		})
	}

	return c.Next()
}

func (m *AuthMiddleware) RequireUserAccess(c *fiber.Ctx) error {
	curUserID := c.Locals("user_id").(int)
	isAdmin := c.Locals("is_admin").(bool)

	paramID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	if isAdmin || curUserID == paramID {
		return c.Next()
	}

	return c.SendStatus(fiber.StatusForbidden)
}
