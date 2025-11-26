import {
  OddsFeedEventSource,
  OddsFeedEventName,
  EventListener,
  EventNotification,
  EventDetailNotification,
  EventDetailListener,
} from "odds-feed-client";

interface EventConsoleLoggerContainer {
  oddsFeedEventSource: OddsFeedEventSource;
}

export class EventConsoleLogger {
  private readonly oddsFeedEventSource: OddsFeedEventSource;

  private readonly boundHandleEventUpcoming: EventListener;
  private readonly boundHandleEventDetailUpComing: EventDetailListener;
  private readonly boundHandleEventDetailStart: EventDetailListener;
  private readonly boundHandleEventDetailOddsAvailable: EventDetailListener;
  private readonly boundHandleEventDetailResultAvailable: EventDetailListener;
  private readonly boundHandleEventStart: EventListener;

  constructor(container: EventConsoleLoggerContainer) {
    this.oddsFeedEventSource = container.oddsFeedEventSource;
    this.boundHandleEventUpcoming = this.handleEventUpcoming.bind(this);
    this.boundHandleEventDetailUpComing = this.handleEventDetailUpComing.bind(this);
    this.boundHandleEventDetailStart = this.handleEventDetailStart.bind(this);
    this.boundHandleEventDetailOddsAvailable = this.handleEventDetailOddsAvailable.bind(this);
    this.boundHandleEventDetailResultAvailable = this.handleEventDetailResultAvailable.bind(this);
    this.boundHandleEventStart = this.handleEventStart.bind(this);
  }

  init() {
    this.oddsFeedEventSource.eventOn(OddsFeedEventName.EventUpcoming, this.boundHandleEventUpcoming);
    this.oddsFeedEventSource.eventOn(OddsFeedEventName.EventStart, this.boundHandleEventStart);
    this.oddsFeedEventSource.eventDetailOn(OddsFeedEventName.EventDetailUpComing, this.boundHandleEventDetailUpComing);
    this.oddsFeedEventSource.eventDetailOn(OddsFeedEventName.EventDetailStart, this.boundHandleEventDetailStart);
    this.oddsFeedEventSource.eventDetailOn(OddsFeedEventName.EventDetailOddsAvailable, this.boundHandleEventDetailOddsAvailable);
    this.oddsFeedEventSource.eventDetailOn(OddsFeedEventName.EventDetailResultsAvailable, this.boundHandleEventDetailResultAvailable);

  }

  dispose() {
    this.oddsFeedEventSource.eventOff(OddsFeedEventName.EventUpcoming, this.boundHandleEventUpcoming);
    this.oddsFeedEventSource.eventDetailOff(OddsFeedEventName.EventDetailUpComing, this.boundHandleEventDetailUpComing);
    this.oddsFeedEventSource.eventDetailOff(OddsFeedEventName.EventDetailStart, this.boundHandleEventDetailStart);
    this.oddsFeedEventSource.eventDetailOff(OddsFeedEventName.EventDetailOddsAvailable, this.boundHandleEventDetailOddsAvailable);
    this.oddsFeedEventSource.eventDetailOff(OddsFeedEventName.EventDetailResultsAvailable, this.boundHandleEventDetailResultAvailable);
    this.oddsFeedEventSource.eventOff(OddsFeedEventName.EventStart, this.boundHandleEventStart);
  }

  handleEventUpcoming({ event }: EventNotification) {
    console.log("Event Upcoming ", event.eventID, " time ", event.scheduleStartTs);
  }

  handleEventDetailUpComing({ event, index }: EventDetailNotification) {
    console.log("Event Detail Up Coming ", event.eventID, " index ", index);
  }

  handleEventStart({ event }: EventNotification) {
    console.log("Event Start", event.eventID);
    console.log("market length ", event.eventDetails[0].markets.length);
  }

  handleEventDetailStart({ event, index}: EventDetailNotification) {
    console.log("Event detail start ", event.eventID, " index ", index);
  }

  handleEventDetailOddsAvailable( { event, index}: EventDetailNotification) {
    console.log("Event odds available ", event.eventID, " index ", index);
  }

  handleEventDetailResultAvailable( { event, index}: EventDetailNotification) {
    console.log("Event result available ", event.eventID, " index ", index);
  }
}
