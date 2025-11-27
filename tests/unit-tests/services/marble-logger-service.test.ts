import { MarbleLoggerServiceImpl } from "@/services";
import { idHelper } from "@/utils";
import { Logger } from "@/interfaces";

describe("MarbleLoggerService", () => {
  const makeService = (overrides?: Partial<{ debug: boolean; containerDebug: boolean }>) => {
    const sentryConfig = {
      sentryUrl: "https://dsn.example/1",
      logIdentifier: "LOGGER",
      env: "test",
      debug: overrides?.debug,
    };
    const appConfigs: any = { sentry: sentryConfig, debug: overrides?.containerDebug };
    const mockLogService: Logger = {
      logError: jest.fn(),
      log: jest.fn(),
    };
    return {
      service: new MarbleLoggerServiceImpl({ appConfigs, logService: mockLogService }),
      mockLogService,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("init", () => {
    it("does nothing (no-op)", () => {
      // Arrange
      const { service } = makeService();

      // Act & Assert
      expect(() => service.init()).not.toThrow();
    });
  });

  describe("log", () => {
    it("calls developmentDebugLog when debug is enabled", () => {
      // Arrange
      const { service } = makeService({ debug: true });
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const annotation = { gameId: "123", eventId: idHelper.createEventId(123, 1) };

      // Act
      service.log("hello", annotation);

      // Assert
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("does not call logService for regular log messages", () => {
      // Arrange
      const { service, mockLogService } = makeService();
      const annotation = { gameId: "123", eventId: idHelper.createEventId(123, 1) };

      // Act
      service.log("hello", annotation);

      // Assert
      expect(mockLogService.log).not.toHaveBeenCalled();
      expect(mockLogService.logError).not.toHaveBeenCalled();
    });
  });

  describe("warning", () => {
    it("calls logService.log with gameId prefix when gameId provided", () => {
      // Arrange
      const { service, mockLogService } = makeService();
      const annotation = { gameId: "9" };

      // Act
      service.warning("be careful", annotation);

      // Assert
      expect(mockLogService.log).toHaveBeenCalledWith("9: be careful", "warning");
    });

    it("extracts gameId from eventId when gameId not provided", () => {
      // Arrange
      const { service, mockLogService } = makeService();
      const eventId = idHelper.createEventId(77, 42);

      // Act
      service.warning("be careful", { eventId });

      // Assert
      expect(mockLogService.log).toHaveBeenCalledWith(`${idHelper.extractGameId(eventId)}: be careful`, "warning");
    });

    it("uses gameId 0 when no annotation provided", () => {
      // Arrange
      const { service, mockLogService } = makeService();

      // Act
      service.warning("be careful");

      // Assert
      expect(mockLogService.log).toHaveBeenCalledWith("0: be careful", "warning");
    });
  });

  describe("error", () => {
    it("calls logService.logError with gameId prefix when gameId provided", () => {
      // Arrange
      const { service, mockLogService } = makeService();
      const err = new Error("boom");
      const annotation = { gameId: "123" };

      // Act
      service.error(err, annotation);

      // Assert
      expect(mockLogService.logError).toHaveBeenCalledWith("123: boom");
    });

    it("extracts gameId from eventId when gameId missing", () => {
      // Arrange
      const { service, mockLogService } = makeService();
      const eventId = idHelper.createEventId(77, 42);
      const err = new Error("boom");

      // Act
      service.error(err, { eventId });

      // Assert
      expect(mockLogService.logError).toHaveBeenCalledWith(`${idHelper.extractGameId(eventId)}: boom`);
    });

    it("uses gameId 0 when no annotation provided", () => {
      // Arrange
      const { service, mockLogService } = makeService();
      const err = new Error("boom");

      // Act
      service.error(err);

      // Assert
      expect(mockLogService.logError).toHaveBeenCalledWith("0: boom");
    });
  });

  describe("debug", () => {
    it("does nothing when debug disabled", () => {
      // Arrange
      const { service, mockLogService } = makeService({ debug: false });

      // Act
      service.debug("dbg-1");

      // Assert
      expect(mockLogService.log).not.toHaveBeenCalled();
    });

    it("calls logService.log when debug enabled via config", () => {
      // Arrange
      const { service, mockLogService } = makeService({ debug: true });

      // Act
      service.debug("dbg-2");

      // Assert
      expect(mockLogService.log).toHaveBeenCalledWith("0: dbg-2", "debug");
    });

    it("extracts gameId from eventId when provided", () => {
      // Arrange
      const { service, mockLogService } = makeService({ debug: true });
      const eventId = idHelper.createEventId(5, 7);

      // Act
      service.debug("dbg", { eventId });

      // Assert
      expect(mockLogService.log).toHaveBeenCalledWith(`${idHelper.extractGameId(eventId)}: dbg`, "debug");
    });

    it("uses provided gameId when available", () => {
      // Arrange
      const { service, mockLogService } = makeService({ debug: true });

      // Act
      service.debug("dbg", { gameId: "42" });

      // Assert
      expect(mockLogService.log).toHaveBeenCalledWith("42: dbg", "debug");
    });
  });
});
