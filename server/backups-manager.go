package main

import (
	"fmt"
	"os"
	"palworld-ds-gui-server/utils"
	"path"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/mholt/archiver/v3"
	"github.com/robfig/cron"
)

type BackupManager struct {
	cron *cron.Cron
}

type Backup struct {
	SaveName  string
	Timestamp int64
	Filename  string
	Size      int64
}

func NewBackupManager() *BackupManager {
	return &BackupManager{}
}

func (b *BackupManager) GetBackupsList() ([]Backup, error) {
	files, err := os.ReadDir(utils.Config.BackupsPath)

	if err != nil {
		return nil, err
	}

	backups := []Backup{}

	re, err := regexp.Compile(`^bckp-\d+-\w+\.zip$`)
	if err != nil {
		return nil, err
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		matched := re.MatchString(file.Name())
		if !matched {
			continue
		}

		timestamp, err := strconv.ParseInt(strings.Split(file.Name(), "-")[1], 10, 64)

		if err != nil {
			return nil, err
		}

		fileInfo, err := file.Info()
		if err != nil {
			return nil, err
		}

		backups = append(backups, Backup{
			SaveName:  strings.Replace(strings.Split(file.Name(), "-")[2], ".zip", "", 1),
			Timestamp: timestamp,
			Filename:  file.Name(),
			Size:      fileInfo.Size(),
		})
	}

	sort.Slice(backups, func(i, j int) bool {
		return backups[i].Timestamp < backups[j].Timestamp
	})

	return backups, nil
}

func (b *BackupManager) CheckCount() {
	backups, err := b.GetBackupsList()

	if err != nil {
		return
	}

	if len(backups) <= utils.Settings.Backup.KeepCount {
		return
	}

	backupsToDelete := len(backups) - utils.Settings.Backup.KeepCount

	utils.Log(fmt.Sprintf("Found %d backups, deleting %d", len(backups), backupsToDelete))

	for i := 0; i < backupsToDelete; i++ {
		b.Delete(backups[i].Filename)
	}
}

func (b *BackupManager) CreateBackup() error {
	saveName := ReadSaveName()

	if len(saveName) == 0 {
		return fmt.Errorf("can't create a backup yet, please join the server first")
	}

	utils.Log("Creating backup...")

	unix := time.Now().Unix()
	backupName := fmt.Sprintf("bckp-%d-%s.zip", unix, saveName)
	worldPath := path.Join(utils.Config.ServerSaveDir, saveName)
	archiver := archiver.NewZip()

	files, err := os.ReadDir(worldPath)
	if err != nil {
		return err
	}

	var filePaths []string
	for _, file := range files {
		filePath := path.Join(worldPath, file.Name())
		filePaths = append(filePaths, filePath)
	}

	err = archiver.Archive(filePaths, path.Join(utils.Config.BackupsPath, backupName))
	if err != nil {
		return err
	}

	utils.Log("Backup created")
	b.CheckCount()

	b.EmitBackupList()

	return nil
}

func (b *BackupManager) EmitBackupList() {
	backups, err := b.GetBackupsList()

	if err != nil {
		utils.Log(err.Error())
		return
	}

	type BackupListResponse struct {
		Event   string   `json:"event"`
		Success bool     `json:"success"`
		Data    []Backup `json:"data"`
	}

	BroadcastJSON(BackupListResponse{
		Event:   "BACKUP_LIST_CHANGED",
		Success: true,
		Data:    backups,
	}, nil)
}

func (b *BackupManager) Init() {
	if _, err := os.Stat(utils.Config.BackupsPath); os.IsNotExist(err) {
		os.Mkdir(utils.Config.BackupsPath, 0755)
	}
}

func (b *BackupManager) Start(interval int, keepCount int) {
	utils.Log(fmt.Sprintf("Creating backups every %d hours (keep %d)", interval, keepCount))

	utils.Settings.Backup.Enabled = true
	utils.Settings.Backup.KeepCount = keepCount
	utils.Settings.Backup.Interval = float32(interval)
	utils.SaveSettings()

	cronString := fmt.Sprintf("@every %dh", interval)

	if b.cron != nil {
		b.cron.Stop()
	}

	b.cron = cron.New()
	b.cron.AddFunc(cronString, func() {
		err := b.CreateBackup()
		if err != nil {
			utils.Log(fmt.Sprintf("Error creating backup: %s", err.Error()))
		}
	})
	b.cron.Start()
}

func (b *BackupManager) Delete(backupFileName string) error {
	err := os.Remove(path.Join(utils.Config.BackupsPath, backupFileName))

	if err != nil {
		return err
	}

	utils.Log(fmt.Sprintf("Backup %s deleted", backupFileName))

	return nil
}

func (b *BackupManager) Stop() {
	if b.cron != nil {
		utils.Log("Backups manager stopped")
		b.cron.Stop()

		utils.Settings.Backup.Enabled = false
		utils.SaveSettings()
	}
}

func (b *BackupManager) Open(backupFileName string) error {
	return utils.OpenExplorerWithFile(utils.Config.BackupsPath, backupFileName)
}

func (b *BackupManager) Restore(backupFileName string) error {
	err := servermanager.Stop()
	if err != nil {
		return err
	}

	utils.Log(fmt.Sprintf("Restoring backup %s", backupFileName))

	split := strings.Split(backupFileName, "-")
	saveName := strings.Replace(split[2], ".zip", "", 1)
	worldPath := path.Join(utils.Config.ServerSaveDir, saveName)

	err = os.RemoveAll(worldPath)
	if err != nil {
		return err
	}

	err = os.Mkdir(worldPath, 0755)
	if err != nil {
		return err
	}

	archiver := archiver.NewZip()
	err = archiver.Unarchive(path.Join(utils.Config.BackupsPath, backupFileName), worldPath)
	if err != nil {
		return err
	}

	utils.Log("Backup restored")

	return nil
}

func (b *BackupManager) Dispose() {
	b.Stop()
	utils.LogToFile("backups-manager.go: Dispose()", false)
}
