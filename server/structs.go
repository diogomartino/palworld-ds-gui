package main

import (
	"palworld-ds-gui-server/utils"
)

type BaseRequest struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
}

type BaseResponse struct {
	Event   string `json:"event"`
	EventId string `json:"eventId"`
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

type ClientInitResData struct {
	CurrentServerStatus       string                        `json:"currentServerStatus"`
	CurrentLaunchParams       string                        `json:"currentLaunchParams"`
	CurrentConfig             string                        `json:"currentConfig"`
	CurrentSaveName           string                        `json:"currentSaveName"`
	CurrentBackupsSettings    utils.PersistedSettingsBackup `json:"currentBackupsSettings"`
	CurrentAdditionalSettings AdditionalSettings            `json:"currentAdditionalSettings"`
	CurrentBackupsList        []Backup                      `json:"currentBackupsList"`
	ServerVersion             string                        `json:"serverVersion"`
}

type AdditionalSettings struct {
	TimedRestart   utils.PersistedTimedRestart   `json:"timedRestart"`
	RestartOnCrash utils.PersistedRestartOnCrash `json:"restartOnCrash"`
}

// ------------ RESPONSES ------------

type SimpleResponse struct {
	BaseResponse
	Data string `json:"data"`
}

type BackupSettingsResponse struct {
	BaseResponse
	Data utils.PersistedSettingsBackup `json:"data"`
}

type TimedRestartSettingsResponse struct {
	BaseResponse
	Data AdditionalSettings `json:"data"`
}

type ClientInitResponse struct {
	BaseResponse
	Data ClientInitResData `json:"data"`
}

type GetBackupsResponse struct {
	BaseResponse
	Data []Backup `json:"data"`
}

type GetBackupsConfigResponse struct {
	BaseResponse
	Data utils.PersistedSettingsBackup `json:"data"`
}

// ------------ REQUESTS ------------

type WriteSaveRequest struct {
	BaseRequest
	Data struct {
		NewSaveName string `json:"saveName"`
	}
}

type WriteConfigRequest struct {
	BaseRequest
	Data struct {
		NewConfig string `json:"config"`
	}
}

type StartBackupsRequest struct {
	BaseRequest
	Data struct {
		Interval  float32 `json:"interval"`
		KeepCount int     `json:"keepCount"`
	}
}

type DeleteBackupRequest struct {
	BaseRequest
	Data struct {
		Filename string `json:"backupFileName"`
	}
}

type RestoreBackupRequest struct {
	BaseRequest
	Data struct {
		Filename string `json:"backupFileName"`
	}
}

type SaveLaunchParamsRequest struct {
	BaseRequest
	Data struct {
		LaunchParams string `json:"launchParams"`
	}
}

type RconExecRequest struct {
	BaseRequest
	Data struct {
		Hostname string `json:"hostname"`
		Password string `json:"password"`
		Command  string `json:"command"`
	}
}

type SaveAdditionalSettingsRequest struct {
	BaseRequest
	Data struct {
		NewSettings AdditionalSettings `json:"newSettings"`
	}
}
