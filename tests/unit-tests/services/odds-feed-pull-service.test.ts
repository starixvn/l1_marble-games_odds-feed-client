import { OddsFeedPullServiceImpl as oddsFeedPullServiceImpl } from "@/services";
import { idHelper } from "@/utils";

describe("oddsFeedPullService", () => {
  describe("pullUpcoming", () => {
    it("stores upcoming events by game id and returns list", async () => {
      // Arrange
      const eventA = { eventID: idHelper.createEventId(2, 10) } as any;
      const eventB = { eventID: idHelper.createEventId(3, 11) } as any;
      const oddsFeedService = { fetchSchedule: jest.fn().mockResolvedValue([eventA, eventB]) } as any;
      const logService = { logError: jest.fn() } as any;
      const oddsFeedFilter = () => true;
      const oddsFeedStore = { setEvent: jest.fn() } as any;
      const svc = new oddsFeedPullServiceImpl({ oddsFeedService, logService, oddsFeedFilter, oddsFeedStore });

      // Act
      const result = await svc.pullUpcoming();

      // Assert
      expect(result).toEqual([eventA, eventB]);
    });
  });

  describe("pullEventWithEventDetails", () => {
    it("returns undefined and logs when details not available", async () => {
      // Arrange
      const oddsFeedService = { fetchEventDetails: jest.fn().mockResolvedValue(undefined) } as any;
      const logService = { logError: jest.fn() } as any;
      const oddsFeedFilter = () => true;
      const oddsFeedStore = { setEvent: jest.fn() } as any;
      const svc = new oddsFeedPullServiceImpl({ oddsFeedService, logService, oddsFeedFilter, oddsFeedStore });

      // Act
      const result = await svc.pullEventWithEventDetails(123);

      // Assert
      expect(result).toBeUndefined();
      expect(logService.logError).toHaveBeenCalled();
      expect(oddsFeedStore.setEvent).not.toHaveBeenCalled();
    });

    it("stores and returns event when details available", async () => {
      // Arrange
      const event = { eventID: idHelper.createEventId(9, 1) } as any;
      const oddsFeedService = { fetchEventDetails: jest.fn().mockResolvedValue(event) } as any;
      const logService = { logError: jest.fn() } as any;
      const oddsFeedFilter = () => true;
      const oddsFeedStore = { setEvent: jest.fn() } as any;
      const svc = new oddsFeedPullServiceImpl({ oddsFeedService, logService, oddsFeedFilter, oddsFeedStore });

      // Act
      const result = await svc.pullEventWithEventDetails(event.eventID);

      // Assert
      expect(result).toEqual(event);
      expect(logService.logError).not.toHaveBeenCalled();
      expect(oddsFeedStore.setEvent).toHaveBeenCalledWith(event);
      expect(oddsFeedStore.setEvent).toHaveBeenCalledTimes(1);
    });
  });
});
