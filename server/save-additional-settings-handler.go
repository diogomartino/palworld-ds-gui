package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

var saveAdditionalSettingsEvent = "SAVE_ADDITIONAL_SETTINGS"

func SaveAdditionalSettingsHandler(conn *websocket.Conn, data []byte) {
	var message SaveAdditionalSettingsRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(BaseResponse{
			Event:   saveAdditionalSettingsEvent,
			EventId: message.EventId,
			Success: false,
		})
		return
	}

	utils.Settings.TimedRestart = message.Data.NewSettings.TimedRestart
	utils.Settings.RestartOnCrash = message.Data.NewSettings.RestartOnCrash
	utils.SaveSettings()

	if message.Data.NewSettings.TimedRestart.Enabled {
		// Restart to always apply new settings
		timedrestartmanager.Stop()
		timedrestartmanager.Start(message.Data.NewSettings.TimedRestart.Interval)
	} else {
		timedrestartmanager.Stop()
	}

	conn.WriteJSON(BaseResponse{
		Event:   saveAdditionalSettingsEvent,
		EventId: message.EventId,
		Success: true,
	})

	EmitAdditionalSettings(nil)
}
