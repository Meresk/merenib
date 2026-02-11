package boardfiles

import (
	"database/sql"
	"fmt"
	"merenib/backend/internal/db"
	"os"
	"path"
	"time"

	"github.com/gofiber/fiber/v2"
)

type BoardFilesHandler struct{}

func NewBoardFilesHandler() *BoardFilesHandler {
	return &BoardFilesHandler{}
}

func (h *BoardFilesHandler) UploadFile(c *fiber.Ctx) error {
	boardID := c.Params("id")
	userID := int(c.Locals("user_id").(float64))

	// check exists board and user access
	var exists int
	err := db.DB.QueryRow(`SELECT 1 FROM boards WHERE id = ? AND user_id = ?`, boardID, userID).Scan(&exists)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "board not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	// get file
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "file required"})
	}

	// dir for files
	uploadDir := fmt.Sprintf("./uploads/boards/%s", boardID)
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "cannot create directory"})
	}

	// uniq files names
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	filePath := path.Join(uploadDir, filename)

	// save file to drive
	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "cannot save file"})
	}

	// file record in db
	res, err := db.DB.Exec(
		`INSERT INTO board_files (board_id, file_name, file_path) VALUES (?, ?, ?)`,
		boardID, file.Filename, filePath,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	fileID, _ := res.LastInsertId()

	fileURL := fmt.Sprintf("/api/boards/%s/files/%d", boardID, fileID)
	return c.JSON(fiber.Map{
		"id":  fileID,
		"url": fileURL,
	})
}

func (h *BoardFilesHandler) GetFile(c *fiber.Ctx) error {
	boardID := c.Params("id")
	fileID := c.Params("fileId")
	userID := int(c.Locals("user_id").(float64))

	// check file and user access
	var filePath string
	err := db.DB.QueryRow(`
		SELECT bf.file_path
		FROM board_files bf
		JOIN boards b ON b.id = bf.board_id
		WHERE bf.id = ? AND bf.board_id = ? AND b.user_id = ?
	`, fileID, boardID, userID).Scan(&filePath)

	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "file not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	return c.SendFile(filePath, true) // true → Content-Disposition inline
}
