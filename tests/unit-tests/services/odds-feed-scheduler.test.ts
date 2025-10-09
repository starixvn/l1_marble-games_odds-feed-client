import { oddsFeedSchedulerImpl } from "@/services";
import { oddsFeedEventName } from "@/interfaces";

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
                { eventID: 1000, scheduleStartTs: baseTime, oddsAvailableTs: baseTime, resultsAvailableTs: baseTime, hasResults: false, goalInfo: "", playlist: "", result: "", markets: {}, inGameEventInfo: "", phase: 0 },
                { eventID: 1000, scheduleStartTs: baseTime, oddsAvailableTs: baseTime, resultsAvailableTs: baseTime, hasResults: false, goalInfo: "", playlist: "", result: "", markets: {}, inGameEventInfo: "", phase: 1 },
            ],
        } as any;
    };

    describe("scheduleEventUpcoming", () => {
        it("emits upcoming event", () => {
            // Arrange
            const oddsFeedEventSource = { onEventUpcoming: jest.fn() } as any;
            const scheduler = { schedule: jest.fn() } as any;
            const oddsFeedPullService = { pullEventWithEventDetails: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const svc = new oddsFeedSchedulerImpl({ oddsFeedEventSource, scheduler, oddsFeedPullService, logService });
            const event = makeEvent();

            // Act
            svc.scheduleEventUpcoming(event);

            // Assert
            expect(oddsFeedEventSource.onEventUpcoming).toHaveBeenCalledWith(event);
        });
    });

    describe("scheduleEvent", () => {
        it("schedules start and detail events with correct keys", () => {
            // Arrange
            const oddsFeedEventSource = { onEventUpcoming: jest.fn(), onEventDetailUpComing: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const oddsFeedPullService = { pullEventWithEventDetails: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const svc = new oddsFeedSchedulerImpl({ oddsFeedEventSource, scheduler: schedulerMock, oddsFeedPullService, logService });
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
            expect(oddsFeedEventSource.onEventUpcoming).toHaveBeenCalledWith(event);
            expect(oddsFeedEventSource.onEventDetailUpComing).toHaveBeenCalledWith(event, 0);
            expect(oddsFeedEventSource.onEventDetailUpComing).toHaveBeenCalledWith(event, 1);
        });

        it("invokes scheduled start handler to emit when details available", async () => {
            // Arrange
            const oddsFeedEventSource = { onEventStart: jest.fn(), onEventUpcoming: jest.fn(), onEventDetailUpComing: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const updatedEvent = { ...event };
            const oddsFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(updatedEvent) } as any;
            const svc = new oddsFeedSchedulerImpl({ oddsFeedEventSource, scheduler: schedulerMock, oddsFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${oddsFeedEventName.EventStart}`));
            await call[1]();

            // Assert
            expect(oddsFeedEventSource.onEventStart).toHaveBeenCalledWith(updatedEvent);
        });

        it("invokes scheduled detail start handler to emit when details available", async () => {
            // Arrange
            const oddsFeedEventSource = { onEventDetailStart: jest.fn(), onEventUpcoming: jest.fn(), onEventDetailUpComing: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const updatedEvent = { ...event };
            const oddsFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(updatedEvent) } as any;
            const svc = new oddsFeedSchedulerImpl({ oddsFeedEventSource, scheduler: schedulerMock, oddsFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${oddsFeedEventName.EventDetailStart}`));
            await call[1]();

            // Assert
            expect(oddsFeedEventSource.onEventDetailStart).toHaveBeenCalledWith(updatedEvent, 0);
        });

        it("invokes scheduled odds available handler to emit when details available", async () => {
            // Arrange
            const oddsFeedEventSource = { onEventDetailOddsAvailable: jest.fn(), onEventUpcoming: jest.fn(), onEventDetailUpComing: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const updatedEvent = { ...event };
            const oddsFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(updatedEvent) } as any;
            const svc = new oddsFeedSchedulerImpl({ oddsFeedEventSource, scheduler: schedulerMock, oddsFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${oddsFeedEventName.EventDetailOddsAvailable}`));
            await call[1]();

            // Assert
            expect(oddsFeedEventSource.onEventDetailOddsAvailable).toHaveBeenCalledWith(updatedEvent, 0);
        });

        it("invokes results available handler with retries until result is present", async () => {
            // Arrange
            const oddsFeedEventSource = { onEventDetailResultsAvailable: jest.fn(), onEventUpcoming: jest.fn(), onEventDetailUpComing: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const first = undefined;
            const second = { ...event };
            const third = { ...event, eventDetails: [{ ...event.eventDetails[0], result: "W" }, event.eventDetails[1]] };
            const oddsFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second).mockResolvedValueOnce(third) } as any;
            const svc = new oddsFeedSchedulerImpl({ oddsFeedEventSource, scheduler: schedulerMock, oddsFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${oddsFeedEventName.EventDetailResultsAvailable}`));
            await call[1]();

            // Assert
            expect(oddsFeedEventSource.onEventDetailResultsAvailable).toHaveBeenCalledWith(third, 0);
        });

        it("does not emit start when no updated event is returned", async () => {
            // Arrange
            const oddsFeedEventSource = { onEventStart: jest.fn(), onEventUpcoming: jest.fn(), onEventDetailUpComing: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const oddsFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(undefined) } as any;
            const svc = new oddsFeedSchedulerImpl({ oddsFeedEventSource, scheduler: schedulerMock, oddsFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${oddsFeedEventName.EventStart}`));
            await call[1]();

            // Assert
            expect(oddsFeedEventSource.onEventStart).not.toHaveBeenCalled();
            expect(logService.logError).toHaveBeenCalled();
        });

        it("does not emit detail start when no updated event is returned", async () => {
            // Arrange
            const oddsFeedEventSource = { onEventDetailStart: jest.fn(), onEventUpcoming: jest.fn(), onEventDetailUpComing: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const oddsFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(undefined) } as any;
            const svc = new oddsFeedSchedulerImpl({ oddsFeedEventSource, scheduler: schedulerMock, oddsFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${oddsFeedEventName.EventDetailStart}`));
            await call[1]();

            // Assert
            expect(oddsFeedEventSource.onEventDetailStart).not.toHaveBeenCalled();
            expect(logService.logError).toHaveBeenCalled();
        });

        it("does not emit odds available when no updated event is returned", async () => {
            // Arrange
            const oddsFeedEventSource = { onEventDetailOddsAvailable: jest.fn(), onEventUpcoming: jest.fn(), onEventDetailUpComing: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const oddsFeedPullService = { pullEventWithEventDetails: jest.fn().mockResolvedValue(undefined) } as any;
            const svc = new oddsFeedSchedulerImpl({ oddsFeedEventSource, scheduler: schedulerMock, oddsFeedPullService, logService });

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${oddsFeedEventName.EventDetailOddsAvailable}`));
            await call[1]();

            // Assert
            expect(oddsFeedEventSource.onEventDetailOddsAvailable).not.toHaveBeenCalled();
            expect(logService.logError).toHaveBeenCalled();
        });

        it("stops retrying and logs when no updated event and retry < 0", async () => {
            // Arrange
            const oddsFeedEventSource = { onEventDetailResultsAvailable: jest.fn(), onEventUpcoming: jest.fn(), onEventDetailUpComing: jest.fn() } as any;
            const schedulerMock = { schedule: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const event = makeEvent();
            const oddsFeedPullService = { pullEventWithEventDetails: jest.fn()
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined) } as any;
            const svc = new oddsFeedSchedulerImpl({ oddsFeedEventSource, scheduler: schedulerMock, oddsFeedPullService, logService });
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

            // Act
            svc.scheduleEvent(event);
            const call = schedulerMock.schedule.mock.calls.find(([, , opts]: any) => opts.keyOverride.startsWith(`${oddsFeedEventName.EventDetailResultsAvailable}`));
            await call[1]();

            // Assert
            expect(oddsFeedEventSource.onEventDetailResultsAvailable).not.toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });
});


