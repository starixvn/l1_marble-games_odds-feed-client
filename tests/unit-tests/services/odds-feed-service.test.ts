import { OddsFeedServiceImpl as oddsFeedServiceImpl } from "@/services";
import { AppConfigs, Logger, MarbleLoggerService } from "@/interfaces";

describe("oddsFeedService", () => {
  const makeResponse = (status: number, data: any) => ({
    status,
    json: async () => data,
  });

  let logService: Logger;
  let appConfigs: AppConfigs;
  let marbleLoggerService: MarbleLoggerService;
  let service: oddsFeedServiceImpl;
  let apiLogger: {
    logSchedule: jest.Mock;
    logEventDetails: jest.Mock;
    logRemoteJson: jest.Mock;
  };

  beforeEach(() => {
    (globalThis as any).fetch = jest.fn();
    logService = { logError: jest.fn(), log: jest.fn() };
    marbleLoggerService = {
      init: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      debug: jest.fn(),
    } as any;
    apiLogger = {
      logSchedule: jest.fn(),
      logEventDetails: jest.fn(),
      logRemoteJson: jest.fn(),
    };
    appConfigs = {
      oddsFeedAPI: {
        url: "https://api.example.com",
        operatorId: "op-1",
        password: "pwd",
      },
    };
    service = new oddsFeedServiceImpl({ logService, appConfigs, marbleLoggerService, apiLogger } as any);
  });

  describe("fetchSchedule", () => {
    it("returns schedule on success", async () => {
      // Arrange
      const events = [{ eventID: 1 }];
      (globalThis as any).fetch
        .mockResolvedValueOnce(makeResponse(200, { access_token: "tkn" }))
        .mockResolvedValueOnce(makeResponse(200, events));

      // Act
      const result = await service.fetchSchedule(1, 0);

      // Assert
      expect(result).toEqual(events);
      expect(logService.logError).not.toHaveBeenCalled();
      expect(marbleLoggerService.error).not.toHaveBeenCalled();
      expect((globalThis as any).fetch).toHaveBeenCalledTimes(2);
    });

    it("uses default retries/delay and returns schedule", async () => {
      // Arrange
      const events = [{ eventID: 3 }];
      (globalThis as any).fetch
        .mockResolvedValueOnce(makeResponse(200, { access_token: "tkn" }))
        .mockResolvedValueOnce(makeResponse(200, events));

      // Act
      const result = await service.fetchSchedule();

      // Assert
      expect(result).toEqual(events);
      expect(logService.logError).not.toHaveBeenCalled();
      expect(marbleLoggerService.error).not.toHaveBeenCalled();
      expect((globalThis as any).fetch).toHaveBeenCalledTimes(2);
    });

    it("refreshes token on 401 then succeeds", async () => {
      // Arrange
      const events = [{ eventID: 2 }];
      (globalThis as any).fetch
        .mockResolvedValueOnce(makeResponse(200, { access_token: "t1" }))
        .mockResolvedValueOnce(makeResponse(401, {}))
        .mockResolvedValueOnce(makeResponse(200, { access_token: "t2" }))
        .mockResolvedValueOnce(makeResponse(200, events));

      // Act
      const result = await service.fetchSchedule(2, 0);

      // Assert
      expect(result).toEqual(events);
      expect(logService.logError).not.toHaveBeenCalled();
      expect(marbleLoggerService.error).not.toHaveBeenCalled();
      expect((globalThis as any).fetch).toHaveBeenCalledTimes(4);
    });

    it("returns empty array and logs on non-200", async () => {
      // Arrange
      (globalThis as any).fetch
        .mockResolvedValueOnce(makeResponse(200, { access_token: "tkn" }))
        .mockResolvedValueOnce(makeResponse(500, {}));

      // Act
      const result = await service.fetchSchedule(1, 0);

      // Assert
      expect(result).toEqual([]);
      expect(marbleLoggerService.error).toHaveBeenCalled();
    });
  });

  describe("fetchEventDetails", () => {
    it("returns event details on success", async () => {
      // Arrange
      const event = { eventID: 10 } as any;
      (globalThis as any).fetch
        .mockResolvedValueOnce(makeResponse(200, { access_token: "tkn" }))
        .mockResolvedValueOnce(makeResponse(200, event));

      // Act
      const result = await service.fetchEventDetails(10, undefined, 1, 0);

      // Assert
      expect(result).toEqual(event);
      expect(logService.logError).not.toHaveBeenCalled();
      expect(marbleLoggerService.error).not.toHaveBeenCalled();
    });

    it("uses default validator/retries/delay and returns event", async () => {
      // Arrange
      const event = { eventID: 14 } as any;
      (globalThis as any).fetch
        .mockResolvedValueOnce(makeResponse(200, { access_token: "tkn" }))
        .mockResolvedValueOnce(makeResponse(200, event));

      // Act
      const result = await service.fetchEventDetails(14);

      // Assert
      expect(result).toEqual(event);
      expect(logService.logError).not.toHaveBeenCalled();
      expect(marbleLoggerService.error).not.toHaveBeenCalled();
      expect((globalThis as any).fetch).toHaveBeenCalledTimes(2);
    });

    it("retries on 401 then succeeds", async () => {
      // Arrange
      const event = { eventID: 11 } as any;
      (globalThis as any).fetch
        .mockResolvedValueOnce(makeResponse(200, { access_token: "t1" }))
        .mockResolvedValueOnce(makeResponse(401, {}))
        .mockResolvedValueOnce(makeResponse(200, { access_token: "t2" }))
        .mockResolvedValueOnce(makeResponse(200, event));

      // Act
      const result = await service.fetchEventDetails(11, undefined, 2, 0);

      // Assert
      expect(result).toEqual(event);
      expect(logService.logError).not.toHaveBeenCalled();
      expect(marbleLoggerService.error).not.toHaveBeenCalled();
      expect((globalThis as any).fetch).toHaveBeenCalledTimes(4);
    });

    it("returns null and logs when validator fails", async () => {
      // Arrange
      const badEvent = { eventID: 12 } as any;
      (globalThis as any).fetch
        .mockResolvedValueOnce(makeResponse(200, { access_token: "tkn" }))
        .mockResolvedValueOnce(makeResponse(200, badEvent));
      const validator = () => false;

      // Act
      const result = await service.fetchEventDetails(12, validator, 1, 0);

      // Assert
      expect(result).toBeNull();
      expect(logService.logError).toHaveBeenCalled();
      expect(marbleLoggerService.error).toHaveBeenCalled();
    });

    it("returns null and logs on non-200", async () => {
      // Arrange
      (globalThis as any).fetch
        .mockResolvedValueOnce(makeResponse(200, { access_token: "tkn" }))
        .mockResolvedValueOnce(makeResponse(500, {}));

      // Act
      const result = await service.fetchEventDetails(13, undefined, 1, 0);

      // Assert
      expect(result).toBeNull();
      expect(marbleLoggerService.error).toHaveBeenCalled();
    });
  });

  describe("getRemoteJson", () => {
    it("returns parsed json on success", async () => {
      // Arrange
      const data = { a: 1 };
      (globalThis as any).fetch.mockResolvedValueOnce(makeResponse(200, data));

      // Act
      const result = await service.getRemoteJson<typeof data>("https://x/y", { eventId: 1 }, 1, 0);

      // Assert
      expect(result).toEqual(data);
      expect(marbleLoggerService.error).not.toHaveBeenCalled();
    });

    it("uses default retries/delay and returns parsed json", async () => {
      // Arrange
      const data = { a: 2 };
      (globalThis as any).fetch.mockResolvedValueOnce(makeResponse(200, data));

      // Act
      const result = await service.getRemoteJson<typeof data>("https://x/z", { eventId: 2 });

      // Assert
      expect(result).toEqual(data);
      expect(marbleLoggerService.error).not.toHaveBeenCalled();
      expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
    });

    it("returns null and logs on fetch failure", async () => {
      // Arrange
      (globalThis as any).fetch.mockRejectedValueOnce(new Error("network"));

      // Act
      const result = await service.getRemoteJson("https://x/y", { eventId: 3 }, 1, 0);

      // Assert
      expect(result).toBeNull();
      expect(marbleLoggerService.error).toHaveBeenCalled();
    });
  });
});
