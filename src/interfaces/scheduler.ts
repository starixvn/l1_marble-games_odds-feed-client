export interface TimedCallback {
  callback: Function;
  timeoutId: NodeJS.Timeout;
}

export interface Scheduler {
  schedule: (
    time: Date,
    callback: Function,
    options?: { key?: string; keyOverride?: string; ignorePast?: boolean }
  ) => string;
  cancel: (id: string) => void;
  dispose: () => void;
}
