package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type StopBackupsRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		Interval  int `json:"interval"`
		KeepCount int `json:"keepCount"`
	}
}

type StopBackupsRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

var stopBackupsEvent = "STOP_BACKUPS"

func StopBackupsHandler(conn *websocket.Conn, data []byte) {
	var message StopBackupsRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(StopBackupsRes{
			Event:   stopBackupsEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	backupmanager.Stop()

	conn.WriteJSON(StopBackupsRes{
		Event:   stopBackupsEvent,
		EventId: message.EventId,
		Success: true,
	})

	EmitBackupSettings(nil)
}
