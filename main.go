package main

import (
	"embed"
	"log"
	backupsmanager "palword-ds-gui/backups-manager"
	dedicatedserver "palword-ds-gui/dedicated-server"
	"palword-ds-gui/steamcmd"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

var (
	width  = 800
	height = 560
)

func main() {
	// Create an instance of the app structure
	dedicatedServer := dedicatedserver.NewDedicatedServer()
	steamCmd := steamcmd.NewSteamCMD()
	backupManager := backupsmanager.NewBackupManager(dedicatedServer)
	app := NewApp(dedicatedServer, steamCmd, backupManager)

	// Create application with options
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
			dedicatedServer,
			backupManager,
		},
		// Windows platform specific options
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
			// DisableFramelessWindowDecorations: false,
			WebviewUserDataPath: "",
			ZoomFactor:          1.0,
		},
	})

	if err != nil {
		log.Fatal(err)
	}

}
