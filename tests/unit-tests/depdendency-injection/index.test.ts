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

        it("registers oddFeedFilter default as a predicate returning true", () => {
            // Arrange
            const diContainer = { register: jest.fn() } as any;

            // Act
            register(diContainer);

            // Assert
            const calls = (diContainer.register as jest.Mock).mock.calls as Array<[any]>;
            const filterReg = calls.map(c => c[0]).find(arg => arg && arg.key === "oddFeedFilter");
            expect(filterReg).toBeDefined();
            expect(filterReg.registerType).toBe("value");
            expect(typeof filterReg.value).toBe("function");
            // default should include everything
            const result = filterReg.value({ eventID: 1 }, 0, []);
            expect(result).toBe(true);
        });

        it("uses default oddFeedFilter when options object is empty", () => {
            // Arrange
            const diContainer = { register: jest.fn() } as any;

            // Act
            register(diContainer, {} as any);

            // Assert
            const calls = (diContainer.register as jest.Mock).mock.calls as Array<[any]>;
            const filterReg = calls.map(c => c[0]).find(arg => arg && arg.key === "oddFeedFilter");
            expect(filterReg).toBeDefined();
            expect(filterReg.registerType).toBe("value");
            expect(typeof filterReg.value).toBe("function");
            expect(filterReg.value({ eventID: 123 }, 0, [])).toBe(true);
        });

        it("coerces boolean oddFeedFilter=true into a predicate that returns true", () => {
            // Arrange
            const diContainer = { register: jest.fn() } as any;

            // Act
            register(diContainer, { oddFeedFilter: true });

            // Assert
            const calls = (diContainer.register as jest.Mock).mock.calls as Array<[any]>;
            const filterReg = calls.map(c => c[0]).find(arg => arg && arg.key === "oddFeedFilter");
            expect(filterReg).toBeDefined();
            expect(filterReg.registerType).toBe("value");
            expect(typeof filterReg.value).toBe("function");
            expect(filterReg.value({ eventID: 999 }, 0, [])).toBe(true);
        });

        it("coerces boolean oddFeedFilter=false into a predicate that returns false", () => {
            // Arrange
            const diContainer = { register: jest.fn() } as any;

            // Act
            register(diContainer, { oddFeedFilter: false });

            // Assert
            const calls = (diContainer.register as jest.Mock).mock.calls as Array<[any]>|
                Array<any[]>; // tolerate ts typing
            const filterReg = (calls as Array<[any]>).map(c => c[0]).find(arg => arg && arg.key === "oddFeedFilter");
            expect(filterReg).toBeDefined();
            expect(filterReg.registerType).toBe("value");
            expect(typeof filterReg.value).toBe("function");
            const result = filterReg.value({ eventID: 1 }, 0, []);
            expect(result).toBe(false);
        });

        it("uses provided function oddFeedFilter as-is", () => {
            // Arrange
            const diContainer = { register: jest.fn() } as any;
            const predicate = (e: { eventID: number }) => e.eventID === 42;

            // Act
            register(diContainer, { oddFeedFilter: predicate as any });

            // Assert
            const calls = (diContainer.register as jest.Mock).mock.calls as Array<[any]>;
            const filterReg = calls.map(c => c[0]).find(arg => arg && arg.key === "oddFeedFilter");
            expect(filterReg).toBeDefined();
            expect(filterReg.registerType).toBe("value");
            expect(typeof filterReg.value).toBe("function");
            expect(filterReg.value({ eventID: 42 }, 0, [])).toBe(true);
            expect(filterReg.value({ eventID: 7 }, 0, [])).toBe(false);
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


