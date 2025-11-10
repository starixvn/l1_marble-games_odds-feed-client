import { Event as oddsFeedEvent } from "@/domain";

export interface OddsFeedScheduler {
  scheduleEventUpcoming(event: oddsFeedEvent): void;
  scheduleEvent(event: oddsFeedEvent): void;
}
