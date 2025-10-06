import { MarbleLoggerServiceImpl } from "@/services";
import { idHelper } from "@/utils";
import * as Sentry from "@sentry/node";

jest.mock("@sentry/node", () => ({
    init: jest.fn(),
    setTag: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
}));

describe("MarbleLoggerService", () => {
    const makeService = (overrides?: Partial<{ debug: boolean }>) => {
        const appConfigs = {
            sentry: {
                sentryUrl: "https://dsn.example/1",
                logIdentifier: "LOGGER",
                env: "test",
                debug: overrides?.debug,
            },
        };
        return new MarbleLoggerServiceImpl({ appConfigs } as any);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });


    describe("init", () => {
        it("initializes Sentry with container config and defers debug param", () => {
            // Arrange
            const service = makeService({ debug: false });

            // Act
            service.init({ debug: true, tracesSampleRate: 0.5, sentryRelease: "rel-1" });

            // Assert
            expect((Sentry.init as jest.Mock).mock.calls[0][0]).toEqual({
                dsn: "https://dsn.example/1",
                environment: "test",
                debug: false,
                tracesSampleRate: 0.5,
                attachStacktrace: true,
                release: "rel-1",
            });
        });
    });

    describe("log", () => {
        it("logs message and sets tags using provided gameId", () => {
            // Arrange
            const service = makeService();
            const annotation = { gameId: "123", eventId: idHelper.createEventId(123, 1) };

            // Act
            service.log("hello", annotation);

            // Assert
            expect(Sentry.setTag).toHaveBeenNthCalledWith(1, "gameId", "123");
            expect(Sentry.setTag).toHaveBeenNthCalledWith(2, "logIdentifier", "[123][LOGGER]");
            expect(Sentry.captureMessage).toHaveBeenCalledWith("hello", "log");
        });
    });

    describe("warning", () => {
        it("warnings message and sets tags using provided gameId", () => {
            // Arrange
            const service = makeService();
            const annotation = { gameId: "9" };

            // Act
            service.warning("be careful", annotation);

            // Assert
            expect(Sentry.setTag).toHaveBeenNthCalledWith(1, "gameId", "9");
            expect(Sentry.setTag).toHaveBeenNthCalledWith(2, "logIdentifier", "[9][LOGGER]");
            expect(Sentry.captureMessage).toHaveBeenCalledWith("be careful", "warning");
        });
    });

    describe("error", () => {
        it("captures exception and sets tags derived from eventId when gameId missing", () => {
            // Arrange
            const service = makeService();
            const eventId = idHelper.createEventId(77, 42);
            const err = new Error("boom");

            // Act
            service.error(err, { eventId });

            // Assert
            expect(Sentry.setTag).toHaveBeenNthCalledWith(1, "gameId", idHelper.extractGameId(eventId));
            expect(Sentry.setTag).toHaveBeenNthCalledWith(2, "logIdentifier", "[77][LOGGER]");
            expect(Sentry.captureException).toHaveBeenCalledWith(err);
        });
    });

    describe("debug", () => {
        it("does nothing when debug disabled, logs when enabled via init", () => {
            // Arrange
            const service = makeService({ debug: false });

            // Act
            service.debug("dbg-1");
            service.init({ debug: true });
            service.debug("dbg-2");

            // Assert
            expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
            expect(Sentry.captureMessage).toHaveBeenCalledWith("dbg-2", "debug");
            expect(Sentry.setTag).toHaveBeenNthCalledWith(1, "gameId", "0");
            expect(Sentry.setTag).toHaveBeenNthCalledWith(2, "logIdentifier", "[0][LOGGER]");
        });

        it("sets tags from eventId when provided", () => {
            // Arrange
            const service = makeService({ debug: true });
            const eventId = idHelper.createEventId(5, 7);

            // Act
            service.debug("dbg", { eventId });

            // Assert
            expect(Sentry.setTag).toHaveBeenNthCalledWith(1, "gameId", idHelper.extractGameId(eventId));
            expect(Sentry.setTag).toHaveBeenNthCalledWith(2, "logIdentifier", "[5][LOGGER]");
            expect(Sentry.captureMessage).toHaveBeenCalledWith("dbg", "debug");
        });
    });
});


