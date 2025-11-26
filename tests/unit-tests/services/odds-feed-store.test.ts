import { OddsFeedStore } from "@/services/odds-feed-store";
import { SystemNotification } from "@/interfaces";

describe("oddsFeedStore", () => {
  const makeEvent = (eventID: number) => ({
    eventID,
    eventNameAKey: "A",
    eventNameBKey: "B",
    scheduleStartTs: new Date().toISOString(),
    productCode: "p",
    productTypeKey: "t",
    eventDetails: [],
  } as any);

  describe("getEvent", () => {
    it("returns undefined when event does not exist", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });

      // Act
      const result = store.getEvent(123);

      // Assert
      expect(result).toBeUndefined();
    });

    it("returns event when event exists", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });
      const event = makeEvent(123);
      store.setEvent(event);

      // Act
      const result = store.getEvent(123);

      // Assert
      expect(result).toEqual(event);
    });

    it("returns correct event when multiple events exist", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });
      const event1 = makeEvent(123);
      const event2 = makeEvent(456);
      store.setEvent(event1);
      store.setEvent(event2);

      // Act
      const result1 = store.getEvent(123);
      const result2 = store.getEvent(456);

      // Assert
      expect(result1).toEqual(event1);
      expect(result2).toEqual(event2);
    });
  });

  describe("setEvent", () => {
    it("stores event and makes it retrievable via getEvent", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });
      const event = makeEvent(123);

      // Act
      store.setEvent(event);

      // Assert
      const retrievedEvent = store.getEvent(123);
      expect(retrievedEvent).toEqual(event);
    });

    it("overwrites existing event when setting event with same eventID", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });
      const event1 = makeEvent(123);
      const event2 = { ...makeEvent(123), eventNameAKey: "Updated" };

      // Act
      store.setEvent(event1);
      store.setEvent(event2);

      // Assert
      const retrievedEvent = store.getEvent(123);
      expect(retrievedEvent).toEqual(event2);
      expect(retrievedEvent?.eventNameAKey).toBe("Updated");
    });

    it("stores multiple different events", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });
      const event1 = makeEvent(123);
      const event2 = makeEvent(456);
      const event3 = makeEvent(789);

      // Act
      store.setEvent(event1);
      store.setEvent(event2);
      store.setEvent(event3);

      // Assert
      expect(store.getEvent(123)).toEqual(event1);
      expect(store.getEvent(456)).toEqual(event2);
      expect(store.getEvent(789)).toEqual(event3);
    });
  });

  describe("removeEvent", () => {
    it("removes event and makes it unavailable via getEvent", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });
      const event = makeEvent(123);
      store.setEvent(event);

      // Act
      store.removeEvent(123);

      // Assert
      const result = store.getEvent(123);
      expect(result).toBeUndefined();
    });

    it("does not affect other events when removing one event", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });
      const event1 = makeEvent(123);
      const event2 = makeEvent(456);
      store.setEvent(event1);
      store.setEvent(event2);

      // Act
      store.removeEvent(123);

      // Assert
      expect(store.getEvent(123)).toBeUndefined();
      expect(store.getEvent(456)).toEqual(event2);
    });

    it("does not throw error when removing non-existing event", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });

      // Act & Assert
      expect(() => store.removeEvent(999)).not.toThrow();
      expect(store.getEvent(999)).toBeUndefined();
    });
  });

  describe("handleDataCleanup", () => {
    it("removes event with given eventID", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });
      const event = makeEvent(123);
      store.setEvent(event);
      const notification: SystemNotification = { eventID: 123 };

      // Act
      store.handleDataCleanup(notification);

      // Assert
      expect(store.getEvent(123)).toBeUndefined();
    });

    it("removes correct event when multiple events exist", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });
      const event1 = makeEvent(123);
      const event2 = makeEvent(456);
      store.setEvent(event1);
      store.setEvent(event2);
      const notification: SystemNotification = { eventID: 123 };

      // Act
      store.handleDataCleanup(notification);

      // Assert
      expect(store.getEvent(123)).toBeUndefined();
      expect(store.getEvent(456)).toEqual(event2);
    });

    it("does not throw error when handling cleanup for non-existing event", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });
      const notification: SystemNotification = { eventID: 999 };

      // Act & Assert
      expect(() => store.handleDataCleanup(notification)).not.toThrow();
      expect(store.getEvent(999)).toBeUndefined();
    });
  });

  describe("init", () => {
    it("calls cleanupOn on oddsFeedEventSource with bound handler", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });

      // Act
      store.init();

      // Assert
      expect(oddsFeedEventSource.cleanupOn).toHaveBeenCalledTimes(1);
      expect(oddsFeedEventSource.cleanupOn).toHaveBeenCalledWith(expect.any(Function));
    });

    it("bound handler removes event when called with notification", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });
      const event = makeEvent(123);
      store.setEvent(event);
      store.init();

      // Act
      const handler = oddsFeedEventSource.cleanupOn.mock.calls[0][0];
      handler({ eventID: 123 });

      // Assert
      expect(store.getEvent(123)).toBeUndefined();
    });
  });

  describe("dispose", () => {
    it("calls cleanupOff on oddsFeedEventSource with bound handler", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });
      store.init();
      const handler = oddsFeedEventSource.cleanupOn.mock.calls[0][0];

      // Act
      store.dispose();

      // Assert
      expect(oddsFeedEventSource.cleanupOff).toHaveBeenCalledTimes(1);
      expect(oddsFeedEventSource.cleanupOff).toHaveBeenCalledWith(handler);
    });

    it("uses same handler reference for cleanupOn and cleanupOff", () => {
      // Arrange
      const oddsFeedEventSource = { cleanupOn: jest.fn(), cleanupOff: jest.fn() } as any;
      const store = new OddsFeedStore({ oddsFeedEventSource });

      // Act
      store.init();
      const onHandler = oddsFeedEventSource.cleanupOn.mock.calls[0][0];
      store.dispose();
      const offHandler = oddsFeedEventSource.cleanupOff.mock.calls[0][0];

      // Assert
      expect(onHandler).toBe(offHandler);
    });
  });
});