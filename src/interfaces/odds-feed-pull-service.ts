import { Event } from "@/domain";

export type PullContext = {
  validator?: (event: Event) => boolean;
}

export interface OddsFeedPullService<TEvent extends Event = Event> {
  pullUpcoming(): Promise<TEvent[]>;
  pullEventWithEventDetails(eventId: number, context?: PullContext): Promise<TEvent | undefined>;
}
