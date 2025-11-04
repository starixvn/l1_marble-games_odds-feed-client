import { idHelper } from "@/utils";
import { EventCleanerService, EventNotification, OddsFeedEventName, OddsFeedEventSource } from "@/interfaces";

interface EventCleanerServiceContainer {
  oddsFeedEventSource: OddsFeedEventSource;
  eventQueueMaxLength: number;
}

export class EventCleanerServiceImpl implements EventCleanerService {
  private readonly oddsFeedEventSource: OddsFeedEventSource;
  private _eventQueueByGameId: Record<string, number[]> = {};
  private readonly maxLength: number;
  private readonly boundHandleEventStart: (notification: EventNotification) => void;

  constructor(container: EventCleanerServiceContainer) {
    this.oddsFeedEventSource = container.oddsFeedEventSource;
    this.boundHandleEventStart = this.handleEventStart.bind(this);
    this.maxLength = container.eventQueueMaxLength;
  }

  public initEvent() {
    this.oddsFeedEventSource.eventOn(OddsFeedEventName.EventStart, this.boundHandleEventStart);
  }

  public dispose() {
    this.oddsFeedEventSource.eventOff(OddsFeedEventName.EventStart, this.boundHandleEventStart);
  }

  public handleEventStart({ event }: EventNotification) {
    const gameId = idHelper.extractGameId(event.eventID);
    if (!this._eventQueueByGameId[gameId]) {
      this._eventQueueByGameId[gameId] = [];
    }
    this._eventQueueByGameId[gameId].push(event.eventID);

    if (this._eventQueueByGameId[gameId].length > this.maxLength) {
      const eventIdToRemove = this._eventQueueByGameId[gameId].shift();
      if (eventIdToRemove) {
        this.oddsFeedEventSource.emitDataCleanup(eventIdToRemove);
      }
    }
  }
}
