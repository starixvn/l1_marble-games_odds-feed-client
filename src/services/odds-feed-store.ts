import { Event } from "@/domain";
import { OddsFeedEventSource, SystemEventListener, SystemNotification } from "@/interfaces";

interface OddsFeedStoreContainer {
    oddsFeedEventSource: OddsFeedEventSource;
}

export class OddsFeedStore {
    private readonly events: Record<number, Event> = {};
    private readonly oddsFeedEventSource: OddsFeedEventSource;

    private readonly boundHandleDataCleanup: SystemEventListener

    constructor(container: OddsFeedStoreContainer) {
        this.oddsFeedEventSource = container.oddsFeedEventSource;
        this.boundHandleDataCleanup = this.handleDataCleanup.bind(this);
    }

    init() {
        this.oddsFeedEventSource.cleanupOn(this.boundHandleDataCleanup);
    }

    dispose() {
        this.oddsFeedEventSource.cleanupOff(this.boundHandleDataCleanup);
    }

    getEvent(eventID: number) {
        return this.events[eventID];
    }

    setEvent(event: Event) {
        this.events[event.eventID] = event;
    }

    removeEvent(eventID: number) {
        delete this.events[eventID];
    }

    public handleDataCleanup({ eventID }: SystemNotification) {
        this.removeEvent(eventID);
    }
}