package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var getBackupsEvent = "GET_BACKUPS_LIST"

func GetBackupsHandler(conn *websocket.Conn, data []byte) {
	var message BaseRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
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
		conn.WriteJSON(BaseResponse{
			Event:   getBackupsEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	conn.WriteJSON(GetBackupsResponse{
		BaseResponse: BaseResponse{
			Event:   getBackupsEvent,
			EventId: message.EventId,
			Success: true,
		},
		Data: list,
	})
}
