package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var clientInitEvent = "INIT"

func ClientInitHandler(conn *websocket.Conn, data []byte) {
	var message BaseRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
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

	additionalSettings := AdditionalSettings{
		TimedRestart:   utils.Settings.TimedRestart,
		RestartOnCrash: utils.Settings.RestartOnCrash,
	}

	conn.WriteJSON(ClientInitResponse{
		BaseResponse: BaseResponse{
			Event:   clientInitEvent,
			EventId: message.EventId,
			Success: true,
		},
		Data: ClientInitResData{
			CurrentServerStatus:       currentState,
			CurrentLaunchParams:       utils.Settings.General.LaunchParams,
			CurrentConfig:             ReadConfig(),
			CurrentSaveName:           ReadSaveName(),
			CurrentBackupsSettings:    utils.Settings.Backup,
			CurrentAdditionalSettings: additionalSettings,
			CurrentBackupsList:        backupsList,
			ServerVersion:             utils.Config.ServerVersion,
		},
	})
}
