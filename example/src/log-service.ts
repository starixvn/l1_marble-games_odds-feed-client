import { OddFeedEventSource, OddFeedEventName, EventListener, EventNotification, EventDetailNotification, EventDetailListener } from "odd-feed-client";

interface LogServiceContainer {
    oddFeedEventSource: OddFeedEventSource;
}

export class LogService {
    private readonly oddFeedEventSource: OddFeedEventSource;

    private readonly boundHandleEventUpcoming: EventListener;
    private readonly boundHandleEventDetailUpComing: EventDetailListener;
    
    constructor(
        container: LogServiceContainer,
    ) {
        this.oddFeedEventSource = container.oddFeedEventSource;
        this.boundHandleEventUpcoming = this.handleEventUpcoming.bind(this);
        this.boundHandleEventDetailUpComing = this.handleEventDetailUpComing.bind(this);
    }

    init() {
        this.oddFeedEventSource.registerEventListener(
            OddFeedEventName.EventUpcoming,
            this.boundHandleEventUpcoming
        )
        this.oddFeedEventSource.registerEventDetailEventListener(
            OddFeedEventName.EventDetailUpComing,
            this.boundHandleEventDetailUpComing
        )
    }

    dispose() {
        this.oddFeedEventSource.unregisterEventListener(
            OddFeedEventName.EventUpcoming,
            this.boundHandleEventUpcoming
        )
        this.oddFeedEventSource.unregisterEventDetailEventListener(
            OddFeedEventName.EventDetailUpComing,
            this.boundHandleEventDetailUpComing
        )
    }

    handleEventUpcoming({ event }: EventNotification ) {
        console.log(new Date().toISOString());
        console.log("Event Upcoming", event.scheduleStartTs);
    }

    handleEventDetailUpComing({ event, index }: EventDetailNotification) {
        console.log(new Date().toISOString());
        console.log("Event Detail Up Coming", event.scheduleStartTs, index);
    }
}