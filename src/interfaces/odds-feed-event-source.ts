import { Event } from "@/domain";

export enum OddsFeedEventName {
  Wildcard = "*",
  EventStart = "event.ScheduleStart",
  EventDetailUpComing = "eventDetail.UpComing",
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
  event: TEvent;
}

export interface SystemNotification {
  eventID: number;
}

export type Notification<TEvent extends Event = Event> =
  | EventNotification<TEvent>
  | EventDetailNotification<TEvent>
  | SystemNotification;

export type CatchAllEventListener<TEvent extends Event = Event> = (
  eventName: OddsFeedEventName,
  notification: Notification<TEvent>
) => void;

export type EventDetailListener<TEvent extends Event = Event> = (notification: EventDetailNotification<TEvent>) => void;

export type EventListener<TEvent extends Event = Event> = (
  notification: EventNotification<TEvent> | EventDetailNotification<TEvent>
) => void;

export type SystemEventListener = (notification: SystemNotification) => void;

export type OddsFeedEventSource<TEvent extends Event = Event> = {
  on: (listener: CatchAllEventListener<TEvent>) => void;
  off: (listener: CatchAllEventListener<TEvent>) => void;
  eventOn: (eventName: OddsFeedEventName, listener: EventListener<TEvent>) => void;
  eventOff: (eventName: OddsFeedEventName, listener: EventListener<TEvent>) => void;
  eventDetailOn: (eventName: OddsFeedEventName, listener: EventDetailListener<TEvent>) => void;
  eventDetailOff: (eventName: OddsFeedEventName, listener: EventDetailListener<TEvent>) => void;
  cleanupOn: (listener: SystemEventListener) => void;
  cleanupOff: (listener: SystemEventListener) => void;
  emitEventStart: (event: TEvent) => void;
  emitDataCleanup: (eventID: number) => void;
  emitEventUpcoming: (event: TEvent) => void;
  emitEventDetailUpcoming: (event: TEvent, index: number) => void;
  emitEventDetailStart: (event: TEvent, index: number) => void;
  emitEventDetailOddsAvailable: (event: TEvent, index: number) => void;
  emitEventDetailResultsAvailable: (event: TEvent, index: number) => void;
};
