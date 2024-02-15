package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type RestoreBackupRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		Filename string `json:"backupFileName"`
	}
}

type RestoreBackupRes struct {
	Event   string   `json:"event"`
	EventId string   `json:"eventId"`
	Success bool     `json:"success"`
	Error   string   `json:"error"`
	Data    []Backup `json:"data"`
}

var restoreBackupEvent = "RESTORE_BACKUP"

func RestoreBackupHandler(conn *websocket.Conn, data []byte) {
	var message RestoreBackupRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(RestoreBackupRes{
			Event:   restoreBackupEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	err = backupmanager.Restore(message.Data.Filename)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(RestoreBackupRes{
			Event:   restoreBackupEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	EmitServerStatus("STOPPED", nil)

	conn.WriteJSON(CreateBackupRes{
		Event:   createBackupEvent,
		EventId: message.EventId,
		Success: true,
	})
}
