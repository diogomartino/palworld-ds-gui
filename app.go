package main

import (
	"context"
	"fmt"
	backupsmanager "palword-ds-gui/backups-manager"
	dedicatedserver "palword-ds-gui/dedicated-server"
	rconclient "palword-ds-gui/rcon-client"
	"palword-ds-gui/steamcmd"
	"palword-ds-gui/utils"

	"github.com/gocolly/colly/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx             context.Context
	steamCmd        *steamcmd.SteamCMD
	dedicatedServer *dedicatedserver.DedicatedServer
	backupsManager  *backupsmanager.BackupManager
	rconClient      *rconclient.RconClient
	reactReady      bool
}

func NewApp(server *dedicatedserver.DedicatedServer, cmd *steamcmd.SteamCMD, backupManager *backupsmanager.BackupManager, rconClient *rconclient.RconClient) *App {
	return &App{
		steamCmd:        cmd,
		dedicatedServer: server,
		backupsManager:  backupManager,
		rconClient:      rconClient,
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	utils.LogToFile("app.go: startup()")
}

func (a App) domReady(ctx context.Context) {
	utils.LogToFile("app.go: domReady()")
}

// InitApp is called by React to make sure the interface is ready to receive events
func (a *App) InitApp() {
	if a.reactReady {
		utils.LogToFile("app.go: initApp() tried to run more than once")
		return
	}

	a.steamCmd.Init(a.ctx)
	a.dedicatedServer.Init(a.ctx)
	a.backupsManager.Init(a.ctx)
	a.reactReady = true

	runtime.EventsEmit(a.ctx, "SET_LOADING_STATUS", "DONE")
	utils.LogToFile("app.go: initApp()")
}

func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	a.dedicatedServer.Dispose()
	a.backupsManager.Dispose()

	utils.LogToFile("app.go: beforeClose()")
	return false
}

func (a *App) shutdown(ctx context.Context) {
	utils.LogToFile("app.go: shutdown()")
}

func (a *App) OpenInBrowser(url string) {
	runtime.BrowserOpenURL(a.ctx, url)
}

func (a *App) GetSteamProfileURL(steamid string) {
	profileURL := fmt.Sprintf("https://steamcommunity.com/profiles/%s", steamid)
	c := colly.NewCollector()

	var profileImageURL string

	c.OnHTML(".playerAvatarAutoSizeInner > img", func(e *colly.HTMLElement) {
		profileImageURL = e.Attr("src")
		runtime.EventsEmit(a.ctx, "RETURN_STEAM_IMAGE", fmt.Sprintf("%s|%s", steamid, profileImageURL))
	})

	err := c.Visit(profileURL)

	if err != nil {
		return
	}
}
