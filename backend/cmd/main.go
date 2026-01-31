package main

import "merenib/backend/internal/app"

func main() {
	cfg := app.LoadConfig()
	app.Run(cfg)
}
