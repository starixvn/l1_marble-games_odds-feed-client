import { OddsFeedEventSourceImpl as oddsFeedEventSourceImpl } from "@/services";
import { OddsFeedEventName as oddsFeedEventName, SystemEventName } from "@/interfaces";

describe("oddsFeedEventSource", () => {
    describe("on", () => {
        it("registers wildcard listener that gets called on emit", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const wildcard = jest.fn();
            src.on(wildcard);
            const event = { eventID: 1 } as any;

            // Act
            src.emitEventStart(event);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(oddsFeedEventName.EventStart, { event });
        });
    });

    describe("off", () => {
        it("unregister wildcard listener so it no longer receives events", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const wildcard = jest.fn();
            src.on(wildcard);
            src.off(wildcard);

            // Act
            src.emitEventStart({ eventID: 1 } as any);

            // Assert
            expect(wildcard).not.toHaveBeenCalled();
        });
    });

    describe("eventOn", () => {
        it("registers specific listener that gets called on event", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const specific = jest.fn();
            src.eventOn(oddsFeedEventName.EventStart, specific);
            const event = { eventID: 2 } as any;

            // Act
            src.emitEventStart(event);

            // Assert
            expect(specific).toHaveBeenCalledWith({ event });
        });
    });

    describe("eventOff", () => {
        it("unregister specific listener so it no longer receives events", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const specific = jest.fn();
            src.eventOn(oddsFeedEventName.EventStart, specific);
            src.eventOff(oddsFeedEventName.EventStart, specific);

            // Act
            src.emitEventStart({ eventID: 3 } as any);

            // Assert
            expect(specific).not.toHaveBeenCalled();
        });
    });

    describe("eventDetailOn", () => {
        it("registers detail listener for EventDetailStart", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const listener = jest.fn();
            src.eventDetailOn(oddsFeedEventName.EventDetailStart, listener);
            const event = { eventID: 4 } as any;

            // Act
            src.emitEventDetailStart(event, 0);

            // Assert
            expect(listener).toHaveBeenCalledWith({ event, index: 0 });
        });
    });

    describe("eventDetailOff", () => {
        it("unregister detail listener for EventDetailStart", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const listener = jest.fn();
            src.eventDetailOn(oddsFeedEventName.EventDetailStart, listener);
            src.eventDetailOff(oddsFeedEventName.EventDetailStart, listener);

            // Act
            src.emitEventDetailStart({ eventID: 5 } as any, 1);

            // Assert
            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe("cleanupOn", () => {
        it("registers system cleanup listener that gets called on cleanup", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const system = jest.fn();
            src.cleanupOn(system);

            // Act
            src.emitDataCleanup(10);

            // Assert
            expect(system).toHaveBeenCalledWith({ eventID: 10 });
        });
    });

    describe("cleanupOff", () => {
        it("unregister system cleanup listener", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const system = jest.fn();
            src.cleanupOn(system);
            src.cleanupOff(system);

            // Act
            src.emitDataCleanup(11);

            // Assert
            expect(system).not.toHaveBeenCalled();
        });
    });

    describe("emitEventStart", () => {
        it("emits wildcard and specific", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const wildcard = jest.fn();
            const specific = jest.fn();
            const event = { eventID: 6 } as any;
            src.on(wildcard);
            src.eventOn(oddsFeedEventName.EventStart, specific);

            // Act
            src.emitEventStart(event);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(oddsFeedEventName.EventStart, { event });
            expect(specific).toHaveBeenCalledWith({ event });
        });
    });

    describe("emitDataCleanup", () => {
        it("emits wildcard and system cleanup", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const wildcard = jest.fn();
            const system = jest.fn();
            src.on(wildcard);
            src.cleanupOn(system);

            // Act
            src.emitDataCleanup(12);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(SystemEventName.DataCleanup, { eventID: 12 });
            expect(system).toHaveBeenCalledWith({ eventID: 12 });
        });
    });

    describe("emitEventUpcoming", () => {
        it("emits wildcard and specific", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const wildcard = jest.fn();
            const specific = jest.fn();
            const event = { eventID: 7 } as any;
            src.on(wildcard);
            src.eventOn(oddsFeedEventName.EventUpcoming, specific);

            // Act
            src.emitEventUpcoming(event);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(oddsFeedEventName.EventUpcoming, { event });
            expect(specific).toHaveBeenCalledWith({ event });
        });
    });

    describe("emitEventDetailUpcoming", () => {
        it("emits wildcard and specific", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const wildcard = jest.fn();
            const specific = jest.fn();
            const event = { eventID: 71 } as any;
            src.on(wildcard);
            src.eventDetailOn(oddsFeedEventName.EventDetailUpComing, specific);

            // Act
            src.emitEventDetailUpcoming(event, 3);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(oddsFeedEventName.EventDetailUpComing, { event, index: 3 });
            expect(specific).toHaveBeenCalledWith({ event, index: 3 });
        });
    });

    describe("emitEventDetailStart", () => {
        it("emits wildcard and specific", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const wildcard = jest.fn();
            const specific = jest.fn();
            const event = { eventID: 8 } as any;
            src.on(wildcard);
            src.eventDetailOn(oddsFeedEventName.EventDetailStart, specific);

            // Act
            src.emitEventDetailStart(event, 0);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(oddsFeedEventName.EventDetailStart, { event, index: 0 });
            expect(specific).toHaveBeenCalledWith({ event, index: 0 });
        });
    });

    describe("emitEventDetailOddsAvailable", () => {
        it("emits wildcard and specific", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const wildcard = jest.fn();
            const specific = jest.fn();
            const event = { eventID: 9 } as any;
            src.on(wildcard);
            src.eventDetailOn(oddsFeedEventName.EventDetailOddsAvailable, specific);

            // Act
            src.emitEventDetailOddsAvailable(event, 1);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(oddsFeedEventName.EventDetailOddsAvailable, { event, index: 1 });
            expect(specific).toHaveBeenCalledWith({ event, index: 1 });
        });
    });

    describe("emitEventDetailResultsAvailable", () => {
        it("emits wildcard and specific", () => {
            // Arrange
            const src = new oddsFeedEventSourceImpl();
            const wildcard = jest.fn();
            const specific = jest.fn();
            const event = { eventID: 10 } as any;
            src.on(wildcard);
            src.eventDetailOn(oddsFeedEventName.EventDetailResultsAvailable, specific);

            // Act
            src.emitEventDetailResultsAvailable(event, 2);

            // Assert
            expect(wildcard).toHaveBeenCalledWith(oddsFeedEventName.EventDetailResultsAvailable, { event, index: 2 });
            expect(specific).toHaveBeenCalledWith({ event, index: 2 });
        });
    });
});


