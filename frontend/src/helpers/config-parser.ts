/* eslint-disable no-prototype-builtins */
import { ConfigKey, TConfig, configTypes } from '../types/server-config';

const getSubstringBetweenStrings = (inputString, startString, endString) => {
  let startIndex = inputString.indexOf(startString);

  if (startIndex !== -1) {
    startIndex += startString.length;

    const endIndex = inputString.indexOf(endString, startIndex);

    if (endIndex !== -1) {
      return inputString.substring(startIndex, endIndex);
    }

    return '';
  }

  return '';
};

const keyOrder = [
  ConfigKey.ServerName,
  ConfigKey.ServerDescription,
  ConfigKey.ServerPassword,
  ConfigKey.PublicIP,
  ConfigKey.PublicPort,
  ConfigKey.ServerPlayerMaxNum,
  ConfigKey.AdminPassword
];

export const parseConfig = (config: string) => {
  const optionSettingsString = getSubstringBetweenStrings(
    config,
    'OptionSettings=(',
    ')'
  );

  const settings = {};

  optionSettingsString.split(',').forEach((setting) => {
    const [key, value] = setting.split('=')?.map((s) => s.trim()) || [];

    if (configTypes[key] === 'number') {
      settings[key] = parseFloat(value);
    } else if (configTypes[key] === 'boolean') {
      settings[key] = value === 'True';
    } else {
      // string or unknown
      settings[key] = value?.replace(/"/g, '') || '';
    }
  });

  // Create a new object with sorted keys
  const sortedSettings = {};

  // Add keys in the desired order
  keyOrder.forEach((key) => {
    if (settings.hasOwnProperty(key)) {
      sortedSettings[key] = settings[key];
      delete settings[key];
    }
  });

  // Add the remaining keys
  for (const key in settings) {
    if (settings.hasOwnProperty(key)) {
      sortedSettings[key] = settings[key];
    }
  }

  return sortedSettings as TConfig;
};

export const serializeConfig = (config: TConfig) => {
  const template = `; This configuration file was generated by PalWorld Dedicated Server GUI
; https://github.com/cenas
[/Script/Pal.PalGameWorldSettings]
OptionSettings=({__SETTINGS__})`;

  const settings: string[] = [];

  for (const key in config) {
    if (config.hasOwnProperty(key)) {
      const value = config[key];
      const sanitizedValue = value.toString()?.replace?.(/"/g, '') || '';

      if (configTypes[key] === 'string') {
        settings.push(`${key}="${sanitizedValue}"`);
      } else if (configTypes[key] === 'boolean') {
        settings.push(`${key}=${value ? 'True' : 'False'}`);
      } else {
        settings.push(`${key}=${sanitizedValue}`);
      }
    }
  }

  return template.replace('{__SETTINGS__}', settings.join(','));
};
