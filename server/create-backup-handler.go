package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type CreateBackupRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
}

type CreateBackupRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

var createBackupEvent = "CREATE_BACKUP"

func CreateBackupHandler(conn *websocket.Conn, data []byte) {
	var message StartBackupsRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(StartBackupsRes{
			Event:   startBackupsEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	success := true
	err = backupmanager.CreateBackup()
	if err != nil {
		utils.Log(err.Error())
		success = false
	}

	conn.WriteJSON(CreateBackupRes{
		Event:   createBackupEvent,
		EventId: message.EventId,
		Success: success,
	})
}
