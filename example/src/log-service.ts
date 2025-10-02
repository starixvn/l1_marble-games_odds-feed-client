import { OddFeedEventSource, OddFeedEventName, EventListener, EventNotification } from "odd-feed-client";

interface LogServiceContainer {
    oddFeedEventSource: OddFeedEventSource;
}

export class LogService {
    private readonly oddFeedEventSource: OddFeedEventSource;

    private readonly boundHandleEventUpcoming: EventListener;

    constructor(
        container: LogServiceContainer,
    ) {
        this.oddFeedEventSource = container.oddFeedEventSource;
        this.boundHandleEventUpcoming = this.handleEventUpcoming.bind(this);
    }

    init() {
        this.oddFeedEventSource.registerEventListener(
            OddFeedEventName.EventUpcoming,
            this.boundHandleEventUpcoming
        )
    }

    dispose() {
        this.oddFeedEventSource.unregisterEventListener(
            OddFeedEventName.EventUpcoming,
            this.boundHandleEventUpcoming
        )
    }

    handleEventUpcoming({ event }: EventNotification ) {
        console.log(new Date().toISOString());
        console.log("Event Upcoming", event.scheduleStartTs);
    }
}