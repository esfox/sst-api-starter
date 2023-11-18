import { Config, type Stack } from 'sst/constructs';

export function Secrets(stack: Stack) {
  const DB_CONNECTION = new Config.Secret(stack, 'DB_CONNECTION');

  return {
    DB_CONNECTION,
  };
}
