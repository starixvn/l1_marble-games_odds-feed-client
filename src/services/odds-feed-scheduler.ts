import { Event as oddsFeedEvent } from "@/domain";
import {
  OddsFeedPullService,
  Scheduler,
  OddsFeedEventName,
  OddsFeedEventSource,
  OddsFeedScheduler,
  Logger,
  PullContext,
} from "@/interfaces";
import { eventScheduleStartValidator, oddsValidator, resultValidator } from "../utils/validators";
import { OddsFeedStore } from "./odds-feed-store";

interface OddsFeedSchedulerContainer {
  oddsFeedEventSource: OddsFeedEventSource<oddsFeedEvent>;
  scheduler: Scheduler;
  oddsFeedPullService: OddsFeedPullService;
  logService: Logger;
  shouldValidateOdds: boolean;
  shouldValidateEventScheduleStart: boolean;
  oddsFeedStore: OddsFeedStore;
}

export class OddsFeedSchedulerImpl implements OddsFeedScheduler {
  private readonly oddsFeedEventSource: OddsFeedEventSource<oddsFeedEvent>;
  private readonly scheduler: Scheduler;
  private readonly oddsFeedPullService: OddsFeedPullService;
  private readonly logService: Logger;
  private readonly shouldValidateOdds: boolean = false;
  private readonly shouldValidateEventScheduleStart: boolean = false;
  private readonly oddsFeedStore: OddsFeedStore;

  constructor(container: OddsFeedSchedulerContainer) {
    this.oddsFeedEventSource = container.oddsFeedEventSource;
    this.scheduler = container.scheduler;
    this.oddsFeedPullService = container.oddsFeedPullService;
    this.logService = container.logService;
    this.shouldValidateOdds = container.shouldValidateOdds;
    this.shouldValidateEventScheduleStart = container.shouldValidateEventScheduleStart;
    this.oddsFeedStore = container.oddsFeedStore;
  }

  public scheduleEventUpcoming(event: oddsFeedEvent) {
    this.oddsFeedEventSource.emitEventUpcoming(event);
  }

  public scheduleEvent(event: oddsFeedEvent) {
    this.scheduleEventUpcoming(event);
    this.scheduleEventStart(event);
    for (let index = 0; index < event.eventDetails.length; index++) {
      this.scheduleEventDetailUpComing(event, index);
      this.scheduleEventDetailStart(event, index);
      this.scheduleEventDetailOddsAvailable(event, index);
      this.scheduleEventDetailResultsAvailable(event, index);
    }
  }

  protected scheduleEventStart(event: oddsFeedEvent) {
    const eventStart = new Date(event.scheduleStartTs);
    const key = this.composeKey(OddsFeedEventName.EventStart, event.eventID, 0);
    this.scheduler.schedule(eventStart, this.emitEventStart.bind(this, event), {
      keyOverride: key,
      overrideNow: event.now
    });
  }

  protected scheduleEventDetailUpComing(event: oddsFeedEvent, index: number) {
    this.oddsFeedEventSource.emitEventDetailUpcoming(event, index);
  }

  protected scheduleEventDetailStart(event: oddsFeedEvent, index: number) {
    const eventDetailStart = new Date(event.eventDetails[index].scheduleStartTs);
    const key = this.composeKey(OddsFeedEventName.EventDetailStart, event.eventID, index);
    this.scheduler.schedule(eventDetailStart, this.emitEventDetailStart.bind(this, event, index), {
      keyOverride: key,
      overrideNow: event.now
    });
  }

  protected scheduleEventDetailOddsAvailable(event: oddsFeedEvent, index: number) {
    const eventDetailOddsAvailable = new Date(event.eventDetails[index].oddsAvailableTs);
    const key = this.composeKey(OddsFeedEventName.EventDetailOddsAvailable, event.eventID, index);
    this.scheduler.schedule(eventDetailOddsAvailable, this.emitEventDetailOddsAvailable.bind(this, event, index), {
      keyOverride: key,
      overrideNow: event.now
    });
  }

  protected scheduleEventDetailResultsAvailable(event: oddsFeedEvent, index: number) {
    const eventDetailResultsAvailable = new Date(event.eventDetails[index].resultsAvailableTs);
    const key = this.composeKey(OddsFeedEventName.EventDetailResultsAvailable, event.eventID, index);
    this.scheduler.schedule(
      eventDetailResultsAvailable,
      this.emitEventDetailResultsAvailable.bind(this, event, index),
      {
        keyOverride: key,
        overrideNow: event.now
      }
    );
  }

  protected emitEventStart(event: oddsFeedEvent) {
    const updatedEvent = this.oddsFeedStore.getEvent(event.eventID);  
    if (!updatedEvent) {
      return;
    }
    this.oddsFeedEventSource.emitEventStart(event);
  }

  protected async emitEventDetailStart(event: oddsFeedEvent, index: number) {
    const validator = eventScheduleStartValidator({ index, shouldValidate: this.shouldValidateEventScheduleStart });
    
    const updatedEvent = await this.pullEventAndUpdateStore(event, { validator });
    if (!updatedEvent) {
      return;
    }

    this.oddsFeedEventSource.emitEventDetailStart(updatedEvent, index);
  }

  protected async emitEventDetailOddsAvailable(event: oddsFeedEvent, index: number) {
    const validator = oddsValidator({ index, shouldValidate: this.shouldValidateOdds });
    const updatedEvent = await this.pullEventAndUpdateStore(event, { validator });
    if (!updatedEvent) {
      return;
    }
    this.oddsFeedEventSource.emitEventDetailOddsAvailable(updatedEvent, index);
  }

  protected async emitEventDetailResultsAvailable(event: oddsFeedEvent, index: number) {
    const validator = resultValidator({ index });
    const updatedEvent = await this.pullEventAndUpdateStore(event, { validator });

    if (!updatedEvent) {
      return;
    }

    this.oddsFeedEventSource.emitEventDetailResultsAvailable(updatedEvent, index);
  }

  protected async pullEventAndUpdateStore(event: oddsFeedEvent, context?: PullContext) {
    const updatedEvent = await this.oddsFeedPullService.pullEventWithEventDetails(event.eventID, context);
    if (!updatedEvent) {
      this.logService.logError(`Failed to get event details for event ${event.eventID}`);
      return undefined;
    }
    return updatedEvent;
  }

  private composeKey(eventName: OddsFeedEventName, eventId: number, index: number) {
    return `${eventName}-${eventId}-${index}`;
  }
}
