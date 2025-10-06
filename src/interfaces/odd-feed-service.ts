import { Event } from "@/domain";

export interface OddFeedService {
    fetchSchedule: (retries?: number, delay?: number) => Promise<Event[]>;
    fetchEventDetails: (eventId: number, validator?: (event: Event) => boolean, retries?: number, delay?: number) => Promise<Event | null>;
    getRemoteJson: <T>(url: string, annotation: { eventId?: number },retries?: number, delay?: number) => Promise<T | null>;
}