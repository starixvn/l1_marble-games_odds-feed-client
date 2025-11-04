import { Event } from "@/domain";

export interface OddsFeedPullService<TEvent extends Event = Event> {
  pullUpcoming(): Promise<TEvent[]>;
  pullEventWithEventDetails(eventId: number): Promise<TEvent | undefined>;
}
