package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type ClientInitRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		NewSaveName string `json:"saveName"`
	}
}

type ClientInitResData struct {
	CurrentServerStatus         string                        `json:"currentServerStatus"`
	CurrentLaunchParams         string                        `json:"currentLaunchParams"`
	CurrentConfig               string                        `json:"currentConfig"`
	CurrentSaveName             string                        `json:"currentSaveName"`
	CurrentBackupsSettings      utils.PersistedSettingsBackup `json:"currentBackupsSettings"`
	CurrentTimedRestartSettings utils.PersistedTimedRestart   `json:"currentTimedRestartSettings"`
	CurrentBackupsList          []Backup                      `json:"currentBackupsList"`
	ServerVersion               string                        `json:"serverVersion"`
}

type ClientInitRes struct {
	Event   string            `json:"event"`
	EventId string            `json:"eventId"`
	Success bool              `json:"success"`
	Error   string            `json:"error"`
	Data    ClientInitResData `json:"data"`
}

var clientInitEvent = "INIT"

func ClientInitHandler(conn *websocket.Conn, data []byte) {
	var message ClientInitRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(ClientInitRes{
			Event:   clientInitEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	serverRunning := servermanager.IsRunning()
	currentState := "STOPPED"
	if serverRunning {
		currentState = "STARTED"
	}

	backupsList, err := backupmanager.GetBackupsList()
	if err != nil {
		utils.Log(err.Error())
		backupsList = []Backup{}
	}

	conn.WriteJSON(ClientInitRes{
		Event:   clientInitEvent,
		EventId: message.EventId,
		Success: true,
		Data: ClientInitResData{
			CurrentServerStatus:         currentState,
			CurrentLaunchParams:         utils.Settings.General.LaunchParams,
			CurrentConfig:               ReadConfig(),
			CurrentSaveName:             ReadSaveName(),
			CurrentBackupsSettings:      utils.Settings.Backup,
			CurrentTimedRestartSettings: utils.Settings.TimedRestart,
			CurrentBackupsList:          backupsList,
			ServerVersion:               utils.Config.ServerVersion,
		},
	})
}
