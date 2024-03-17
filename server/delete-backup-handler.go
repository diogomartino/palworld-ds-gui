package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var deleteBackupEvent = "DELETE_BACKUP"

func DeleteBackupHandler(conn *websocket.Conn, data []byte) {
	var message DeleteBackupRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
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
		conn.WriteJSON(BaseResponse{
			Event:   deleteBackupEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	conn.WriteJSON(BaseResponse{
		Event:   deleteBackupEvent,
		EventId: message.EventId,
		Success: true,
	})

	backupmanager.EmitBackupList()
}
