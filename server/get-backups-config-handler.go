package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type GetBackupsConfigRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
}

type GetBackupsConfigRes struct {
	Event   string                        `json:"event"`
	EventId string                        `json:"eventId"`
	Success bool                          `json:"success"`
	Error   string                        `json:"error"`
	Data    utils.PersistedSettingsBackup `json:"data"`
}

var getBackupsConfigEvent = "GET_BACKUPS_SETTINGS"

func GetBackupsConfigHandler(conn *websocket.Conn, data []byte) {
	var message GetBackupsConfigRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(GetBackupsConfigRes{
			Event:   getBackupsConfigEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	conn.WriteJSON(GetBackupsConfigRes{
		Event:   getBackupsConfigEvent,
		EventId: message.EventId,
		Success: true,
		Data:    utils.Settings.Backup,
	})
}
