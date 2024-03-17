package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var readSaveEvent = "READ_SAVE_NAME"

func ReadSaveHandler(conn *websocket.Conn, data []byte) {
	var message BaseRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   readSaveEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	conn.WriteJSON(SimpleResponse{
		BaseResponse: BaseResponse{
			Event:   readSaveEvent,
			EventId: message.EventId,
			Success: true,
		},
		Data: ReadSaveName(),
	})
}
