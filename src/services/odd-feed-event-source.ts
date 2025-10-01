import EventEmitter from "node:events";
import { Event } from "@/domain";
import { 
    EventListener,
    Notification, 
    CatchAllEventListener, 
    OddFeedEventName, 
    EventDetailListener, 
    SystemEventListener, 
    SystemEventName, 
    OddFeedEventSource } from "@/interfaces";

export class OddFeedEventSourceImpl<TEvent extends Event = Event> implements OddFeedEventSource<TEvent> {

    public OddFeedEventSource: EventEmitter;

    constructor() {
        this.OddFeedEventSource = new EventEmitter();
    }
    public registerWildcardEventListener(listener: CatchAllEventListener<TEvent>) {
        this.OddFeedEventSource.on(OddFeedEventName.Wildcard, listener);
    }
    public unregisterWildcardEventListener(listener: CatchAllEventListener<TEvent>) {
        this.OddFeedEventSource.off(OddFeedEventName.Wildcard, listener);
    }

    public registerEventListener(eventName: OddFeedEventName, listener: EventListener<TEvent>) {
        this.OddFeedEventSource.on(eventName, listener);
    }

    public unregisterEventListener(eventName: OddFeedEventName, listener: EventListener<TEvent>) {
        this.OddFeedEventSource.off(eventName, listener);
    }

    public registerEventDetailEventListener(eventName: OddFeedEventName, listener: EventDetailListener<TEvent>) {
        this.OddFeedEventSource.on(eventName, listener);
    }
    
    public unregisterEventDetailEventListener(eventName: OddFeedEventName, listener: EventDetailListener<TEvent>) {
        this.OddFeedEventSource.off(eventName, listener);
    }

    public registerSystemDataCleanupEventListener(listener: SystemEventListener) {
        this.OddFeedEventSource.on(SystemEventName.DataCleanup, listener);
    }

    public unregisterSystemDataCleanupEventListener(listener: SystemEventListener) {
        this.OddFeedEventSource.off(SystemEventName.DataCleanup, listener);
    }

    public onEventStart(event: TEvent) {
        const key = OddFeedEventName.EventStart;
        this.emit(key, { event });
    }

    public onDataCleanup(eventID: number) {
        const key = SystemEventName.DataCleanup;
        this.emit(key, { eventID });
    }

    public onEventUpcoming(event: TEvent) {
        const key = OddFeedEventName.EventUpcoming;
        this.emit(key, { event });
    }

    public onEventDetailStart(event: TEvent, index: number) {
        const key = OddFeedEventName.EventDetailStart;
        this.emit(key, { event, index });
    }

    public onEventDetailOddsAvailable(event: TEvent, index: number) {
        const key = OddFeedEventName.EventDetailOddsAvailable;
        this.emit(key, { event, index });
    }

    public onEventDetailResultsAvailable(event: TEvent, index: number) {
        const key = OddFeedEventName.EventDetailResultsAvailable;
        this.emit(key, { event, index });
    }

    private emit(eventName: OddFeedEventName | SystemEventName, notification: Notification<TEvent>) {
        this.OddFeedEventSource.emit(OddFeedEventName.Wildcard, eventName, notification);
        this.OddFeedEventSource.emit(eventName, notification);
    }
}