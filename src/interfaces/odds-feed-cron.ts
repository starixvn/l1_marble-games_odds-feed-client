export interface OddsFeedCron {
  start(startCurrentEvents?: boolean): Promise<void>;
  schedule(): Promise<void>;
  scheduleEvent({ eventID }: { eventID: number }): Promise<void>;
}
