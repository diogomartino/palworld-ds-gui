package main

import (
	"context"
	dedicatedserver "palword-ds-gui/dedicated-server"
	"palword-ds-gui/steamcmd"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx             context.Context
	steamCmd        *steamcmd.SteamCMD
	dedicatedServer *dedicatedserver.DedicatedServer
}

func NewApp(server *dedicatedserver.DedicatedServer, cmd *steamcmd.SteamCMD) *App {
	return &App{
		steamCmd:        cmd,
		dedicatedServer: server,
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a App) domReady(ctx context.Context) {
	a.steamCmd.Init(ctx)
	a.dedicatedServer.Init(ctx)
	runtime.EventsEmit(ctx, "SET_LOADING_STATUS", "DONE")
}

func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	a.dedicatedServer.Dispose()
	return false
}

func (a *App) shutdown(ctx context.Context) {
}

func (a *App) OpenInBrowser(url string) {
	runtime.BrowserOpenURL(a.ctx, url)
}
