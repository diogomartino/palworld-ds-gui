package backupsmanager

import (
	"context"
	"fmt"
	"os"
	dedicatedserver "palword-ds-gui/dedicated-server"
	"palword-ds-gui/utils"
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
	cron            *cron.Cron
	dedicatedServer *dedicatedserver.DedicatedServer
	ctx             context.Context
	keepCount       int
}

type Backup struct {
	SaveName  string
	Timestamp int64
	Filename  string
	Size      int64
}

func NewBackupManager(dedicatedServer *dedicatedserver.DedicatedServer) *BackupManager {
	return &BackupManager{
		dedicatedServer: dedicatedServer,
		keepCount:       5,
	}
}

func (b *BackupManager) GetBackupsList() []Backup {
	files, err := os.ReadDir(utils.Config.BackupsPath)

	if err != nil {
		panic(err)
	}

	backups := []Backup{}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		matched, err := regexp.MatchString(`^bckp-\d+-\w+\.zip$`, file.Name())

		if err != nil {
			panic(err)
		}

		if !matched {
			continue
		}

		timestamp, err := strconv.ParseInt(strings.Split(file.Name(), "-")[1], 10, 64)

		if err != nil {
			panic(err)
		}

		fileInfo, err := file.Info()
		if err != nil {
			panic(err)
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

	return backups
}

func (b *BackupManager) CheckCount() {
	backups := b.GetBackupsList()

	if len(backups) <= b.keepCount {
		return
	}

	utils.PrintEx(b.ctx, fmt.Sprintf("Found %d backups, deleting %d", len(backups), len(backups)-b.keepCount), "DEDICATED_SERVER")

	for i := 0; i < len(backups)-b.keepCount; i++ {
		b.Delete(backups[i].Filename)
	}
}

func (b *BackupManager) CreateBackup() {
	saveName := b.dedicatedServer.ReadSaveName()

	if len(saveName) == 0 {
		utils.PrintEx(b.ctx, "Can't create backup, please join the server first", "DEDICATED_SERVER")
		return
	}

	utils.PrintEx(b.ctx, "Creating backup...", "DEDICATED_SERVER")

	unix := time.Now().Unix()
	backupName := fmt.Sprintf("bckp-%d-%s.zip", unix, saveName)
	worldPath := path.Join(utils.Config.ServerSaveDir, saveName)

	archiver := archiver.NewZip()

	files, err := os.ReadDir(worldPath)
	if err != nil {
		panic(err)
	}

	var filePaths []string
	for _, file := range files {
		filePath := path.Join(worldPath, file.Name())
		filePaths = append(filePaths, filePath)
	}

	err = archiver.Archive(filePaths, path.Join(utils.Config.BackupsPath, backupName))
	if err != nil {
		panic(err)
	}

	utils.PrintEx(b.ctx, "Backup created", "DEDICATED_SERVER")
	b.CheckCount()
}

func (b *BackupManager) Init(ctx context.Context) {
	b.ctx = ctx

	if _, err := os.Stat(utils.Config.BackupsPath); os.IsNotExist(err) {
		os.Mkdir(utils.Config.BackupsPath, 0755)
	}

	utils.PrintEx(b.ctx, "Backups manager is ready", "DEDICATED_SERVER")
}

func (b *BackupManager) Start(interval int, keepCount int) {
	utils.PrintEx(b.ctx, fmt.Sprintf("Creating backups every %d hours (keep %d)", interval, keepCount), "DEDICATED_SERVER")

	b.keepCount = keepCount
	cronString := fmt.Sprintf("@every %dh", interval)

	if b.cron != nil {
		b.cron.Stop()
	}

	b.cron = cron.New()
	b.cron.AddFunc(cronString, b.CreateBackup)
	b.cron.Start()
}

func (b *BackupManager) Delete(backupFileName string) {
	err := os.Remove(path.Join(utils.Config.BackupsPath, backupFileName))

	if err != nil {
		panic(err)
	}

	utils.PrintEx(b.ctx, fmt.Sprintf("Backup %s deleted", backupFileName), "DEDICATED_SERVER")
}

func (b *BackupManager) Stop() {
	if b.cron != nil {
		utils.PrintEx(b.ctx, "Backups manager stopped", "DEDICATED_SERVER")
		b.cron.Stop()
	}
}

func (b *BackupManager) Open(backupFileName string) {
	utils.OpenExplorerWithFile(utils.Config.BackupsPath, backupFileName)
}

func (b *BackupManager) Restore(backupFileName string) {
	b.dedicatedServer.Stop()

	utils.PrintEx(b.ctx, fmt.Sprintf("Restoring backup %s", backupFileName), "DEDICATED_SERVER")

	split := strings.Split(backupFileName, "-")
	saveName := strings.Replace(split[2], ".zip", "", 1)
	worldPath := path.Join(utils.Config.ServerSaveDir, saveName)

	err := os.RemoveAll(worldPath)
	if err != nil {
		panic(err)
	}

	err = os.Mkdir(worldPath, 0755)
	if err != nil {
		panic(err)
	}

	archiver := archiver.NewZip()
	err = archiver.Unarchive(path.Join(utils.Config.BackupsPath, backupFileName), worldPath)
	if err != nil {
		panic(err)
	}

	utils.PrintEx(b.ctx, "Backup restored", "DEDICATED_SERVER")
}

func (b *BackupManager) Dispose() {
	b.Stop()
}
