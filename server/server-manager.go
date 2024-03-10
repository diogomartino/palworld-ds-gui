package main

import (
	"errors"
	"os"
	"os/exec"
	"palworld-ds-gui-server/utils"
	"strings"
	"time"

	"github.com/mitchellh/go-ps"
)

type ServerManager struct {
	cmd       *exec.Cmd
	serverCmd *exec.Cmd
	serverPid int
}

func NewServerManager() *ServerManager {
	return &ServerManager{}
}

func (s *ServerManager) Init() {
	proc, _ := utils.FindProcessByName(utils.Config.ServerProcessName)

	if proc != nil {
		utils.Log("A server is already running, killing it...")

		err := utils.KillProcessByPid(proc.Pid())

		if err != nil {
			utils.Log("Error stopping server: " + err.Error())
			return
		}

		utils.Log("Server killed successfully")
	}

	if _, err := os.Stat(utils.Config.ServerPath); os.IsNotExist(err) {
		utils.Log("Server directory not found, creating...")
		utils.Log("If you already have a server, please place it in " + utils.Config.ServerPath)
		os.Mkdir(utils.Config.ServerPath, 0755)
		s.DownloadDedicatedServer()
	}
}

func (s *ServerManager) DownloadDedicatedServer() error {
	utils.Log("Downloading dedicated server...")

	if s.IsRunning() {
		utils.Log("Cannot update server while it's running. Stopping it...")
		s.Stop()
	}

	cmd := exec.Command(utils.Config.SteamCmdExe,
		"+force_install_dir", utils.Config.ServerPath,
		"+login", "anonymous",
		"+app_update", utils.Config.AppId, "validate",
		"+quit")

	cmd.Dir = utils.Config.SteamCmdPath
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	s.cmd = cmd

	err := cmd.Run()
	if err != nil {
		return err
	}

	utils.Log("Server downloaded and updated successfully!")

	return nil
}

func (s *ServerManager) IsRunning() bool {
	if s.serverPid == 0 {
		return false
	}

	proc, _ := utils.FindProcessByPid(s.serverPid)

	return proc != nil
}

func (s *ServerManager) MonitorServerProcess() {
	for {
		time.Sleep(4 * time.Second)

		// was killed via gui
		if s.serverPid == 0 {
			break
		}

		proc, err := utils.FindProcessByPid(s.serverPid)

		if proc == nil || err != nil {
			utils.Log("Server seems to have stopped (crashed?)")
			EmitServerStatus("STOPPED", nil)

			if utils.Settings.RestartOnCrash.Enabled {
				utils.Log("Restart on crash is enabled, attempting to restart...")

				err := s.Start()
				if err == nil {
					EmitServerStatus("STARTED", nil)
				}
			}

			break
		}
	}
}

func (s *ServerManager) Start() error {
	utils.Log("Starting dedicated server...")

	launchParamsSlice := strings.Split(utils.Settings.General.LaunchParams, " ")

	s.serverCmd = exec.Command(utils.Config.ServerExe, launchParamsSlice...)
	s.serverCmd.Dir = utils.Config.ServerPath
	s.serverCmd.Stdout = os.Stdout
	s.serverCmd.Stderr = os.Stderr

	err := s.serverCmd.Start()
	if err != nil {
		return err
	}

	var attempts int = 10
	var proc ps.Process

	whileLoop := true
	for whileLoop {
		time.Sleep(1 * time.Second)

		proc, err = utils.FindProcessByName(utils.Config.ServerProcessName)
		if err != nil {
			continue
		}

		if proc != nil {
			whileLoop = false
		}

		attempts--

		if attempts <= 0 {
			whileLoop = false
		}
	}

	if proc == nil {
		return errors.New("server process not found")
	}

	s.serverPid = proc.Pid()
	utils.Log("Server started")

	go s.MonitorServerProcess()

	return nil
}

func (s *ServerManager) Stop() error {
	if !s.IsRunning() {
		return nil
	}

	utils.Log("Stopping dedicated server...")

	err := utils.KillProcessByPid(s.serverPid)
	if err != nil {
		return err
	}

	if s.serverCmd != nil && s.serverCmd.Process != nil {
		err := s.serverCmd.Process.Kill()
		if err != nil {
			return err
		}
	}

	utils.Log("Server stopped")
	s.serverPid = 0

	return nil
}

func (s *ServerManager) Restart() error {
	utils.Log("Restarting dedicated server...")

	err := s.Stop()
	if err != nil {
		return err
	}

	err = s.Start()
	if err != nil {
		return err
	}

	return nil
}

func (s *ServerManager) Update() error {
	err := s.DownloadDedicatedServer()
	if err != nil {
		return err
	}

	return nil
}

func (s *ServerManager) Dispose() {
	if s.cmd != nil && s.cmd.Process != nil {
		err := s.cmd.Process.Kill()
		if err != nil {
			utils.Log(err.Error())
		}
	}

	s.Stop()
	utils.Log("dedicated-server.go: Dispose()")
}
