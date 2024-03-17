package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var restartServerEvent = "RESTART_SERVER"

func RestartServerHandler(conn *websocket.Conn, data []byte) {
	EmitServerStatus("RESTARTING", nil)

	var message BaseRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   restartServerEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	err = servermanager.Restart()
	if err != nil {
		utils.Log("Error restarting the server: " + err.Error())
		EmitServerStatus("STOPPED", nil)
		return
	}

	EmitServerStatus("STARTED", nil)
}
