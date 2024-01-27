package steamcmd

import (
	"context"
	"os"
	"palword-ds-gui/utils"
	"path"

	"github.com/mholt/archiver/v3"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type SteamCMD struct {
}

var ctx context.Context
var currentConsoleId string = "STEAM_CMD"

func NewSteamCMD() *SteamCMD {
	return &SteamCMD{}
}

func Print(message string) {
	utils.PrintEx(ctx, message, currentConsoleId)
}

func (s *SteamCMD) Init(srcCtx context.Context) {
	ctx = srcCtx

	Print("Initializing SteamCMD...")

	if _, err := os.Stat(utils.Config.SteamCmdPath); os.IsNotExist(err) {
		Print("SteamCMD not found, downloading...")
		runtime.EventsEmit(ctx, "SET_LOADING_STATUS", "INSTALLING_STEAMCMD")
		os.Mkdir(utils.Config.SteamCmdPath, 0755)
		s.DownloadExecutable()
	} else {
		Print("SteamCMD is already installed")
	}

	Print("Done initializing SteamCMD")
}

func (s *SteamCMD) DownloadExecutable() {
	zipPath := path.Join(utils.Config.SteamCmdPath, "steamcmd.zip")

	err := utils.DownloadFile(utils.Config.SteamCmdUrl, zipPath)
	if err != nil {
		panic(err)
	}

	Print("Extracting SteamCMD...")
	err = archiver.Unarchive(zipPath, utils.Config.SteamCmdPath)

	if err != nil {
		panic(err)
	}

	Print("Removing zip file...")
	err = os.Remove(zipPath)

	if err != nil {
		panic(err)
	}

	Print("SteamCMD is ready")
}
