import { idHelper } from "@/utils";
import { 
    Logger, 
    OddFeedService, 
    OddFeedStore,
    OddFeedPullService,
} from "@/interfaces";
import { Event } from "@/domain";

interface OddFeedPullServiceContainer<TEvent extends Event = Event> {
    oddFeedService: OddFeedService;
    logService: Logger;
    oddFeedStore: OddFeedStore;
    oddFeedFilter: (event: TEvent) => boolean;
}

export class OddFeedPullServiceImpl<TEvent extends Event = Event> implements OddFeedPullService<TEvent> {
    private readonly oddFeedService: OddFeedService;
    private readonly oddFeedStore: OddFeedStore;
    private readonly logService: Logger;
    private readonly oddFeedFilter: (event: TEvent) => boolean;

    constructor(container: OddFeedPullServiceContainer) {
        this.oddFeedService = container.oddFeedService;
        this.oddFeedStore = container.oddFeedStore;
        this.logService = container.logService;
        this.oddFeedFilter = container.oddFeedFilter;
    }

    async pullUpcoming() {
        const upcomingEvents = await this.oddFeedService.fetchSchedule();
        (upcomingEvents as TEvent[]).filter(this.oddFeedFilter).forEach((event) => {
            const gameId = idHelper.extractGameId(event.eventID);
            this.oddFeedStore.setEventByGameId(gameId, event.eventID, event);
        });

        return upcomingEvents as TEvent[];
    }

    async pullEventWithEventDetails(eventId: number) {
        const event = await this.oddFeedService.fetchEventDetails(eventId);
        if (!event) {
            this.logService.logError(`Failed to get event details for event ${eventId}`);
            return undefined;
        }
        const gameId = idHelper.extractGameId(event.eventID);
        this.oddFeedStore.setEventByGameId(gameId, event.eventID, event);

        return event as TEvent;
    }
}