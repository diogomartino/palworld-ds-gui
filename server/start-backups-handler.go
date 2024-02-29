package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type StartBackupsRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		Interval  float32 `json:"interval"`
		KeepCount int     `json:"keepCount"`
	}
}

type StartBackupsRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

var startBackupsEvent = "START_BACKUPS"

func StartBackupsHandler(conn *websocket.Conn, data []byte) {
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

	backupmanager.Start(message.Data.Interval, message.Data.KeepCount)

	conn.WriteJSON(StartBackupsRes{
		Event:   startBackupsEvent,
		EventId: message.EventId,
		Success: true,
	})

	EmitBackupSettings(nil)
}
