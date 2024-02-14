package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	rconclient "palword-ds-gui/rcon-client"
	"palword-ds-gui/utils"
	"path"

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

func (a *App) DownloadFile(url string, filename string, authToken string) error {
	path := path.Join(utils.GetCurrentDir(), filename)
	utils.LogToFile(fmt.Sprintf("Downloading %s to %s", url, path))

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", authToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("server returned non-200 status: %d %s", resp.StatusCode, resp.Status)
	}

	out, err := os.Create(path)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return err
	}

	utils.OpenExplorerWithFile(utils.GetCurrentDir(), filename)

	return nil
}
