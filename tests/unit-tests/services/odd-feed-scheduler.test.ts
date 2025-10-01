import { OddFeedSchedulerImpl } from "@/services";
import { OddFeedEventName } from "@/interfaces";

describe("OddFeedScheduler", () => {
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
                { eventID: 1000, scheduleStartTs: baseTime, oddsAvailableTs: baseTime, resultsAvailableTs: baseTime, hasResults: false, goalInfo: "", playlist: "", result: "", markets: {}, inGameEventInfo: "", phase: 0 },
                { eventID: 1000, scheduleStartTs: baseTime, oddsAvailableTs: baseTime, resultsAvailableTs: baseTime, hasResults: false, goalInfo: "", playlist: "", result: "", markets: {}, inGameEventInfo: "", phase: 1 },
            ],
        } as any;
    };

    describe("scheduleEventUpcoming", () => {
        it("emits upcoming event", () => {
            // Arrange
            const oddFeedEventSource = { onEventUpcoming: jest.fn() } as any;
            const scheduler = { schedule: jest.fn() } as any;
            const oddFeedPullService = { pullEventWithEventDetails: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const svc = new OddFeedSchedulerImpl({ oddFeedEventSource, scheduler, oddFeedPullService, logService });
            const event = makeEvent();

            // Act
            svc.scheduleEventUpcoming(event);

            // Assert
            expect(oddFeedEventSource.onEventUpcoming).toHaveBeenCalledWith(event);
        });
    });

    describe("scheduleEvent", () => {
        it("schedules start and detail events with correct keys", () => {
            // Arrange
            const oddFeedEventSource = { onEventUpcoming: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const oddFeedPullService = { pullEventWithEventDetails: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const svc = new OddFeedSchedulerImpl({ oddFeedEventSource, scheduler: schedulerMock, oddFeedPullService, logService });
            const event = makeEvent();

            // Act
            svc.scheduleEvent(event);

            // Assert
            const keys = schedulerMock.schedule.mock.calls.map(([, , opts]: any) => opts.keyOverride);
            expect(keys).toContain(`${OddFeedEventName.EventStart}-${event.eventID}-0`);
            expect(keys).toContain(`${OddFeedEventName.EventDetailStart}-${event.eventID}-0`);
            expect(keys).toContain(`${OddFeedEventName.EventDetailOddsAvailable}-${event.eventID}-0`);
            expect(keys).toContain(`${OddFeedEventName.EventDetailResultsAvailable}-${event.eventID}-0`);
        });

        it("invokes scheduled start handler to emit when details available", async () => {
            // Arrange
            const oddFeedEventSource = { onEventStart: jest.fn(), onEventUpcoming: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const updatedEvent = { ...event };
            const oddFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(updatedEvent) } as any;
            const svc = new OddFeedSchedulerImpl({ oddFeedEventSource, scheduler: schedulerMock, oddFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${OddFeedEventName.EventStart}`));
            await call[1]();

            // Assert
            expect(oddFeedEventSource.onEventStart).toHaveBeenCalledWith(updatedEvent);
        });

        it("invokes scheduled detail start handler to emit when details available", async () => {
            // Arrange
            const oddFeedEventSource = { onEventDetailStart: jest.fn(), onEventUpcoming: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const updatedEvent = { ...event };
            const oddFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(updatedEvent) } as any;
            const svc = new OddFeedSchedulerImpl({ oddFeedEventSource, scheduler: schedulerMock, oddFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${OddFeedEventName.EventDetailStart}`));
            await call[1]();

            // Assert
            expect(oddFeedEventSource.onEventDetailStart).toHaveBeenCalledWith(updatedEvent, 0);
        });

        it("invokes scheduled odds available handler to emit when details available", async () => {
            // Arrange
            const oddFeedEventSource = { onEventDetailOddsAvailable: jest.fn(), onEventUpcoming: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const updatedEvent = { ...event };
            const oddFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(updatedEvent) } as any;
            const svc = new OddFeedSchedulerImpl({ oddFeedEventSource, scheduler: schedulerMock, oddFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${OddFeedEventName.EventDetailOddsAvailable}`));
            await call[1]();

            // Assert
            expect(oddFeedEventSource.onEventDetailOddsAvailable).toHaveBeenCalledWith(updatedEvent, 0);
        });

        it("invokes results available handler with retries until result is present", async () => {
            // Arrange
            const oddFeedEventSource = { onEventDetailResultsAvailable: jest.fn(), onEventUpcoming: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const first = undefined;
            const second = { ...event };
            const third = { ...event, eventDetails: [{ ...event.eventDetails[0], result: "W" }, event.eventDetails[1]] };
            const oddFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second).mockResolvedValueOnce(third) } as any;
            const svc = new OddFeedSchedulerImpl({ oddFeedEventSource, scheduler: schedulerMock, oddFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${OddFeedEventName.EventDetailResultsAvailable}`));
            await call[1]();

            // Assert
            expect(oddFeedEventSource.onEventDetailResultsAvailable).toHaveBeenCalledWith(third, 0);
        });

        it("does not emit start when no updated event is returned", async () => {
            // Arrange
            const oddFeedEventSource = { onEventStart: jest.fn(), onEventUpcoming: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const oddFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(undefined) } as any;
            const svc = new OddFeedSchedulerImpl({ oddFeedEventSource, scheduler: schedulerMock, oddFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${OddFeedEventName.EventStart}`));
            await call[1]();

            // Assert
            expect(oddFeedEventSource.onEventStart).not.toHaveBeenCalled();
            expect(logService.logError).toHaveBeenCalled();
        });

        it("does not emit detail start when no updated event is returned", async () => {
            // Arrange
            const oddFeedEventSource = { onEventDetailStart: jest.fn(), onEventUpcoming: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const oddFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(undefined) } as any;
            const svc = new OddFeedSchedulerImpl({ oddFeedEventSource, scheduler: schedulerMock, oddFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${OddFeedEventName.EventDetailStart}`));
            await call[1]();

            // Assert
            expect(oddFeedEventSource.onEventDetailStart).not.toHaveBeenCalled();
            expect(logService.logError).toHaveBeenCalled();
        });

        it("does not emit odds available when no updated event is returned", async () => {
            // Arrange
            const oddFeedEventSource = { onEventDetailOddsAvailable: jest.fn(), onEventUpcoming: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const oddFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(undefined) } as any;
            const svc = new OddFeedSchedulerImpl({ oddFeedEventSource, scheduler: schedulerMock, oddFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${OddFeedEventName.EventDetailOddsAvailable}`));
            await call[1]();

            // Assert
            expect(oddFeedEventSource.onEventDetailOddsAvailable).not.toHaveBeenCalled();
            expect(logService.logError).toHaveBeenCalled();
        });

        it("stops retrying and logs when no updated event and retry < 0", async () => {
            // Arrange
            const oddFeedEventSource = { onEventDetailResultsAvailable: jest.fn(), onEventUpcoming: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const oddFeedPullService = { pullEventWithEventDetails: jest.fn()
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined) } as any;
            const svc = new OddFeedSchedulerImpl({ oddFeedEventSource, scheduler: schedulerMock, oddFeedPullService, logService });
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${OddFeedEventName.EventDetailResultsAvailable}`));
            await call[1]();

            // Assert
            expect(oddFeedEventSource.onEventDetailResultsAvailable).not.toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });
});


