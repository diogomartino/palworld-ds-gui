//go:build windows
// +build windows

package main

import (
	"embed"
	"os"
	"palword-ds-gui/utils"

	"github.com/tidwall/gjson"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed wails.json
var wailsJSON string

var (
	width  = 800
	height = 560
)

func main() {
	if _, err := os.Stat(utils.Config.AppDataDir); os.IsNotExist(err) {
		os.MkdirAll(utils.Config.AppDataDir, 0755)
	}

	logsFile, logErr := os.OpenFile(utils.Config.LogsPath, os.O_RDWR|os.O_CREATE, 0666)
	if logErr != nil {
		panic(logErr)
	}

	defer logsFile.Close()

	version := gjson.Get(wailsJSON, "info.productVersion")
	utils.LogToFile("main.go: main() - Palword Dedicated Server GUI v" + version.String())

	app := NewApp()

	utils.LogToFile("main.go: main() - Managers created")

	err := wails.Run(&options.App{
		Title:             "Palword Dedicated Server GUI",
		Width:             width,
		Height:            height,
		MinWidth:          width,
		MinHeight:         height,
		MaxWidth:          width,
		MaxHeight:         height,
		DisableResize:     false,
		Fullscreen:        false,
		Frameless:         false,
		StartHidden:       false,
		HideWindowOnClose: false,
		BackgroundColour:  &options.RGBA{R: 255, G: 255, B: 255, A: 255},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Menu:             nil,
		Logger:           nil,
		LogLevel:         logger.DEBUG,
		OnStartup:        app.startup,
		OnDomReady:       app.domReady,
		OnBeforeClose:    app.beforeClose,
		OnShutdown:       app.shutdown,
		WindowStartState: options.Normal,
		Bind: []interface{}{
			app,
		},
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
			WebviewUserDataPath:  "",
			ZoomFactor:           1.0,
		},
	})

	utils.LogToFile("main.go: main() - Wails.Run() called")

	if err != nil {
		panic(err)
	}
}
