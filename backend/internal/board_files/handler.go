package boardfiles

import (
	"database/sql"
	"fmt"
	"merenib/backend/internal/db"
	"os"
	"path"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type BoardFilesHandler struct{}

func NewBoardFilesHandler() *BoardFilesHandler {
	return &BoardFilesHandler{}
}

func (h *BoardFilesHandler) UploadFile(c *fiber.Ctx) error {
	boardID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}
	userID := int(c.Locals("user_id").(float64))

	// check exists board and user access
	var exists int
	err = db.DB.QueryRow(`SELECT 1 FROM boards WHERE id = ? AND user_id = ?`, boardID, userID).Scan(&exists)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "board not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	// file_id from frontend (excalidraw id)
	fileID := c.FormValue("file_id")
	if fileID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "file_id required"})
	}

	// get file
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "file required"})
	}

	// dir for files
	uploadDir := fmt.Sprintf("./uploads/boards/%d", boardID)
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "cannot create directory"})
	}

	// deterministic path
	fileID = path.Base(fileID)
	filePath := path.Join(uploadDir, fileID)

	// check if already exists (idempotent)
	var existingPath string
	err = db.DB.QueryRow(
		`SELECT file_path FROM board_files WHERE board_id = ? AND file_id = ?`,
		boardID, fileID,
	).Scan(&existingPath)

	if err == nil {
		// file already exists
		return c.JSON(fiber.Map{
			"id":  fileID,
			"url": existingPath,
		})
	}

	if err != sql.ErrNoRows {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	// save file to disk
	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "cannot save file"})
	}

	// insert record in db
	_, err = db.DB.Exec(
		`INSERT INTO board_files (board_id, file_id, file_name, file_path) VALUES (?, ?, ?, ?)`,
		boardID, fileID, file.Filename, filePath,
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	return c.JSON(fiber.Map{
		"id":  fileID,
		"url": fmt.Sprintf("/api/boards/%s/files/%s", boardID, fileID),
	})
}

func (h *BoardFilesHandler) GetFile(c *fiber.Ctx) error {
	boardID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	fileID := c.Params("fileId")
	userID := int(c.Locals("user_id").(float64))

	// check file and user access
	var filePath string
	err = db.DB.QueryRow(`
		SELECT bf.file_path
		FROM board_files bf
		JOIN boards b ON b.id = bf.board_id
		WHERE bf.file_id = ? AND bf.board_id = ? AND b.user_id = ?
	`, fileID, boardID, userID).Scan(&filePath)

	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "file not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "server error"})
	}

	return c.SendFile(filePath, true) // true → Content-Disposition inline
}
