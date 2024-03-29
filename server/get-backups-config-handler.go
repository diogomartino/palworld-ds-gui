package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var getBackupsConfigEvent = "GET_BACKUPS_SETTINGS"

func GetBackupsConfigHandler(conn *websocket.Conn, data []byte) {
	var message BaseRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   getBackupsConfigEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	conn.WriteJSON(GetBackupsConfigResponse{
		BaseResponse: BaseResponse{
			Event:   getBackupsConfigEvent,
			EventId: message.EventId,
			Success: true,
		},
		Data: utils.Settings.Backup,
	})
}
