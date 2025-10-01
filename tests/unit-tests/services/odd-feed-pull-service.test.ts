import { OddFeedPullServiceImpl } from "@/services";
import { idHelper } from "@/utils";

describe("OddFeedPullService", () => {
    describe("pullUpcoming", () => {
        it("stores upcoming events by game id and returns list", async () => {
            // Arrange
            const eventA = { eventID: idHelper.createEventId(2, 10) } as any;
            const eventB = { eventID: idHelper.createEventId(3, 11) } as any;
            const oddFeedService = { fetchSchedule: jest.fn().mockResolvedValue([eventA, eventB]) } as any;
            const setEventByGameId = jest.fn();
            const oddFeedStore = { setEventByGameId } as any;
            const logService = { logError: jest.fn() } as any;
            const svc = new OddFeedPullServiceImpl({ oddFeedService, oddFeedStore, logService });

            // Act
            const result = await svc.pullUpcoming();

            // Assert
            expect(result).toEqual([eventA, eventB]);
            expect(setEventByGameId).toHaveBeenCalledTimes(2);
        });
    });

    describe("pullEventWithEventDetails", () => {
        it("returns undefined and logs when details not available", async () => {
            // Arrange
            const oddFeedService = { fetchEventDetails: jest.fn().mockResolvedValue(undefined) } as any;
            const oddFeedStore = { setEventByGameId: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const svc = new OddFeedPullServiceImpl({ oddFeedService, oddFeedStore, logService });

            // Act
            const result = await svc.pullEventWithEventDetails(123);

            // Assert
            expect(result).toBeUndefined();
            expect(logService.logError).toHaveBeenCalled();
            expect(oddFeedStore.setEventByGameId).not.toHaveBeenCalled();
        });

        it("stores and returns event when details available", async () => {
            // Arrange
            const event = { eventID: idHelper.createEventId(9, 1) } as any;
            const oddFeedService = { fetchEventDetails: jest.fn().mockResolvedValue(event) } as any;
            const oddFeedStore = { setEventByGameId: jest.fn() } as any;
            const logService = { logError: jest.fn() } as any;
            const svc = new OddFeedPullServiceImpl({ oddFeedService, oddFeedStore, logService });

            // Act
            const result = await svc.pullEventWithEventDetails(event.eventID);

            // Assert
            expect(result).toEqual(event);
            expect(oddFeedStore.setEventByGameId).toHaveBeenCalled();
            expect(logService.logError).not.toHaveBeenCalled();
        });
    });
});


