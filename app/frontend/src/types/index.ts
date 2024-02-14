export type TTheme = 'light' | 'dark';

export type TGenericObject = {
  [key: string]: any;
};

export type TGenericFunction = (...args: any[]) => any;

export enum Modal {
  ACTION_CONFIRMATION = 'ACTION_CONFIRMATION',
  VERSION_MISMATCH = 'VERSION_MISMATCH'
}

export enum ServerStatus {
  STARTED = 'STARTED',
  STOPPED = 'STOPPED',
  STARTING = 'STARTING',
  STOPPING = 'STOPPING',
  RESTARTING = 'RESTARTING',
  UPDATING = 'UPDATING',
  ERROR = 'ERROR'
}

export enum AppEvent {
  RETURN_STEAM_IMAGE = 'RETURN_STEAM_IMAGE'
}

export enum SocketAction {
  INIT = 'INIT',
  START_SERVER = 'START_SERVER',
  STOP_SERVER = 'STOP_SERVER',
  RESTART_SERVER = 'RESTART_SERVER',
  UPDATE_SERVER = 'UPDATE_SERVER',
  READ_CONFIG = 'READ_CONFIG',
  READ_SAVE_NAME = 'READ_SAVE_NAME',
  WRITE_CONFIG = 'WRITE_CONFIG',
  WRITE_SAVE_NAME = 'WRITE_SAVE_NAME',
  START_BACKUPS = 'START_BACKUPS',
  STOP_BACKUPS = 'STOP_BACKUPS',
  GET_BACKUPS_LIST = 'GET_BACKUPS_LIST',
  DELETE_BACKUP = 'DELETE_BACKUP',
  CREATE_BACKUP = 'CREATE_BACKUP',
  OPEN_BACKUP = 'OPEN_BACKUP',
  RESTORE_BACKUP = 'RESTORE_BACKUP',
  DOWNLOAD_BACKUP = 'DOWNLOAD_BACKUP',
  GET_BACKUPS_SETTINGS = 'GET_BACKUPS_SETTINGS',
  SAVE_LAUNCH_PARAMS = 'SAVE_LAUNCH_PARAMS'
}

export enum SocketEvent {
  SERVER_STATUS_CHANGED = 'SERVER_STATUS_CHANGED',
  SERVER_CONFIG_CHANGED = 'SERVER_CONFIG_CHANGED',
  SERVER_SAVE_NAME_CHANGED = 'SERVER_SAVE_NAME_CHANGED',
  BACKUP_LIST_CHANGED = 'BACKUP_LIST_CHANGED',
  BACKUP_SETTINGS_CHANGED = 'BACKUP_SETTINGS_CHANGED',
  LAUNCH_PARAMS_CHANGED = 'LAUNCH_PARAMS_CHANGED',
  CUSTOM_ERROR = 'CUSTOM_ERROR',
  ADD_CONSOLE_ENTRY = 'ADD_CONSOLE_ENTRY'
}

export type TConsoleEntry = {
  timestamp: number;
  message: string;
  msgType: 'stdout' | 'stderr';
};

export type TBackupSettings = {
  enabled: boolean;
  intervalHours: number;
  keepCount: number;
};

export type TServerCredentials = {
  host: string;
  apiKey: string;
};

export type TClientInitedData = {
  currentServerStatus: ServerStatus;
  currentLaunchParams: string;
  currentConfig: string;
  currentSaveName: string;
  currentBackupsSettings: TBackupSettings;
  currentBackupsList: TBackup[];
  serverVersion: string;
};

export type TSettings = {
  theme: 'light' | 'dark';
  serverCredentials: TServerCredentials;
};

export type TSteamImageMap = {
  [steamId64: string]: string;
};

export type TSocketMessage = {
  event: SocketEvent;
  eventId: string;
  data: any;
  success: boolean;
  error: string;
};

export type TBackup = {
  fileName: string;
  saveName: string;
  size: number;
  timestamp: number;
};
