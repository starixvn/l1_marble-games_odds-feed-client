import { idHelper } from "@/utils";
import { 
    EventCleanerService, 
    EventNotification, 
    OddFeedEventName, 
    OddFeedEventSource, 
} from "@/interfaces";

const MAX_LENGTH = 50;

interface EventCleanerServiceContainer {
    oddFeedEventSource: OddFeedEventSource;
}

export class EventCleanerServiceImpl implements EventCleanerService {
    private readonly oddFeedEventSource: OddFeedEventSource;
    private _eventQueueByGameId: Record<string, number[]> = {};
    private readonly maxLength = MAX_LENGTH;
    private readonly boundHandleEventStart: (notification: EventNotification) => void;

    constructor(container: EventCleanerServiceContainer) {
        this.oddFeedEventSource = container.oddFeedEventSource;
        this.boundHandleEventStart = this.handleEventStart.bind(this);
    }

    public initEvent() {
        this.oddFeedEventSource.registerEventListener(
            OddFeedEventName.EventStart,
            this.boundHandleEventStart
        );
    }

    public dispose() {
        this.oddFeedEventSource.unregisterEventListener(
            OddFeedEventName.EventStart,
            this.boundHandleEventStart
        );
    }

    public handleEventStart({ event }: EventNotification) {
        const gameId = idHelper.extractGameId(event.eventID);
        if (!this._eventQueueByGameId[gameId]) {
            this._eventQueueByGameId[gameId] = [];
        }
        this._eventQueueByGameId[gameId].push(event.eventID);

        if (this._eventQueueByGameId[gameId].length > this.maxLength) {
            const eventIdToRemove = this._eventQueueByGameId[gameId].shift();
            if (eventIdToRemove) {
                this.oddFeedEventSource.onDataCleanup(eventIdToRemove);
            }
        }
    }
}