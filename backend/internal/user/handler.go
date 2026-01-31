package user

import "github.com/gofiber/fiber/v2"

type UserHandler struct {
	JwtSecret string
}

func NewHandler(jwtSecret string) *UserHandler {
	return &UserHandler{JwtSecret: jwtSecret}
}

func (h *UserHandler) Create(c *fiber.Ctx) error { return c.Status(404).JSON(fiber.Map{}) }
func (h *UserHandler) List(c *fiber.Ctx) error   { return c.Status(404).JSON(fiber.Map{}) }
