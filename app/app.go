package main

import (
	"context"
	"fmt"
	rconclient "palword-ds-gui/rcon-client"
	"palword-ds-gui/utils"

	"github.com/gocolly/colly/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx        context.Context
	rconClient *rconclient.RconClient
	reactReady bool
}

func NewApp(rconClient *rconclient.RconClient) *App {
	return &App{
		rconClient: rconClient,
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

	a.reactReady = true
	utils.LogToFile("app.go: initApp()")
}

func (a *App) beforeClose(ctx context.Context) (prevent bool) {
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

func (a *App) SaveLog(log string) {
	utils.LogToFile(log)
}

func (a *App) OpenLogs() {
	utils.OpenExplorerWithFile(utils.Config.AppDataDir, "logs.txt")
}
