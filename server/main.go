package main

import (
	_ "embed"
	"flag"
	"os"
	"palworld-ds-gui-server/utils"
)

var (
	steamcmd            *SteamCMD
	servermanager       *ServerManager
	backupmanager       *BackupManager
	timedrestartmanager *TimedRestartManager
	api                 *Api
)

//go:embed server.json
var serverJSON string

func main() {
	utils.Init(serverJSON)

	if utils.Launch.Help {
		flag.PrintDefaults()
		os.Exit(0)
	}

	steamcmd = NewSteamCMD()
	steamcmd.Init()

	servermanager = NewServerManager()
	servermanager.Init()

	backupmanager = NewBackupManager()
	backupmanager.Init()

	timedrestartmanager = NewTimedRestartManager()
	timedrestartmanager.Init()

	api = NewApi()
	api.Init()
}
