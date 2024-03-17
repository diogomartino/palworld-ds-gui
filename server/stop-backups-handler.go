package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var stopBackupsEvent = "STOP_BACKUPS"

func StopBackupsHandler(conn *websocket.Conn, data []byte) {
	var message BaseRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   stopBackupsEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	backupmanager.Stop()

	conn.WriteJSON(BaseResponse{
		Event:   stopBackupsEvent,
		EventId: message.EventId,
		Success: true,
	})

	EmitBackupSettings(nil)
}
