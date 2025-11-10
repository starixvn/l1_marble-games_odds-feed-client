interface Logger {
  logError: (message: string) => void;
  log: (message: string, level: string) => void;
}

export { Logger };
