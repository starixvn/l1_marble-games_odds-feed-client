import { SystemNotification } from "@/interfaces";
import { Event } from "@/domain";

export interface OddFeedStore {
    initEvent(): void;
    dispose(): void;
    handleSystemDataCleanup(notification: SystemNotification): void;
    setEventByGameId(gameId: string, eventId: number, event: Event): void;
    getEventByGameId(gameId: string, eventId: number): Event | undefined;
    cleanup(eventId: number): void;
}