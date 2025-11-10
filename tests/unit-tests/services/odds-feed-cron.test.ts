jest.mock("@/lib/cron", () => {
  const start = jest.fn();
  const CronJob = jest.fn().mockImplementation((_expr: any, _onTick: any, _onComplete: any) => ({ start }));
  return { CronJob };
});
jest.mock("@/utils", () => ({
  idHelper: {
    extractGameId: jest.fn((eventId: number) => {
      // Simplified mock: eventId / 1000 gives game ID
      return Math.floor(eventId / 1000).toString();
    }),
    extractRoundId: jest.fn((eventId: number) => {
      // Simplified mock: eventId % 1000 gives round ID
      return eventId % 1000;
    }),
  },
}));
import { OddsFeedCronImpl as oddsFeedCronImpl } from "@/services";
import * as cronModule from "@/lib/cron";

describe("oddsFeedCron", () => {
  describe("start", () => {
    it("calls schedule and scheduleNextEventsCron when startCurrentEvents is false", async () => {
      // Arrange
      const logService = { logError: jest.fn() } as any;
      const oddsFeedPullService = { pullUpcoming: jest.fn() } as any;
      const oddsFeedScheduler = { scheduleEvent: jest.fn() } as any;
      const cron = new oddsFeedCronImpl({ logService, oddsFeedPullService, oddsFeedScheduler });
      const spySchedule = jest.spyOn(cron, "schedule").mockResolvedValue(undefined as any);
      const spyScheduleCron = jest.spyOn(cron, "scheduleNextEventsCron").mockImplementation(() => {});
      const spyInitializeCurrentEvents = jest
        .spyOn(cron, "initializeCurrentEvents")
        .mockResolvedValue(undefined as any);

      // Act
      await cron.start();

      // Assert
      expect(spySchedule).toHaveBeenCalled();
      expect(spyScheduleCron).toHaveBeenCalled();
      expect(spyInitializeCurrentEvents).not.toHaveBeenCalled();
    });

    it("calls initializeCurrentEvents, schedule and scheduleNextEventsCron when startCurrentEvents is true", async () => {
      // Arrange
      const logService = { logError: jest.fn() } as any;
      const oddsFeedPullService = { pullUpcoming: jest.fn() } as any;
      const oddsFeedScheduler = { scheduleEvent: jest.fn() } as any;
      const cron = new oddsFeedCronImpl({ logService, oddsFeedPullService, oddsFeedScheduler });
      const spySchedule = jest.spyOn(cron, "schedule").mockResolvedValue(undefined as any);
      const spyScheduleCron = jest.spyOn(cron, "scheduleNextEventsCron").mockImplementation(() => {});
      const spyInitializeCurrentEvents = jest
        .spyOn(cron, "initializeCurrentEvents")
        .mockResolvedValue(undefined as any);

      // Act
      await cron.start(true);

      // Assert
      expect(spyInitializeCurrentEvents).toHaveBeenCalled();
      expect(spySchedule).toHaveBeenCalled();
      expect(spyScheduleCron).toHaveBeenCalled();
    });
  });

  describe("scheduleNextEventsCron", () => {
    it("starts cron job and reschedules on stop", () => {
      // Arrange
      const logService = { logError: jest.fn() } as any;
      const oddsFeedPullService = { pullUpcoming: jest.fn() } as any;
      const oddsFeedScheduler = { scheduleEvent: jest.fn() } as any;
      const cron = new oddsFeedCronImpl({ logService, oddsFeedPullService, oddsFeedScheduler });
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
      const oddsFeedPullService = {
        pullUpcoming: jest.fn().mockResolvedValue([event]),
        pullEventWithEventDetails: jest.fn().mockResolvedValue({ ...event }),
      } as any;
      const oddsFeedScheduler = { scheduleEvent: jest.fn() } as any;
      const cron = new oddsFeedCronImpl({ logService, oddsFeedPullService, oddsFeedScheduler });

      // Act
      await cron.schedule();

      // Assert
      expect(oddsFeedPullService.pullUpcoming).toHaveBeenCalled();
      expect(oddsFeedPullService.pullEventWithEventDetails).toHaveBeenCalledWith(event.eventID);
      expect(oddsFeedScheduler.scheduleEvent).toHaveBeenCalledWith(event);
    });

    it("skips scheduling when event details not available", async () => {
      // Arrange
      const logService = { logError: jest.fn() } as any;
      const event = { eventID: 123, eventDetails: [] } as any;
      const oddsFeedPullService = {
        pullUpcoming: jest.fn().mockResolvedValue([event]),
        pullEventWithEventDetails: jest.fn().mockResolvedValue(undefined),
      } as any;
      const oddsFeedScheduler = { scheduleEvent: jest.fn() } as any;
      const cron = new oddsFeedCronImpl({ logService, oddsFeedPullService, oddsFeedScheduler });

      // Act
      await cron.schedule();

      // Assert
      expect(oddsFeedScheduler.scheduleEvent).not.toHaveBeenCalled();
    });
  });

  describe("getNextEventIDsForEachGame", () => {
    it("returns the next event ID for each game", async () => {
      // Arrange
      const logService = { logError: jest.fn() } as any;
      const events = [
        { eventID: 1001 },
        { eventID: 1002 },
        { eventID: 2001 },
        { eventID: 2003 },
        { eventID: 2002 },
      ] as any;
      const oddsFeedPullService = {
        pullUpcoming: jest.fn().mockResolvedValue(events),
      } as any;
      const oddsFeedScheduler = { scheduleEvent: jest.fn() } as any;
      const cron = new oddsFeedCronImpl({ logService, oddsFeedPullService, oddsFeedScheduler });

      // Act
      const result = await cron.getNextEventIDsForEachGame();

      // Assert
      expect(oddsFeedPullService.pullUpcoming).toHaveBeenCalled();
      expect(result).toEqual({
        "1": 1001, // Lowest eventID for game ID "1"
        "2": 2001, // Lowest eventID for game ID "2"
      });
    });
  });

  describe("getCurrentEventIDsOfAllGames", () => {
    it("returns current event IDs for all games", async () => {
      // Arrange
      const logService = { logError: jest.fn() } as any;
      const events = [{ eventID: 1001 }, { eventID: 2002 }] as any;
      const oddsFeedPullService = {
        pullUpcoming: jest.fn().mockResolvedValue(events),
      } as any;
      const oddsFeedScheduler = { scheduleEvent: jest.fn() } as any;
      const cron = new oddsFeedCronImpl({ logService, oddsFeedPullService, oddsFeedScheduler });

      // Act
      const result = await cron.getCurrentEventIDsOfAllGames();

      // Assert
      expect(oddsFeedPullService.pullUpcoming).toHaveBeenCalled();
      // eventID 1001 -> roundId = 1, so returns 1001
      // eventID 2002 -> roundId = 2, so returns 2001 (2002 - 1)
      expect(result).toEqual([1001, 2001]);
    });
  });

  describe("initializeCurrentEvents", () => {
    it("schedules all current events in parallel", async () => {
      // Arrange
      const logService = { logError: jest.fn() } as any;
      const events = [{ eventID: 1001 }, { eventID: 2002 }] as any;
      const oddsFeedPullService = {
        pullUpcoming: jest.fn().mockResolvedValue(events),
        pullEventWithEventDetails: jest.fn().mockResolvedValue({ eventID: 1001 }),
      } as any;
      const oddsFeedScheduler = { scheduleEvent: jest.fn() } as any;
      const cron = new oddsFeedCronImpl({ logService, oddsFeedPullService, oddsFeedScheduler });
      const spyScheduleEvent = jest.spyOn(cron, "scheduleEvent").mockResolvedValue(undefined as any);

      // Act
      await cron.initializeCurrentEvents();

      // Assert
      expect(oddsFeedPullService.pullUpcoming).toHaveBeenCalled();
      expect(spyScheduleEvent).toHaveBeenCalledTimes(2);
      expect(spyScheduleEvent).toHaveBeenCalledWith({ eventID: 1001 });
      expect(spyScheduleEvent).toHaveBeenCalledWith({ eventID: 2001 });
    });
  });
});
