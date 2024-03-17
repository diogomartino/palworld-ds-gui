package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var stopServerEvent = "STOP_SERVER"

func StopServerHandler(conn *websocket.Conn, data []byte) {
	EmitServerStatus("STOPPING", nil)

	var message BaseRequest
	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   stopServerEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	err = servermanager.Stop()

	if err != nil {
		utils.Log(err.Error())
		EmitServerStatus("ERROR", nil)
	} else {
		EmitServerStatus("STOPPED", nil)
	}
}
