package utils

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

type ConsoleEntry struct {
	Message   string
	Timestamp int64
	MsgType   string
}

type AppConfig struct {
	LogsPath   string
	AppDataDir string
}

var Config AppConfig = AppConfig{
	AppDataDir: GetAppDataDir(),
	LogsPath:   filepath.Join(GetAppDataDir(), "logs.txt"),
}

func GetCurrentDir() string {
	ex, err := os.Executable()

	if err != nil {
		panic(err)
	}

	dir := filepath.Dir(ex)

	return dir
}

func GetAppDataDir() string {
	appDataDir := os.Getenv("APPDATA")
	return filepath.Join(appDataDir, "PalworldDSGUI")
}

func LogToFile(message string) {
	logsFile, err := os.OpenFile(Config.LogsPath, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		panic(err)
	}

	defer logsFile.Close()

	formatedMessage := fmt.Sprintf("[%s] %s", time.Now().Format("02-01-2006 15:04:05"), message)

	logsFile.WriteString(formatedMessage + "\n")
}

func OpenExplorerWithFile(folderPath, fileName string) error {
	cmd := exec.Command("explorer", "/select,", fileName)
	cmd.Dir = folderPath

	err := cmd.Run()
	if err != nil {
		return err
	}

	return nil
}
