package main

import (
	"fmt"
	"os"
	"palworld-ds-gui-server/utils"
	"regexp"
	"strings"
)

func ReadSaveName() string {
	// If file doesn't exist yet, return empty string (user hasn't joined the server for the first time yet)
	if _, err := os.Stat(utils.Config.ServerGameUserSettingsPath); os.IsNotExist(err) {
		return ""
	}

	settingsData, err := os.ReadFile(utils.Config.ServerGameUserSettingsPath)
	if err != nil {
		panic(err)
	}

	settingsString := strings.TrimSpace(string(settingsData))
	re := regexp.MustCompile(`DedicatedServerName=([^\s]+)`)
	match := re.FindStringSubmatch(settingsString)

	if len(match) == 2 {
		return match[1]
	}

	return ""
}

func WriteSaveName(newSaveName string) error {
	settingsData, err := os.ReadFile(utils.Config.ServerGameUserSettingsPath)
	if err != nil {
		return err
	}

	settingsString := strings.TrimSpace(string(settingsData))
	re := regexp.MustCompile(`DedicatedServerName=([^\s]+)`)
	settingsString = re.ReplaceAllString(settingsString, fmt.Sprintf("DedicatedServerName=%s", newSaveName))

	err = os.WriteFile(utils.Config.ServerGameUserSettingsPath, []byte(settingsString), os.ModePerm)
	if err != nil {
		return err
	}

	return nil
}

func ReadConfig() string {
	configPath := utils.Config.ServerConfigPath

	// If config file doesn't exist yet, use default config
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		configPath = utils.Config.ServerDefaultConfigPath
	}

	configData, err := os.ReadFile(configPath)
	if err != nil {
		panic(err)
	}

	configString := strings.TrimSpace(string(configData))
	isEmpty := len(configString) == 0

	// if the config file is empty, use default config
	if isEmpty {
		configData, err := os.ReadFile(utils.Config.ServerDefaultConfigPath)

		if err != nil {
			panic(err)
		}

		return strings.TrimSpace(string(configData))
	}

	return configString
}

func WriteConfig(configString string) {
	if _, err := os.Stat(utils.Config.ServerConfigDir); os.IsNotExist(err) {
		os.MkdirAll(utils.Config.ServerConfigDir, 0755)
	}

	if _, err := os.Stat(utils.Config.ServerConfigPath); os.IsNotExist(err) {

		_, err := os.Create(utils.Config.ServerConfigPath)
		if err != nil {
			panic(err)
		}
	}

	err := os.WriteFile(utils.Config.ServerConfigPath, []byte(configString), 0644)
	if err != nil {
		panic(err)
	}
}
