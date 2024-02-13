package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type GetBackupsRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
}

type GetBackupsRes struct {
	Event   string   `json:"event"`
	EventId string   `json:"eventId"`
	Success bool     `json:"success"`
	Error   string   `json:"error"`
	Data    []Backup `json:"data"`
}

var getBackupsEvent = "GET_BACKUPS_LIST"

func GetBackupsHandler(conn *websocket.Conn, data []byte) {
	var message GetBackupsRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(GetBackupsRes{
			Event:   getBackupsEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	list, err := backupmanager.GetBackupsList()
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(GetBackupsRes{
			Event:   getBackupsEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	conn.WriteJSON(GetBackupsRes{
		Event:   getBackupsEvent,
		EventId: message.EventId,
		Success: true,
		Data:    list,
	})
}
