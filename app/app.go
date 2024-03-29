package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"palword-ds-gui/utils"
	"path"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx        context.Context
	reactReady bool
}

func NewApp() *App {
	return &App{}
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
