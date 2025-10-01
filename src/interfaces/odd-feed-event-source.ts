import { Event } from "@/domain";

export enum OddFeedEventName {
    Wildcard = "*",
    EventStart = "event.ScheduleStart",
    EventDetailStart = "eventDetail.ScheduleStart",
    EventDetailOddsAvailable = "eventDetail.OddsAvailable",
    EventDetailResultsAvailable = "eventDetail.ResultsAvailable",
    EventUpcoming = "event.Upcoming",
}

export enum SystemEventName {
    DataCleanup = "system.DataCleanup",
}

export interface EventDetailNotification<TEvent extends Event = Event> {
    event: TEvent;
    index: number;
}

export interface EventNotification<TEvent extends Event = Event> {
    event: TEvent
}

export interface SystemNotification {
    eventID: number;
}

export type Notification<TEvent extends Event = Event> = EventNotification<TEvent> | EventDetailNotification<TEvent> | SystemNotification;

export type CatchAllEventListener<TEvent extends Event = Event> = (eventName: OddFeedEventName, notification: Notification<TEvent>) => void;

export type EventDetailListener<TEvent extends Event = Event> = (notification: EventDetailNotification<TEvent>) => void;

export type EventListener<TEvent extends Event = Event> = (notification: EventNotification<TEvent> | EventDetailNotification<TEvent>) => void;

export type SystemEventListener = (notification: SystemNotification) => void;

export type OddFeedEventSource<TEvent extends Event = Event> = {
    registerWildcardEventListener: (listener: CatchAllEventListener<TEvent>) => void;
    unregisterWildcardEventListener: (listener: CatchAllEventListener<TEvent>) => void;
    registerEventListener: (eventName: OddFeedEventName, listener: EventListener<TEvent>) => void;
    unregisterEventListener: (eventName: OddFeedEventName, listener: EventListener<TEvent>) => void;
    registerEventDetailEventListener: (eventName: OddFeedEventName, listener: EventDetailListener<TEvent>) => void;
    unregisterEventDetailEventListener: (eventName: OddFeedEventName, listener: EventDetailListener<TEvent>) => void;
    registerSystemDataCleanupEventListener: (listener: SystemEventListener) => void;
    unregisterSystemDataCleanupEventListener: (listener: SystemEventListener) => void;
    onEventStart: (event: TEvent) => void;
    onDataCleanup: (eventID: number) => void;
    onEventUpcoming: (event: TEvent) => void;
    onEventDetailStart: (event: TEvent, index: number) => void;
    onEventDetailOddsAvailable: (event: TEvent, index: number) => void;
    onEventDetailResultsAvailable: (event: TEvent, index: number) => void;
}