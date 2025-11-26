import { Logger, OddsFeedService, OddsFeedPullService } from "@/interfaces";
import { Event } from "@/domain";
import { OddsFeedStore } from "./odds-feed-store";

interface OddsFeedPullServiceContainer<TEvent extends Event = Event> {
  oddsFeedService: OddsFeedService;
  logService: Logger;
  oddsFeedFilter: (event: TEvent, index: number, array: TEvent[]) => boolean;
  oddsFeedStore: OddsFeedStore;
}

interface PullContext {
  validator?: (event: Event) => boolean;
}

export class OddsFeedPullServiceImpl<TEvent extends Event = Event> implements OddsFeedPullService<TEvent> {
  private readonly oddsFeedService: OddsFeedService;
  private readonly logService: Logger;
  private readonly oddsFeedStore: OddsFeedStore;
  private readonly oddsFeedFilter: (event: TEvent, index: number, array: TEvent[]) => boolean;

  constructor(container: OddsFeedPullServiceContainer) {
    this.oddsFeedService = container.oddsFeedService;
    this.logService = container.logService;
    this.oddsFeedFilter = container.oddsFeedFilter;
    this.oddsFeedStore = container.oddsFeedStore;
  }

  async pullUpcoming() {
    const upcomingEvents = await this.oddsFeedService.fetchSchedule();

    return (upcomingEvents as TEvent[]).filter(this.oddsFeedFilter);
  }

  async pullEventWithEventDetails(eventId: number, context?: PullContext) {
    const event = await this.oddsFeedService.fetchEventDetails(eventId, context?.validator);
    if (!event) {
      this.logService.logError(`Failed to get event details for event ${eventId}`);
      return undefined;
    }
    this.oddsFeedStore.setEvent(event);
    return event as TEvent;
  }
}
