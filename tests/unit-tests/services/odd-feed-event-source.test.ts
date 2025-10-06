import { OddFeedEventSourceImpl } from "@/services";
import { OddFeedEventName, SystemEventName } from "@/interfaces";

describe("OddFeedEventSource", () => {
    describe("registerWildcardEventListener", () => {
        it("registers wildcard listener that gets called on emit", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const wildcard = jest.fn();
            src.registerWildcardEventListener(wildcard);
            const event = { eventID: 1 } as any;

            // Act
            src.onEventStart(event);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(OddFeedEventName.EventStart, { event });
        });
    });

    describe("unregisterWildcardEventListener", () => {
        it("unregisters wildcard listener so it no longer receives events", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const wildcard = jest.fn();
            src.registerWildcardEventListener(wildcard);
            src.unregisterWildcardEventListener(wildcard);

            // Act
            src.onEventStart({ eventID: 1 } as any);

            // Assert
            expect(wildcard).not.toHaveBeenCalled();
        });
    });

    describe("registerEventListener", () => {
        it("registers specific listener that gets called on event", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const specific = jest.fn();
            src.registerEventListener(OddFeedEventName.EventStart, specific);
            const event = { eventID: 2 } as any;

            // Act
            src.onEventStart(event);

            // Assert
            expect(specific).toHaveBeenCalledWith({ event });
        });
    });

    describe("unregisterEventListener", () => {
        it("unregisters specific listener so it no longer receives events", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const specific = jest.fn();
            src.registerEventListener(OddFeedEventName.EventStart, specific);
            src.unregisterEventListener(OddFeedEventName.EventStart, specific);

            // Act
            src.onEventStart({ eventID: 3 } as any);

            // Assert
            expect(specific).not.toHaveBeenCalled();
        });
    });

    describe("registerEventDetailEventListener", () => {
        it("registers detail listener for EventDetailStart", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const listener = jest.fn();
            src.registerEventDetailEventListener(OddFeedEventName.EventDetailStart, listener);
            const event = { eventID: 4 } as any;

            // Act
            src.onEventDetailStart(event, 0);

            // Assert
            expect(listener).toHaveBeenCalledWith({ event, index: 0 });
        });
    });

    describe("unregisterEventDetailEventListener", () => {
        it("unregisters detail listener for EventDetailStart", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const listener = jest.fn();
            src.registerEventDetailEventListener(OddFeedEventName.EventDetailStart, listener);
            src.unregisterEventDetailEventListener(OddFeedEventName.EventDetailStart, listener);

            // Act
            src.onEventDetailStart({ eventID: 5 } as any, 1);

            // Assert
            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe("registerSystemDataCleanupEventListener", () => {
        it("registers system cleanup listener that gets called on cleanup", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const system = jest.fn();
            src.registerSystemDataCleanupEventListener(system);

            // Act
            src.onDataCleanup(10);

            // Assert
            expect(system).toHaveBeenCalledWith({ eventID: 10 });
        });
    });

    describe("unregisterSystemDataCleanupEventListener", () => {
        it("unregisters system cleanup listener", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const system = jest.fn();
            src.registerSystemDataCleanupEventListener(system);
            src.unregisterSystemDataCleanupEventListener(system);

            // Act
            src.onDataCleanup(11);

            // Assert
            expect(system).not.toHaveBeenCalled();
        });
    });

    describe("onEventStart", () => {
        it("emits wildcard and specific", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const wildcard = jest.fn();
            const specific = jest.fn();
            const event = { eventID: 6 } as any;
            src.registerWildcardEventListener(wildcard);
            src.registerEventListener(OddFeedEventName.EventStart, specific);

            // Act
            src.onEventStart(event);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(OddFeedEventName.EventStart, { event });
            expect(specific).toHaveBeenCalledWith({ event });
        });
    });

    describe("onDataCleanup", () => {
        it("emits wildcard and system cleanup", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const wildcard = jest.fn();
            const system = jest.fn();
            src.registerWildcardEventListener(wildcard);
            src.registerSystemDataCleanupEventListener(system);

            // Act
            src.onDataCleanup(12);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(SystemEventName.DataCleanup, { eventID: 12 });
            expect(system).toHaveBeenCalledWith({ eventID: 12 });
        });
    });

    describe("onEventUpcoming", () => {
        it("emits wildcard and specific", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const wildcard = jest.fn();
            const specific = jest.fn();
            const event = { eventID: 7 } as any;
            src.registerWildcardEventListener(wildcard);
            src.registerEventListener(OddFeedEventName.EventUpcoming, specific);

            // Act
            src.onEventUpcoming(event);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(OddFeedEventName.EventUpcoming, { event });
            expect(specific).toHaveBeenCalledWith({ event });
        });
    });

    describe("onEventDetailUpComing", () => {
        it("emits wildcard and specific", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const wildcard = jest.fn();
            const specific = jest.fn();
            const event = { eventID: 71 } as any;
            src.registerWildcardEventListener(wildcard);
            src.registerEventDetailEventListener(OddFeedEventName.EventDetailUpComing, specific);

            // Act
            src.onEventDetailUpComing(event, 3);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(OddFeedEventName.EventDetailUpComing, { event, index: 3 });
            expect(specific).toHaveBeenCalledWith({ event, index: 3 });
        });
    });

    describe("onEventDetailStart", () => {
        it("emits wildcard and specific", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const wildcard = jest.fn();
            const specific = jest.fn();
            const event = { eventID: 8 } as any;
            src.registerWildcardEventListener(wildcard);
            src.registerEventDetailEventListener(OddFeedEventName.EventDetailStart, specific);

            // Act
            src.onEventDetailStart(event, 0);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(OddFeedEventName.EventDetailStart, { event, index: 0 });
            expect(specific).toHaveBeenCalledWith({ event, index: 0 });
        });
    });

    describe("onEventDetailOddsAvailable", () => {
        it("emits wildcard and specific", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const wildcard = jest.fn();
            const specific = jest.fn();
            const event = { eventID: 9 } as any;
            src.registerWildcardEventListener(wildcard);
            src.registerEventDetailEventListener(OddFeedEventName.EventDetailOddsAvailable, specific);

            // Act
            src.onEventDetailOddsAvailable(event, 1);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(OddFeedEventName.EventDetailOddsAvailable, { event, index: 1 });
            expect(specific).toHaveBeenCalledWith({ event, index: 1 });
        });
    });

    describe("onEventDetailResultsAvailable", () => {
        it("emits wildcard and specific", () => {
            // Arrange
            const src = new OddFeedEventSourceImpl();
            const wildcard = jest.fn();
            const specific = jest.fn();
            const event = { eventID: 10 } as any;
            src.registerWildcardEventListener(wildcard);
            src.registerEventDetailEventListener(OddFeedEventName.EventDetailResultsAvailable, specific);

            // Act
            src.onEventDetailResultsAvailable(event, 2);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(OddFeedEventName.EventDetailResultsAvailable, { event, index: 2 });
            expect(specific).toHaveBeenCalledWith({ event, index: 2 });
        });
    });
});


