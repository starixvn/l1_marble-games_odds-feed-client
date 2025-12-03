import { OddsFeedSchedulerImpl as oddsFeedSchedulerImpl } from "@/services";
import { OddsFeedEventName as oddsFeedEventName } from "@/interfaces";

describe("oddsFeedScheduler", () => {
  const makeEvent = () => {
    const baseTime = new Date().toISOString();
    return {
      eventID: 1000,
      eventNameAKey: "A",
      eventNameBKey: "B",
      scheduleStartTs: baseTime,
      productCode: "p",
      productTypeKey: "t",
      eventDetails: [
        {
          eventID: 1000,
          scheduleStartTs: baseTime,
          oddsAvailableTs: baseTime,
          resultsAvailableTs: baseTime,
          hasResults: false,
          goalInfo: "",
          playlist: "",
          result: "",
          markets: {},
          inGameEventInfo: "",
          phase: 0,
        },
        {
          eventID: 1000,
          scheduleStartTs: baseTime,
          oddsAvailableTs: baseTime,
          resultsAvailableTs: baseTime,
          hasResults: false,
          goalInfo: "",
          playlist: "",
          result: "",
          markets: {},
          inGameEventInfo: "",
          phase: 1,
        },
      ],
    } as any;
  };

  describe("scheduleEventUpcoming", () => {
    it("emits upcoming event", () => {
      // Arrange
      const oddsFeedEventSource = { emitEventUpcoming: jest.fn() } as any;
      const scheduler = { schedule: jest.fn() } as any;
      const oddsFeedPullService = { pullEventWithEventDetails: jest.fn() } as any;
      const logService = { logError: jest.fn() } as any;
      const oddsFeedStore = { getEvent: jest.fn() } as any;
      const svc = new oddsFeedSchedulerImpl({ oddsFeedEventSource, scheduler, oddsFeedPullService, logService, shouldValidateOdds: true, shouldValidateEventScheduleStart: false, oddsFeedStore });
      const event = makeEvent();

      // Act
      svc.scheduleEventUpcoming(event);

      // Assert
      expect(oddsFeedEventSource.emitEventUpcoming).toHaveBeenCalledWith(event);
    });
  });

  describe("scheduleEvent", () => {
    it("schedules start and detail events with correct keys", () => {
      // Arrange
      const oddsFeedEventSource = { emitEventUpcoming: jest.fn(), emitEventDetailUpcoming: jest.fn() } as any;
      const schedulerMock = { schedule: jest.fn() } as any;
      const oddsFeedPullService = { pullEventWithEventDetails: jest.fn() } as any;
      const logService = { logError: jest.fn() } as any;
      const oddsFeedStore = { getEvent: jest.fn() } as any;
      const svc = new oddsFeedSchedulerImpl({
        oddsFeedEventSource,
        scheduler: schedulerMock,
        oddsFeedPullService,
        logService,
        shouldValidateOdds: true,
        shouldValidateEventScheduleStart: false,
        oddsFeedStore,
      });
      const event = makeEvent();

      // Act
      svc.scheduleEvent(event);

      // Assert
      const keys = schedulerMock.schedule.mock.calls.map(([, , opts]: any) => opts.keyOverride);
      expect(keys).toContain(`${oddsFeedEventName.EventStart}-${event.eventID}-0`);
      expect(keys).toContain(`${oddsFeedEventName.EventDetailStart}-${event.eventID}-0`);
      expect(keys).toContain(`${oddsFeedEventName.EventDetailOddsAvailable}-${event.eventID}-0`);
      expect(keys).toContain(`${oddsFeedEventName.EventDetailResultsAvailable}-${event.eventID}-0`);

      // upcoming events are emitted immediately, not scheduled
      expect(oddsFeedEventSource.emitEventUpcoming).toHaveBeenCalledWith(event);
      expect(oddsFeedEventSource.emitEventDetailUpcoming).toHaveBeenCalledWith(event, 0);
      expect(oddsFeedEventSource.emitEventDetailUpcoming).toHaveBeenCalledWith(event, 1);
    });

    it("invokes scheduled start handler to emit when event is pulled successfully", async () => {
      // Arrange
      const oddsFeedEventSource = {
        emitEventStart: jest.fn(),
        emitEventUpcoming: jest.fn(),
        emitEventDetailUpcoming: jest.fn(),
      } as any;
      const schedulerMock = { schedule: jest.fn() } as any;
      const logService = { logError: jest.fn() } as any;
      const event = makeEvent();
      const updatedEvent = { ...event };
      const oddsFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(updatedEvent) } as any;
      const oddsFeedStore = { getEvent: jest.fn() } as any;
      const svc = new oddsFeedSchedulerImpl({
        oddsFeedEventSource,
        scheduler: schedulerMock,
        oddsFeedPullService,
        logService,
        shouldValidateOdds: true,
        shouldValidateEventScheduleStart: false,
        oddsFeedStore,
      });

      // Act
      svc.scheduleEvent(event);
      const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) =>
        opts.keyOverride.startsWith(`${oddsFeedEventName.EventStart}`)
      );
      await call[1]();

      // Assert
      expect(oddsFeedEventSource.emitEventStart).toHaveBeenCalledWith(updatedEvent);
      expect(oddsFeedPullService.pullEventWithEventDetails).toHaveBeenCalledWith(event.eventID, undefined);
    });

    it("invokes scheduled detail start handler to emit when details available", async () => {
      // Arrange
      const oddsFeedEventSource = {
        emitEventDetailStart: jest.fn(),
        emitEventUpcoming: jest.fn(),
        emitEventDetailUpcoming: jest.fn(),
      } as any;
      const schedulerMock = { schedule: jest.fn() } as any;
      const logService = { logError: jest.fn() } as any;
      const event = makeEvent();
      const updatedEvent = { ...event };
      const oddsFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(updatedEvent) } as any;
      const oddsFeedStore = { getEvent: jest.fn() } as any;
      const svc = new oddsFeedSchedulerImpl({
        oddsFeedEventSource,
        scheduler: schedulerMock,
        oddsFeedPullService,
        logService,
        shouldValidateOdds: true,
        shouldValidateEventScheduleStart: false,
        oddsFeedStore,
      });

      // Act
      svc.scheduleEvent(event);
      const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) =>
        opts.keyOverride.startsWith(`${oddsFeedEventName.EventDetailStart}`)
      );
      await call[1]();

      // Assert
      expect(oddsFeedEventSource.emitEventDetailStart).toHaveBeenCalledWith(updatedEvent, 0);
    });

    it("invokes scheduled odds available handler to emit when details available", async () => {
      // Arrange
      const oddsFeedEventSource = {
        emitEventDetailOddsAvailable: jest.fn(),
        emitEventUpcoming: jest.fn(),
        emitEventDetailUpcoming: jest.fn(),
      } as any;
      const schedulerMock = { schedule: jest.fn() } as any;
      const logService = { logError: jest.fn() } as any;
      const event = makeEvent();
      const updatedEvent = { ...event };
      const oddsFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(updatedEvent) } as any;
      const oddsFeedStore = { getEvent: jest.fn() } as any;
      const svc = new oddsFeedSchedulerImpl({
        oddsFeedEventSource,
        scheduler: schedulerMock,
        oddsFeedPullService,
        logService,
        shouldValidateOdds: true,
        shouldValidateEventScheduleStart: false,
        oddsFeedStore,
      });

      // Act
      svc.scheduleEvent(event);
      const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) =>
        opts.keyOverride.startsWith(`${oddsFeedEventName.EventDetailOddsAvailable}`)
      );
      await call[1]();

      // Assert
      expect(oddsFeedEventSource.emitEventDetailOddsAvailable).toHaveBeenCalledWith(updatedEvent, 0);
    });

    it("does not emit start when event pull fails", async () => {
      // Arrange
      const oddsFeedEventSource = {
        emitEventStart: jest.fn(),
        emitEventUpcoming: jest.fn(),
        emitEventDetailUpcoming: jest.fn(),
      } as any;
      const schedulerMock = { schedule: jest.fn() } as any;
      const logService = { logError: jest.fn() } as any;
      const event = makeEvent();
      const oddsFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(undefined) } as any;
      const oddsFeedStore = { getEvent: jest.fn() } as any;
      const svc = new oddsFeedSchedulerImpl({
        oddsFeedEventSource,
        scheduler: schedulerMock,
        oddsFeedPullService,
        logService,
        shouldValidateOdds: true,
        shouldValidateEventScheduleStart: false,
        oddsFeedStore,
      });

      // Act
      svc.scheduleEvent(event);
      const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) =>
        opts.keyOverride.startsWith(`${oddsFeedEventName.EventStart}`)
      );
      await call[1]();

      // Assert
      expect(oddsFeedPullService.pullEventWithEventDetails).toHaveBeenCalledWith(event.eventID, undefined);
      expect(oddsFeedEventSource.emitEventStart).not.toHaveBeenCalled();
      expect(logService.logError).toHaveBeenCalledWith(`Failed to get event details for event ${event.eventID}`);
    });

    it("does not emit detail start when no updated event is returned", async () => {
      // Arrange
      const oddsFeedEventSource = {
        emitEventDetailStart: jest.fn(),
        emitEventUpcoming: jest.fn(),
        emitEventDetailUpcoming: jest.fn(),
      } as any;
      const schedulerMock = { schedule: jest.fn() } as any;
      const logService = { logError: jest.fn() } as any;
      const event = makeEvent();
      const oddsFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(undefined) } as any;
      const oddsFeedStore = { getEvent: jest.fn() } as any;
      const svc = new oddsFeedSchedulerImpl({
        oddsFeedEventSource,
        scheduler: schedulerMock,
        oddsFeedPullService,
        logService,
        shouldValidateOdds: true,
        shouldValidateEventScheduleStart: false,
        oddsFeedStore,
      });

      // Act
      svc.scheduleEvent(event);
      const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) =>
        opts.keyOverride.startsWith(`${oddsFeedEventName.EventDetailStart}`)
      );
      await call[1]();

      // Assert
      expect(oddsFeedEventSource.emitEventDetailStart).not.toHaveBeenCalled();
      expect(logService.logError).toHaveBeenCalled();
    });

    it("does not emit odds available when no updated event is returned", async () => {
      // Arrange
      const oddsFeedEventSource = {
        emitEventDetailOddsAvailable: jest.fn(),
        emitEventUpcoming: jest.fn(),
        emitEventDetailUpcoming: jest.fn(),
      } as any;
      const schedulerMock = { schedule: jest.fn() } as any;
      const logService = { logError: jest.fn() } as any;
      const event = makeEvent();
      const oddsFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(undefined) } as any;
      const oddsFeedStore = { getEvent: jest.fn() } as any;
      const svc = new oddsFeedSchedulerImpl({
        oddsFeedEventSource,
        scheduler: schedulerMock,
        oddsFeedPullService,
        logService,
        shouldValidateOdds: true,
        shouldValidateEventScheduleStart: false,
        oddsFeedStore,
      });

      // Act
      svc.scheduleEvent(event);
      const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) =>
        opts.keyOverride.startsWith(`${oddsFeedEventName.EventDetailOddsAvailable}`)
      );
      await call[1]();

      // Assert
      expect(oddsFeedEventSource.emitEventDetailOddsAvailable).not.toHaveBeenCalled();
      expect(logService.logError).toHaveBeenCalled();
    });

    it("stops retrying and logs when no updated event and retry < 0", async () => {
      // Arrange
      const oddsFeedEventSource = {
        emitEventDetailResultsAvailable: jest.fn(),
        emitEventUpcoming: jest.fn(),
        emitEventDetailUpcoming: jest.fn(),
      } as any;
      const schedulerMock = { schedule: jest.fn() } as any;
      const logService = { logError: jest.fn() } as any;
      const event = makeEvent();
      const oddsFeedPullService = {
        pullEventWithEventDetails: jest
          .fn()
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined),
      } as any;
      const oddsFeedStore = { getEvent: jest.fn() } as any;
      const svc = new oddsFeedSchedulerImpl({
        oddsFeedEventSource,
        scheduler: schedulerMock,
        oddsFeedPullService,
        logService,
        shouldValidateOdds: true,
        shouldValidateEventScheduleStart: false,
        oddsFeedStore,
      });

      // Act
      svc.scheduleEvent(event);
      const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) =>
        opts.keyOverride.startsWith(`${oddsFeedEventName.EventDetailResultsAvailable}`)
      );
      await call[1]();

      // Assert
      expect(oddsFeedEventSource.emitEventDetailResultsAvailable).not.toHaveBeenCalled();
      expect(logService.logError).toHaveBeenCalled();
    });
  });
});
