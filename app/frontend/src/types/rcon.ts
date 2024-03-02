export type TRconInfo = {
  name: string;
  version: string;
};

export type TRconPlayer = {
  name: string;
  uid: string;
  steamId: string;
  image?: string;
};

export enum RconCommand {
  INFO = 'info',
  SHOW_PLAYERS = 'showplayers',
  SAVE = 'save',
  SHUTDOWN = 'shutdown',
  BROADCAST = 'broadcast',
  BAN = 'banplayer',
  KICK = 'kickplayer'
}
