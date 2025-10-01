import { register, init } from "@/dependency-injection";

describe("dependency-injection", () => {
    describe("register", () => {
        it("registers all services into container with appropriate options", () => {
            // Arrange
            const diContainer = { register: jest.fn() } as any;

            // Act
            register(diContainer);

            // Assert
            expect(diContainer.register).toHaveBeenCalled();
        });
    });

    describe("init", () => {
        it("resolves and initializes services", () => {
            // Arrange
            const oddFeedStore = { initEvent: jest.fn() };
            const eventCleanerService = { initEvent: jest.fn() };
            const oddFeedCron = { start: jest.fn() };
            const diContainer = {
                resolve: jest.fn((key: string) => {
                    if (key === "oddFeedStore") return oddFeedStore;
                    if (key === "eventCleanerService") return eventCleanerService;
                    if (key === "oddFeedCron") return oddFeedCron;
                    return undefined;
                }),
            } as any;

            // Act
            init(diContainer);

            // Assert
            expect(oddFeedStore.initEvent).toHaveBeenCalled();
            expect(eventCleanerService.initEvent).toHaveBeenCalled();
            expect(oddFeedCron.start).toHaveBeenCalled();
        });
    });
});


