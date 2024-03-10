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
	if t.cron != nil {
		return
	}

	utils.Log(fmt.Sprintf("Restarting server every %.2f hours", interval))
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
	if t.cron == nil {
		return
	}

	utils.Log("Timed restart stopped")
	t.cron.Stop()

	t.cron = nil
}

func (t *TimedRestartManager) Dispose() {
	t.Stop()
	utils.LogToFile("timed-restart-manager.go: Dispose()", false)
}
