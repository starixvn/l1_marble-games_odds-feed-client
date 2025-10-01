import { OddFeedStoreImpl } from "@/services";
import { idHelper } from "@/utils";

describe("OddFeedStore", () => {
    describe("initEvent/dispose", () => {
        it("registers and unregisters system cleanup listener", () => {
            // Arrange
            const oddFeedEventSource = {
                registerSystemDataCleanupEventListener: jest.fn(),
                unregisterSystemDataCleanupEventListener: jest.fn(),
            } as any;
            const store = new OddFeedStoreImpl({ oddFeedEventSource });

            // Act
            store.initEvent();
            store.dispose();

            // Assert
            expect(oddFeedEventSource.registerSystemDataCleanupEventListener).toHaveBeenCalled();
            expect(oddFeedEventSource.unregisterSystemDataCleanupEventListener).toHaveBeenCalled();
        });
    });

    describe("setEventByGameId/getEventByGameId", () => {
        it("stores and retrieves event", () => {
            // Arrange
            const oddFeedEventSource = {
                registerSystemDataCleanupEventListener: jest.fn(),
                unregisterSystemDataCleanupEventListener: jest.fn(),
            } as any;
            const store = new OddFeedStoreImpl({ oddFeedEventSource });
            const eventId = idHelper.createEventId(5, 2);
            const event = { eventID: eventId } as any;

            // Act
            store.setEventByGameId("5", eventId, event);
            const got = store.getEventByGameId("5", eventId);

            // Assert
            expect(got).toEqual(event);
        });

        it("returns undefined when game bucket does not exist", () => {
            // Arrange
            const oddFeedEventSource = {
                registerSystemDataCleanupEventListener: jest.fn(),
                unregisterSystemDataCleanupEventListener: jest.fn(),
            } as any;
            const store = new OddFeedStoreImpl({ oddFeedEventSource });
            const eventId = idHelper.createEventId(6, 1);

            // Act
            const got = store.getEventByGameId("6", eventId);

            // Assert
            expect(got).toBeUndefined();
        });
    });

    describe("cleanup and handleSystemDataCleanup", () => {
        it("deletes event by derived game id", () => {
            // Arrange
            const oddFeedEventSource = {
                registerSystemDataCleanupEventListener: jest.fn(),
                unregisterSystemDataCleanupEventListener: jest.fn(),
            } as any;
            const store = new OddFeedStoreImpl({ oddFeedEventSource });
            const eventId = idHelper.createEventId(7, 3);
            const event = { eventID: eventId } as any;
            store.setEventByGameId("7", eventId, event);

            // Act
            store.cleanup(eventId);
            const got = store.getEventByGameId("7", eventId);

            // Assert
            expect(got).toBeUndefined();
        });

        it("delegates cleanup via system notification", () => {
            // Arrange
            const oddFeedEventSource = {
                registerSystemDataCleanupEventListener: jest.fn(),
                unregisterSystemDataCleanupEventListener: jest.fn(),
            } as any;
            const store = new OddFeedStoreImpl({ oddFeedEventSource });
            const eventId = idHelper.createEventId(8, 4);
            const event = { eventID: eventId } as any;
            store.setEventByGameId("8", eventId, event);

            // Act
            store.handleSystemDataCleanup({ eventID: eventId });
            const got = store.getEventByGameId("8", eventId);

            // Assert
            expect(got).toBeUndefined();
        });

        it("no-op when cleanup called and game bucket does not exist", () => {
            // Arrange
            const oddFeedEventSource = {
                registerSystemDataCleanupEventListener: jest.fn(),
                unregisterSystemDataCleanupEventListener: jest.fn(),
            } as any;
            const store = new OddFeedStoreImpl({ oddFeedEventSource });
            const eventId = idHelper.createEventId(9, 9);

            // Act
            store.cleanup(eventId);
            const got = store.getEventByGameId("9", eventId);

            // Assert
            expect(got).toBeUndefined();
        });
    });
});


