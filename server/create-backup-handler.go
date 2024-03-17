package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var createBackupEvent = "CREATE_BACKUP"

func CreateBackupHandler(conn *websocket.Conn, data []byte) {
	var message StartBackupsRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
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

	conn.WriteJSON(BaseResponse{
		Event:   createBackupEvent,
		EventId: message.EventId,
		Success: success,
	})
}
