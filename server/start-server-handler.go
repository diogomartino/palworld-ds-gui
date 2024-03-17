package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var startServerEvent = "START_SERVER"

func StartServerHandler(conn *websocket.Conn, data []byte) {
	EmitServerStatus("STARTING", nil)

	var message BaseRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   startServerEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	err = servermanager.Start()

	if err != nil {
		utils.Log(err.Error())
		EmitServerStatus("ERROR", nil)
	} else {
		EmitServerStatus("STARTED", nil)
	}
}
