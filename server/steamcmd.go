package main

import (
	"os"
	"palworld-ds-gui-server/utils"
	"path"

	"github.com/mholt/archiver/v3"
)

type SteamCMD struct {
}

func NewSteamCMD() *SteamCMD {
	return &SteamCMD{}
}

func (s *SteamCMD) Init() {
	if _, err := os.Stat(utils.Config.SteamCmdPath); os.IsNotExist(err) {
		utils.Log("SteamCMD not found, downloading...")
		os.Mkdir(utils.Config.SteamCmdPath, 0755)
		s.DownloadExecutable()
	}
}

func (s *SteamCMD) DownloadExecutable() {
	zipPath := path.Join(utils.Config.SteamCmdPath, "steamcmd.zip")

	err := utils.DownloadFile(utils.Config.SteamCmdUrl, zipPath)
	if err != nil {
		panic(err)
	}

	utils.Log("Extracting SteamCMD...")
	err = archiver.Unarchive(zipPath, utils.Config.SteamCmdPath)

	if err != nil {
		panic(err)
	}

	utils.Log("Removing zip file...")
	err = os.Remove(zipPath)

	if err != nil {
		panic(err)
	}

	utils.Log("SteamCMD downloaded and extracted successfully!")
}
