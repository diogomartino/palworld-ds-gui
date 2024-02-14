package main

import (
	"flag"
	"os"
	"palworld-ds-gui-server/utils"
)

var (
	steamcmd      *SteamCMD
	servermanager *ServerManager
	backupmanager *BackupManager
	api           *Api
)

func main() {
	utils.Init()

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

	api = NewApi()
	api.Init()
}
