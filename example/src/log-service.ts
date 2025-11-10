import {
  OddsFeedEventSource,
  OddsFeedEventName,
  EventListener,
  EventNotification,
  EventDetailNotification,
  EventDetailListener,
} from "odds-feed-client";

interface LogServiceContainer {
  oddsFeedEventSource: OddsFeedEventSource;
}

export class LogService {
  private readonly oddsFeedEventSource: OddsFeedEventSource;

  private readonly boundHandleEventUpcoming: EventListener;
  private readonly boundHandleEventDetailUpComing: EventDetailListener;

  constructor(container: LogServiceContainer) {
    this.oddsFeedEventSource = container.oddsFeedEventSource;
    this.boundHandleEventUpcoming = this.handleEventUpcoming.bind(this);
    this.boundHandleEventDetailUpComing = this.handleEventDetailUpComing.bind(this);
  }

  init() {
    this.oddsFeedEventSource.eventOn(OddsFeedEventName.EventUpcoming, this.boundHandleEventUpcoming);
    this.oddsFeedEventSource.eventDetailOn(OddsFeedEventName.EventDetailUpComing, this.boundHandleEventDetailUpComing);
  }

  dispose() {
    this.oddsFeedEventSource.eventOff(OddsFeedEventName.EventUpcoming, this.boundHandleEventUpcoming);
    this.oddsFeedEventSource.eventDetailOff(OddsFeedEventName.EventDetailUpComing, this.boundHandleEventDetailUpComing);
  }

  handleEventUpcoming({ event }: EventNotification) {
    console.log(new Date().toISOString());
    console.log("Event Upcoming", event.scheduleStartTs);
  }

  handleEventDetailUpComing({ event, index }: EventDetailNotification) {
    console.log(new Date().toISOString());
    console.log("Event Detail Up Coming", event.scheduleStartTs, index);
  }
}
