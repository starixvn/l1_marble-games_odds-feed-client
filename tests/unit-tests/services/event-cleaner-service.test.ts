import { EventCleanerServiceImpl } from "@/services";
import { oddsFeedEventName } from "@/interfaces";
import { idHelper } from "@/utils";

describe("EventCleanerService", () => {
    describe("initEvent", () => {
        it("registers EventStart listener", () => {
            // Arrange
            const oddsFeedEventSource = {
                registerEventListener: jest.fn(),
                unregisterEventListener: jest.fn(),
                onDataCleanup: jest.fn(),
            } as any;
            const service = new EventCleanerServiceImpl({ oddsFeedEventSource });

            // Act
            service.initEvent();

            // Assert
            expect(oddsFeedEventSource.registerEventListener).toHaveBeenCalledWith(
                oddsFeedEventName.EventStart,
                expect.any(Function)
            );
        });
    });

    describe("dispose", () => {
        it("unregisters EventStart listener", () => {
            // Arrange
            const oddsFeedEventSource = {
                registerEventListener: jest.fn(),
                unregisterEventListener: jest.fn(),
                onDataCleanup: jest.fn(),
            } as any;
            const service = new EventCleanerServiceImpl({ oddsFeedEventSource });
            service.initEvent();
            const registered = (oddsFeedEventSource.registerEventListener as jest.Mock).mock.calls[0][1];

            // Act
            service.dispose();

            // Assert
            expect(oddsFeedEventSource.unregisterEventListener).toHaveBeenCalledWith(
                oddsFeedEventName.EventStart,
                registered
            );
        });
    });

    describe("handleEventStart", () => {
        it("enqueues events and triggers cleanup when exceeding max length", () => {
            // Arrange
            const oddsFeedEventSource = {
                registerEventListener: jest.fn(),
                unregisterEventListener: jest.fn(),
                onDataCleanup: jest.fn(),
            } as any;
            const service = new EventCleanerServiceImpl({ oddsFeedEventSource });
            const gameId = 1;
            const firstEventId = idHelper.createEventId(gameId, 0);

            // Act
            for (let i = 0; i < 51; i++) {
                const eventID = idHelper.createEventId(gameId, i);
                service.handleEventStart({ event: { eventID } as any });
            }

            // Assert
            expect(oddsFeedEventSource.onDataCleanup).toHaveBeenCalledWith(firstEventId);
        });
    });
});


