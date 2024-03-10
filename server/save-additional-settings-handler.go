package main

import (
	"encoding/json"
	"palworld-ds-gui-server/utils"

	"github.com/gorilla/websocket"
)

type AdditionalSettings struct {
	TimedRestart   utils.PersistedTimedRestart   `json:"timedRestart"`
	RestartOnCrash utils.PersistedRestartOnCrash `json:"restartOnCrash"`
}

type SaveAdditionalSettingsRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Data    struct {
		NewSettings AdditionalSettings `json:"newSettings"`
	}
}

type SaveAdditionalSettingsRes struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Data    string `json:"data"`
}

var saveAdditionalSettingsEvent = "SAVE_ADDITIONAL_SETTINGS"

func SaveAdditionalSettingsHandler(conn *websocket.Conn, data []byte) {
	var message SaveAdditionalSettingsRequest

	err := json.Unmarshal(data, &message)
	if err != nil {
		utils.Log(err.Error())
		conn.WriteJSON(SaveAdditionalSettingsRes{
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

	conn.WriteJSON(SaveAdditionalSettingsRes{
		Event:   saveAdditionalSettingsEvent,
		EventId: message.EventId,
		Success: true,
	})

	EmitAdditionalSettings(nil)
}
