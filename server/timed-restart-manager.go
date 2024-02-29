package main

import (
	"fmt"
	"palworld-ds-gui-server/utils"

	"github.com/robfig/cron"
)

type TimedRestartManager struct {
	cron *cron.Cron
}

type TimedRestart struct {
	SaveName  string
	Timestamp int64
	Filename  string
	Size      int64
}

func NewTimedRestartManager() *TimedRestartManager {
	return &TimedRestartManager{}
}

func (t *TimedRestartManager) Init() {
	// nothing to do here yet
}

func (t *TimedRestartManager) Start(interval float32) {
	utils.Log(fmt.Sprintf("Restarting server every %.2f hours", interval))

	utils.Settings.TimedRestart.Enabled = true
	utils.Settings.TimedRestart.Interval = float32(interval)
	utils.SaveSettings()

	cronString := fmt.Sprintf("@every %.2fh", interval)

	if t.cron != nil {
		t.cron.Stop()
	}

	t.cron = cron.New()
	t.cron.AddFunc(cronString, func() {
		if !servermanager.IsRunning() {
			return
		}

		err := servermanager.Restart()
		if err != nil {
			utils.Log(fmt.Sprintf("Failed to auto restart server: %s", err.Error()))
		}
	})
	t.cron.Start()
}

func (t *TimedRestartManager) Stop() {
	if t.cron != nil {
		utils.Log("Timed restart stopped")
		t.cron.Stop()

		utils.Settings.TimedRestart.Enabled = false
		utils.SaveSettings()
	}
}

func (t *TimedRestartManager) Dispose() {
	t.Stop()
	utils.LogToFile("timed-restart-manager.go: Dispose()", false)
}
