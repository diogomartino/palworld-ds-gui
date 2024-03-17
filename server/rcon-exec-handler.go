package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var rconExecHandlerEvent = "RCON_EXECUTE"

func RconExecHandlerHandler(conn *websocket.Conn, data []byte) {
	var message RconExecRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   rconExecHandlerEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	result, err := rconclient.Execute(message.Data.Hostname, message.Data.Password, message.Data.Command)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   rconExecHandlerEvent,
			EventId: message.EventId,
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	conn.WriteJSON(SimpleResponse{
		BaseResponse: BaseResponse{
			Event:   rconExecHandlerEvent,
			EventId: message.EventId,
			Success: true,
		},
		Data: result,
	})
}
