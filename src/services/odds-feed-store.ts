import { idHelper } from "@/utils";
import { 
    OddsFeedEventSource, 
    SystemNotification, 
    OddsFeedStore,
} from "@/interfaces";
import { Event } from "@/domain";

interface OddsFeedStoreContainer {
    oddsFeedEventSource: OddsFeedEventSource;
}

export class OddsFeedStoreImpl implements OddsFeedStore {
    // [gameId][eventId]
    private readonly eventByGameId: Record<string, Record<number, Event>> = {};
    private readonly oddsFeedEventSource: OddsFeedEventSource;
    private readonly boundHandleSystemDataCleanup: (notification: SystemNotification) => void;
    constructor(container: OddsFeedStoreContainer) {
        this.oddsFeedEventSource = container.oddsFeedEventSource;
        this.boundHandleSystemDataCleanup = this.handleSystemDataCleanup.bind(this);
        this.oddsFeedEventSource.cleanupOn(this.boundHandleSystemDataCleanup);
    }

    public initEvent() {
        this.oddsFeedEventSource.cleanupOn(this.boundHandleSystemDataCleanup);
    }

    public dispose() {
        this.oddsFeedEventSource.cleanupOff(this.boundHandleSystemDataCleanup);
    }

    public handleSystemDataCleanup({ eventID }: SystemNotification) {
        this.cleanup(eventID);
    }

    public setEventByGameId(gameId: string, eventId: number, event: Event): void {
        if (!this.eventByGameId[gameId]) {
            this.eventByGameId[gameId] = {};
        }

        this.eventByGameId[gameId][eventId] = event;
    }

    public getEventByGameId(gameId: string, eventId: number): Event | undefined {
        if (!this.eventByGameId[gameId]) {
            return undefined;
        }

        return this.eventByGameId[gameId][eventId];
    }

    public cleanup(eventId: number): void {
        
        const gameId = idHelper.extractGameId(eventId);

        console.log(`Cleaning up event ${eventId} for game ${gameId}`);
        if (!this.eventByGameId[gameId]) {
            return;
        }

        delete this.eventByGameId[gameId][eventId];
    }
}