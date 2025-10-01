jest.mock("@/lib/cron", () => {
    const start = jest.fn();
    const CronJob = jest.fn().mockImplementation((_expr: any, _onTick: any, _onComplete: any) => ({ start }));
    return { CronJob };
});
import { OddFeedCronImpl } from "@/services";
import * as cronModule from "@/lib/cron";

describe("OddFeedCron", () => {
    describe("start", () => {
        it("calls schedule and scheduleNextEventsCron", async () => {
            // Arrange
            const logService = { logError: jest.fn() } as any;
            const oddFeedPullService = { pullUpcoming: jest.fn() } as any;
            const oddFeedScheduler = { scheduleEvent: jest.fn() } as any;
            const cron = new OddFeedCronImpl({ logService, oddFeedPullService, oddFeedScheduler });
            const spySchedule = jest.spyOn(cron, "schedule").mockResolvedValue(undefined as any);
            const spyScheduleCron = jest.spyOn(cron, "scheduleNextEventsCron").mockImplementation(() => {});

            // Act
            await cron.start();

            // Assert
            expect(spySchedule).toHaveBeenCalled();
            expect(spyScheduleCron).toHaveBeenCalled();
        });
    });

    describe("scheduleNextEventsCron", () => {
        it("starts cron job and reschedules on stop", () => {
            // Arrange
            const logService = { logError: jest.fn() } as any;
            const oddFeedPullService = { pullUpcoming: jest.fn() } as any;
            const oddFeedScheduler = { scheduleEvent: jest.fn() } as any;
            const cron = new OddFeedCronImpl({ logService, oddFeedPullService, oddFeedScheduler });
            const scheduleSpy = jest.spyOn(cron, "schedule").mockResolvedValue(undefined as any);

            // Act
            cron.scheduleNextEventsCron();

            // Assert
            const CronJob = (cronModule as any).CronJob as jest.Mock;
            const instance = CronJob.mock.results[0].value;
            expect(instance.start).toHaveBeenCalled();
            expect(scheduleSpy).not.toHaveBeenCalled();
        });
    });

    describe("schedule", () => {
        it("pulls upcoming and schedules events with details", async () => {
            // Arrange
            const logService = { logError: jest.fn() } as any;
            const event = { eventID: 123, eventDetails: [] } as any;
            const oddFeedPullService = {
                pullUpcoming: jest.fn().mockResolvedValue([event]),
                pullEventWithEventDetails: jest.fn().mockResolvedValue({ ...event }),
            } as any;
            const oddFeedScheduler = { scheduleEvent: jest.fn() } as any;
            const cron = new OddFeedCronImpl({ logService, oddFeedPullService, oddFeedScheduler });

            // Act
            await cron.schedule();

            // Assert
            expect(oddFeedPullService.pullUpcoming).toHaveBeenCalled();
            expect(oddFeedPullService.pullEventWithEventDetails).toHaveBeenCalledWith(event.eventID);
            expect(oddFeedScheduler.scheduleEvent).toHaveBeenCalledWith(event);
        });

        it("skips scheduling when event details not available", async () => {
            // Arrange
            const logService = { logError: jest.fn() } as any;
            const event = { eventID: 123, eventDetails: [] } as any;
            const oddFeedPullService = {
                pullUpcoming: jest.fn().mockResolvedValue([event]),
                pullEventWithEventDetails: jest.fn().mockResolvedValue(undefined),
            } as any;
            const oddFeedScheduler = { scheduleEvent: jest.fn() } as any;
            const cron = new OddFeedCronImpl({ logService, oddFeedPullService, oddFeedScheduler });

            // Act
            await cron.schedule();

            // Assert
            expect(oddFeedScheduler.scheduleEvent).not.toHaveBeenCalled();
        });
    });
});


