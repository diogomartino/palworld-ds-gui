package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var restoreBackupEvent = "RESTORE_BACKUP"

func RestoreBackupHandler(conn *websocket.Conn, data []byte) {
	var message RestoreBackupRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
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
		conn.WriteJSON(BaseResponse{
			Event:   restoreBackupEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	EmitServerStatus("STOPPED", nil)

	conn.WriteJSON(BaseResponse{
		Event:   restoreBackupEvent,
		EventId: message.EventId,
		Success: true,
	})
}
