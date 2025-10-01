import { Event as OddFeedEvent } from "@/domain";

export interface OddFeedScheduler {
    scheduleEventUpcoming(event: OddFeedEvent): void;
    scheduleEvent(event: OddFeedEvent): void;
}