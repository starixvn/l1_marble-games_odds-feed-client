import { idHelper } from "@/utils";
import { 
    OddFeedEventSource, 
    SystemNotification, 
    OddFeedStore,
} from "@/interfaces";
import { Event } from "@/domain";

interface OddFeedStoreContainer {
    oddFeedEventSource: OddFeedEventSource;
}

export class OddFeedStoreImpl implements OddFeedStore {
    // [gameId][eventId]
    private readonly eventByGameId: Record<string, Record<number, Event>> = {};
    private readonly oddFeedEventSource: OddFeedEventSource;
    private readonly boundHandleSystemDataCleanup: (notification: SystemNotification) => void;
    constructor(container: OddFeedStoreContainer) {
        this.oddFeedEventSource = container.oddFeedEventSource;
        this.boundHandleSystemDataCleanup = this.handleSystemDataCleanup.bind(this);
        this.oddFeedEventSource.registerSystemDataCleanupEventListener(this.boundHandleSystemDataCleanup);
    }

    public initEvent() {
        this.oddFeedEventSource.registerSystemDataCleanupEventListener(this.boundHandleSystemDataCleanup);
    }

    public dispose() {
        this.oddFeedEventSource.unregisterSystemDataCleanupEventListener(this.boundHandleSystemDataCleanup);
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