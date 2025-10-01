import { AwilixDIContainer } from "@/container/awilix";

describe("AwilixDIContainer", () => {
    describe("register", () => {
        it("registers class, function, value, and alias", () => {
            // Arrange
            const register = jest.fn();
            const underlying = { register } as any;
            const container = new AwilixDIContainer(underlying);
            class MyClass {}
            const myFn = () => 1;

            // Act
            container.register({ registerType: "class", key: "myClass", value: MyClass });
            container.register({ registerType: "function", key: "myFn", value: myFn });
            container.register({ registerType: "value", key: "myVal", value: "123" });
            container.register({ registerType: "alias", key: "aliasKey", value: "myClass" });

            // Assert
            expect(register).toHaveBeenCalledTimes(4);
        });

        it("passes disposer for class registration", () => {
            // Arrange
            const register = jest.fn();
            const underlying = { register } as any;
            const container = new AwilixDIContainer(underlying);
            class MyClass {}
            const disposer = jest.fn();

            // Act
            container.register({ registerType: "class", key: "svc", value: MyClass, disposer });

            // Assert
            expect(register).toHaveBeenCalled();
        });

        it("uses default registerType 'class' and default key when omitted", () => {
            // Arrange
            const register = jest.fn();
            const underlying = { register } as any;
            const container = new AwilixDIContainer(underlying);
            class MyDefault {}

            // Act
            container.register({ value: MyDefault } as any);

            // Assert
            expect(register).toHaveBeenCalledTimes(1);
            const arg = (register as jest.Mock).mock.calls[0][0];
            expect(Object.keys(arg)).toContain("default");
        });
    });

    describe("resolve", () => {
        it("resolves using underlying container", () => {
            // Arrange
            const value = { a: 1 };
            const resolve = jest.fn().mockReturnValue(value);
            const underlying = { resolve } as any;
            const container = new AwilixDIContainer(underlying);

            // Act
            const got = container.resolve("x");

            // Assert
            expect(got).toBe(value);
            expect(resolve).toHaveBeenCalledWith("x");
        });
    });
});


