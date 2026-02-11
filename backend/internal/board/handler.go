package board

import (
	"database/sql"
	"fmt"
	"merenib/backend/internal/db"
	"os"

	"github.com/gofiber/fiber/v2"
)

type BoardHandler struct {
}

func NewHandler() *BoardHandler {
	return &BoardHandler{}
}

type Board struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Data      string `json:"data"`
	UpdatedAt string `json:"updated_at"`
}

func (h *BoardHandler) Create(c *fiber.Ctx) error {
	var input struct {
		Name string `json:"name"`
		Data string `json:"data"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	if input.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "name required"})
	}

	userID := int(c.Locals("user_id").(float64))

	res, err := db.DB.Exec(
		`INSERT INTO boards (user_id, name, data) VALUES (?, ?, ?)`,
		userID,
		input.Name,
		input.Data,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	id, _ := res.LastInsertId()

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id":   id,
		"name": input.Name,
	})
}

func (h *BoardHandler) List(c *fiber.Ctx) error {
	userID := int(c.Locals("user_id").(float64))

	rows, err := db.DB.Query(
		`SELECT id, name, updated_at
		 FROM boards
		 WHERE user_id = ?
		 ORDER BY updated_at DESC`,
		userID,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}
	defer rows.Close()

	var boards []Board
	for rows.Next() {
		var b Board
		if err := rows.Scan(&b.ID, &b.Name, &b.UpdatedAt); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
		}
		boards = append(boards, b)
	}

	return c.JSON(boards)
}

func (h *BoardHandler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := int(c.Locals("user_id").(float64))

	var b Board
	err := db.DB.QueryRow(
		`SELECT id, name, data, updated_at
		 FROM boards
		 WHERE id = ? AND user_id = ?`,
		id, userID,
	).Scan(&b.ID, &b.Name, &b.Data, &b.UpdatedAt)

	if err == sql.ErrNoRows {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "board not found"})
	}
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	return c.JSON(b)
}

func (h *BoardHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := int(c.Locals("user_id").(float64))

	var input struct {
		Name string `json:"name"`
		Data string `json:"data"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request"})
	}

	res, err := db.DB.Exec(
		`UPDATE boards
		 SET name = COALESCE(NULLIF(?, ''), name),
		     data = ?,
		     updated_at = CURRENT_TIMESTAMP
		 WHERE id = ? AND user_id = ?`,
		input.Name,
		input.Data,
		id,
		userID,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "board not found"})
	}

	return c.SendStatus(fiber.StatusOK)
}

func (h *BoardHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := int(c.Locals("user_id").(float64))

	res, err := db.DB.Exec(
		`DELETE FROM boards WHERE id = ? AND user_id = ?`,
		id,
		userID,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "board not found"})
	}

	uploadDir := fmt.Sprintf("./uploads/boards/%s", id)
	if err := os.RemoveAll(uploadDir); err != nil {
		fmt.Printf("Failed to remove board files dir %s: %v\n", uploadDir, err)
	}

	return c.SendStatus(fiber.StatusNoContent)
}
