import { oddsFeedEventSource, oddsFeedEventName, EventListener, EventNotification, EventDetailNotification, EventDetailListener } from "odds-feed-client";

interface LogServiceContainer {
    oddsFeedEventSource: oddsFeedEventSource;
}

export class LogService {
    private readonly oddsFeedEventSource: oddsFeedEventSource;

    private readonly boundHandleEventUpcoming: EventListener;
    private readonly boundHandleEventDetailUpComing: EventDetailListener;
    
    constructor(
        container: LogServiceContainer,
    ) {
        this.oddsFeedEventSource = container.oddsFeedEventSource;
        this.boundHandleEventUpcoming = this.handleEventUpcoming.bind(this);
        this.boundHandleEventDetailUpComing = this.handleEventDetailUpComing.bind(this);
    }

    init() {
        this.oddsFeedEventSource.registerEventListener(
            oddsFeedEventName.EventUpcoming,
            this.boundHandleEventUpcoming
        )
        this.oddsFeedEventSource.registerEventDetailEventListener(
            oddsFeedEventName.EventDetailUpComing,
            this.boundHandleEventDetailUpComing
        )
    }

    dispose() {
        this.oddsFeedEventSource.unregisterEventListener(
            oddsFeedEventName.EventUpcoming,
            this.boundHandleEventUpcoming
        )
        this.oddsFeedEventSource.unregisterEventDetailEventListener(
            oddsFeedEventName.EventDetailUpComing,
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