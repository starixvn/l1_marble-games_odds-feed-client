import { EventCleanerServiceImpl } from "@/services";
import { OddFeedEventName } from "@/interfaces";
import { idHelper } from "@/utils";

describe("EventCleanerService", () => {
    describe("initEvent", () => {
        it("registers EventStart listener", () => {
            // Arrange
            const oddFeedEventSource = {
                registerEventListener: jest.fn(),
                unregisterEventListener: jest.fn(),
                onDataCleanup: jest.fn(),
            } as any;
            const service = new EventCleanerServiceImpl({ oddFeedEventSource });

            // Act
            service.initEvent();

            // Assert
            expect(oddFeedEventSource.registerEventListener).toHaveBeenCalledWith(
                OddFeedEventName.EventStart,
                expect.any(Function)
            );
        });
    });

    describe("dispose", () => {
        it("unregisters EventStart listener", () => {
            // Arrange
            const oddFeedEventSource = {
                registerEventListener: jest.fn(),
                unregisterEventListener: jest.fn(),
                onDataCleanup: jest.fn(),
            } as any;
            const service = new EventCleanerServiceImpl({ oddFeedEventSource });
            service.initEvent();
            const registered = (oddFeedEventSource.registerEventListener as jest.Mock).mock.calls[0][1];

            // Act
            service.dispose();

            // Assert
            expect(oddFeedEventSource.unregisterEventListener).toHaveBeenCalledWith(
                OddFeedEventName.EventStart,
                registered
            );
        });
    });

    describe("handleEventStart", () => {
        it("enqueues events and triggers cleanup when exceeding max length", () => {
            // Arrange
            const oddFeedEventSource = {
                registerEventListener: jest.fn(),
                unregisterEventListener: jest.fn(),
                onDataCleanup: jest.fn(),
            } as any;
            const service = new EventCleanerServiceImpl({ oddFeedEventSource });
            const gameId = 1;
            const firstEventId = idHelper.createEventId(gameId, 0);

            // Act
            for (let i = 0; i < 51; i++) {
                const eventID = idHelper.createEventId(gameId, i);
                service.handleEventStart({ event: { eventID } as any });
            }

            // Assert
            expect(oddFeedEventSource.onDataCleanup).toHaveBeenCalledWith(firstEventId);
        });
    });
});


