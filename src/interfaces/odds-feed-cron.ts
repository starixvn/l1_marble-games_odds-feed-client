export interface OddsFeedCron {
    start(): Promise<void>;
    schedule(): Promise<void>;
    scheduleEvent({ eventID }: { eventID: number }): Promise<void>;
}