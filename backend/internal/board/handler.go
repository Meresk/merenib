package board

import "github.com/gofiber/fiber/v2"

type BoardHandler struct {
}

func NewHandler() *BoardHandler {
	return &BoardHandler{}
}

func (h *BoardHandler) Create(c *fiber.Ctx) error { return c.Status(404).JSON(fiber.Map{}) }
