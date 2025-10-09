import EventEmitter from "node:events";
import { Event } from "@/domain";
import { 
    EventListener,
    Notification, 
    CatchAllEventListener, 
    OddsFeedEventName, 
    EventDetailListener, 
    SystemEventListener, 
    SystemEventName, 
    OddsFeedEventSource } from "@/interfaces";

export class OddsFeedEventSourceImpl<TEvent extends Event = Event> implements OddsFeedEventSource<TEvent> {

    public oddsFeedEventSource: EventEmitter;

    constructor() {
        this.oddsFeedEventSource = new EventEmitter();
    }
    public on(listener: CatchAllEventListener<TEvent>) {
        this.oddsFeedEventSource.on(OddsFeedEventName.Wildcard, listener);
    }
    public off(listener: CatchAllEventListener<TEvent>) {
        this.oddsFeedEventSource.off(OddsFeedEventName.Wildcard, listener);
    }

    public eventOn(eventName: OddsFeedEventName, listener: EventListener<TEvent>) {
        this.oddsFeedEventSource.on(eventName, listener);
    }

    public eventOff(eventName: OddsFeedEventName, listener: EventListener<TEvent>) {
        this.oddsFeedEventSource.off(eventName, listener);
    }

    public eventDetailOn(eventName: OddsFeedEventName, listener: EventDetailListener<TEvent>) {
        this.oddsFeedEventSource.on(eventName, listener);
    }
    
    public eventDetailOff(eventName: OddsFeedEventName, listener: EventDetailListener<TEvent>) {
        this.oddsFeedEventSource.off(eventName, listener);
    }

    public cleanupOn(listener: SystemEventListener) {
        this.oddsFeedEventSource.on(SystemEventName.DataCleanup, listener);
    }

    public cleanupOff(listener: SystemEventListener) {
        this.oddsFeedEventSource.off(SystemEventName.DataCleanup, listener);
    }

    public emitEventStart(event: TEvent) {
        const key = OddsFeedEventName.EventStart;
        this.emit(key, { event });
    }

    public emitDataCleanup(eventID: number) {
        const key = SystemEventName.DataCleanup;
        this.emit(key, { eventID });
    }

    public emitEventUpcoming(event: TEvent) {
        const key = OddsFeedEventName.EventUpcoming;
        this.emit(key, { event });
    }

    public emitEventDetailUpcoming(event: TEvent, index: number) {
        const key = OddsFeedEventName.EventDetailUpComing;
        this.emit(key, { event, index });
    }

    public emitEventDetailStart(event: TEvent, index: number) {
        const key = OddsFeedEventName.EventDetailStart;
        this.emit(key, { event, index });
    }

    public emitEventDetailOddsAvailable(event: TEvent, index: number) {
        const key = OddsFeedEventName.EventDetailOddsAvailable;
        this.emit(key, { event, index });
    }

    public emitEventDetailResultsAvailable(event: TEvent, index: number) {
        const key = OddsFeedEventName.EventDetailResultsAvailable;
        this.emit(key, { event, index });
    }

    private emit(eventName: OddsFeedEventName | SystemEventName, notification: Notification<TEvent>) {
        this.oddsFeedEventSource.emit(OddsFeedEventName.Wildcard, eventName, notification);
        this.oddsFeedEventSource.emit(eventName, notification);
    }
}