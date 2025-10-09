import { idHelper } from "@/utils";
import { 
    Logger, 
    OddsFeedService, 
    OddsFeedStore,
    OddsFeedPullService,
} from "@/interfaces";
import { Event } from "@/domain";

interface OddsFeedPullServiceContainer<TEvent extends Event = Event> {
    oddsFeedService: OddsFeedService;
    logService: Logger;
    oddsFeedStore: OddsFeedStore;
    oddsFeedFilter: (event: TEvent, index: number, array: TEvent[]) => boolean;
}

export class OddsFeedPullServiceImpl<TEvent extends Event = Event> implements OddsFeedPullService<TEvent> {
    private readonly oddsFeedService: OddsFeedService;
    private readonly oddsFeedStore: OddsFeedStore;
    private readonly logService: Logger;
    private readonly oddsFeedFilter: (event: TEvent, index: number, array: TEvent[]) => boolean;

    constructor(container: OddsFeedPullServiceContainer) {
        this.oddsFeedService = container.oddsFeedService;
        this.oddsFeedStore = container.oddsFeedStore;
        this.logService = container.logService;
        this.oddsFeedFilter = container.oddsFeedFilter;
    }

    async pullUpcoming() {
        const upcomingEvents = await this.oddsFeedService.fetchSchedule();
        const filteredEvents = (upcomingEvents as TEvent[]).filter(this.oddsFeedFilter);
        filteredEvents.forEach((event) => {
            const gameId = idHelper.extractGameId(event.eventID);
            this.oddsFeedStore.setEventByGameId(gameId, event.eventID, event);
        });

        return filteredEvents;
    }

    async pullEventWithEventDetails(eventId: number) {
        const event = await this.oddsFeedService.fetchEventDetails(eventId);
        if (!event) {
            this.logService.logError(`Failed to get event details for event ${eventId}`);
            return undefined;
        }
        const gameId = idHelper.extractGameId(event.eventID);
        this.oddsFeedStore.setEventByGameId(gameId, event.eventID, event);

        return event as TEvent;
    }
}