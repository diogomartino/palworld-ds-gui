package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var updateServerEvent = "UPDATE_SERVER"

func UpdateServerHandler(conn *websocket.Conn, data []byte) {
	EmitServerStatus("UPDATING", nil)

	var message BaseRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   updateServerEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	err = servermanager.Update()
	if err != nil {
		utils.Log("Error updating the server: " + err.Error())
		EmitServerStatus("STOPPED", nil)
		return
	}

	EmitServerStatus("STOPPED", nil)
}
