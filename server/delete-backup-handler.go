package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type DeleteBackupRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		Filename string `json:"backupFileName"`
	}
}

type DeleteBackupRes struct {
	Event   string   `json:"event"`
	EventId string   `json:"eventId"`
	Success bool     `json:"success"`
	Error   string   `json:"error"`
	Data    []Backup `json:"data"`
}

var deleteBackupEvent = "DELETE_BACKUP"

func DeleteBackupHandler(conn *websocket.Conn, data []byte) {
	var message DeleteBackupRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(DeleteBackupRes{
			Event:   deleteBackupEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	err = backupmanager.Delete(message.Data.Filename)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(DeleteBackupRes{
			Event:   deleteBackupEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}
	conn.WriteJSON(CreateBackupRes{
		Event:   createBackupEvent,
		EventId: message.EventId,
		Success: true,
	})

	backupmanager.EmitBackupList()
}
