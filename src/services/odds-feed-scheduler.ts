import { Event as oddsFeedEvent } from "@/domain";
import { isNullOrUndefinedOrEmpty } from "@/utils";
import { 
    OddsFeedPullService, 
    Scheduler, 
    OddsFeedEventName, 
    OddsFeedEventSource,
    OddsFeedScheduler,
    Logger
} from "@/interfaces";

interface OddsFeedSchedulerContainer {
    oddsFeedEventSource: OddsFeedEventSource<oddsFeedEvent>;
    scheduler: Scheduler;
    oddsFeedPullService: OddsFeedPullService;
    logService: Logger;
}

export class OddsFeedSchedulerImpl implements OddsFeedScheduler {
    private readonly oddsFeedEventSource: OddsFeedEventSource<oddsFeedEvent>;
    private readonly scheduler: Scheduler;
    private readonly oddsFeedPullService: OddsFeedPullService;
    private readonly logService: Logger;

    constructor(container: OddsFeedSchedulerContainer) {
        this.oddsFeedEventSource = container.oddsFeedEventSource;
        this.scheduler = container.scheduler;
        this.oddsFeedPullService = container.oddsFeedPullService;
        this.logService = container.logService;
    }

    public scheduleEventUpcoming(event: oddsFeedEvent) {
        this.oddsFeedEventSource.emitEventUpcoming(event);
    }

    public scheduleEvent(event: oddsFeedEvent) {
        this.scheduleEventUpcoming(event);
        this.scheduleEventStart(event);
        event.eventDetails.forEach((_, index) => {
            this.scheduleEventDetailUpComing(event, index);
            this.scheduleEventDetailStart(event, index);
            this.scheduleEventDetailOddsAvailable(event, index);
            this.scheduleEventDetailResultsAvailable(event, index);
        });
    }

    protected scheduleEventStart(event: oddsFeedEvent) {
        const eventStart = new Date(event.scheduleStartTs);
        const key = this.composeKey(OddsFeedEventName.EventStart, event.eventID, 0);
        this.scheduler.schedule(
            eventStart, 
            this.handleEventStart.bind(this, event), {
            keyOverride: key,
        });
    }

    protected scheduleEventDetailUpComing(event: oddsFeedEvent, index: number) {
        this.oddsFeedEventSource.emitEventDetailUpcoming(event, index);
    }

    protected scheduleEventDetailStart(event: oddsFeedEvent, index: number) {
        const eventDetailStart = new Date(event.eventDetails[index].scheduleStartTs);
        const key = this.composeKey(OddsFeedEventName.EventDetailStart, event.eventID, index);
        this.scheduler.schedule(
            eventDetailStart,
            this.handleEventDetailStart.bind(this, event, index), {
            keyOverride: key,
        });
    }

    protected scheduleEventDetailOddsAvailable(event: oddsFeedEvent, index: number) {
        const eventDetailOddsAvailable = new Date(event.eventDetails[index].oddsAvailableTs);
        const key = this.composeKey(OddsFeedEventName.EventDetailOddsAvailable, event.eventID, index);
        this.scheduler.schedule(
            eventDetailOddsAvailable, 
            this.handleEventDetailOddsAvailable.bind(this, event, index), {
            keyOverride: key,
        });
    }

    protected scheduleEventDetailResultsAvailable(event: oddsFeedEvent, index: number) {
        const eventDetailResultsAvailable = new Date(event.eventDetails[index].resultsAvailableTs);
        const key = this.composeKey(OddsFeedEventName.EventDetailResultsAvailable, event.eventID, index);
        this.scheduler.schedule(
            eventDetailResultsAvailable, 
            this.handleEventDetailResultsAvailable.bind(this, event, index), {
            keyOverride: key,
        });
    }

    protected async handleEventStart(event: oddsFeedEvent) {
        const updatedEvent = await this.pullEventAndUpdateStore(event);
        if (!updatedEvent) {
            return;
        }
        this.oddsFeedEventSource.emitEventStart(updatedEvent);
    }

    protected async handleEventDetailStart(event: oddsFeedEvent, index: number) {
        const updatedEvent = await this.pullEventAndUpdateStore(event);
        if (!updatedEvent) {
            return;
        }
        this.oddsFeedEventSource.emitEventDetailStart(updatedEvent, index);
    }

    protected async handleEventDetailOddsAvailable(event: oddsFeedEvent, index: number) {
        const updatedEvent = await this.pullEventAndUpdateStore(event);
        if (!updatedEvent) {
            return;
        }
        this.oddsFeedEventSource.emitEventDetailOddsAvailable(updatedEvent, index);
    }
    
    protected async handleEventDetailResultsAvailable(event: oddsFeedEvent, index: number, retry = 3) {
        const updatedEvent = await this.pullEventAndUpdateStore(event);
        if (retry < 0) {
            console.error(`Failed to get event details for event ${event.eventID} and index ${index} after ${retry} retries`);
            return;
        }

        if (!updatedEvent) {
            await this.handleEventDetailResultsAvailable(event, index, retry - 1);
            return;
        }

        if (isNullOrUndefinedOrEmpty(updatedEvent.eventDetails[index].result)) {
            await this.handleEventDetailResultsAvailable(event, index, retry - 1);
            return;
        }

        this.oddsFeedEventSource.emitEventDetailResultsAvailable(updatedEvent, index);
    }

    protected async pullEventAndUpdateStore(event: oddsFeedEvent) {
        const updatedEvent = await this.oddsFeedPullService.pullEventWithEventDetails(event.eventID);
            if (!updatedEvent) {
                this.logService.logError(`Failed to get event details for event ${event.eventID}`);
                return undefined;
            }
        return updatedEvent;
    }
    
    private composeKey(eventName: OddsFeedEventName, eventId: number, index: number) {
        return `${eventName}-${eventId}-${index}`;
    }
}