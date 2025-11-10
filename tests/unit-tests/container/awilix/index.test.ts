import { AwilixDIContainer } from "@/container/awilix";

jest.mock("awilix", () => {
  const makeBuilder = () => ({
    singleton: jest.fn().mockReturnThis(),
    disposer: jest.fn().mockReturnThis(),
    inject: jest.fn().mockReturnThis(),
  });
  const asClass = jest.fn(() => makeBuilder());
  const asFunction = jest.fn((fn: any) => ({ __fn: fn }));
  const asValue = jest.fn((v: any) => ({ __val: v }));
  const aliasTo = jest.fn((k: string) => ({ __alias: k }));
  return {
    asClass,
    asFunction,
    asValue,
    aliasTo,
    InjectionMode: { CLASSIC: "CLASSIC", PROXY: "PROXY" },
  };
});

describe("AwilixDIContainer", () => {
  describe("register", () => {
    it("registers class, function, value, and alias", () => {
      // Arrange
      const register = jest.fn();
      const underlying = { register, options: { injectionMode: "PROXY" } } as any;
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
      const underlying = { register, options: { injectionMode: "PROXY" } } as any;
      const container = new AwilixDIContainer(underlying);
      class MyClass {}
      const disposer = jest.fn();

      // Act
      container.register({ registerType: "class", key: "svc", value: MyClass, disposer });

      // Assert
      expect(register).toHaveBeenCalled();
    });

    it("injects cradle into class in CLASSIC mode", () => {
      // Arrange
      const register = jest.fn();
      const underlying = { register, options: { injectionMode: "CLASSIC" } } as any;
      const container = new AwilixDIContainer(underlying);
      class MyClass {}

      const builder = {
        singleton: jest.fn().mockReturnThis(),
        disposer: jest.fn().mockReturnThis(),
        inject: jest.fn().mockReturnValue({ __wrapped: true }),
      } as any;

      const awilix = require("awilix");
      (awilix.asClass as jest.Mock).mockReturnValue(builder);

      // Act
      container.register({ registerType: "class", key: "svc", value: MyClass });

      // Assert
      expect(builder.inject).toHaveBeenCalledTimes(1);
      const arg = (register as jest.Mock).mock.calls[0][0];
      expect(arg.svc).toEqual({ __wrapped: true });
    });

    it("does not inject cradle in PROXY mode", () => {
      // Arrange
      const register = jest.fn();
      const underlying = { register, options: { injectionMode: "PROXY" } } as any;
      const container = new AwilixDIContainer(underlying);
      class MyClass {}

      const builder = {
        singleton: jest.fn().mockReturnThis(),
        disposer: jest.fn().mockReturnThis(),
        inject: jest.fn().mockReturnValue({ __wrapped: true }),
      } as any;

      const awilix = require("awilix");
      (awilix.asClass as jest.Mock).mockReturnValue(builder);

      // Act
      container.register({ registerType: "class", key: "svc", value: MyClass });

      // Assert
      expect(builder.inject).not.toHaveBeenCalled();
      const arg = (register as jest.Mock).mock.calls[0][0];
      expect(arg.svc).toBe(builder);
    });

    it("does not alter function and value registrations in any mode", () => {
      // Arrange
      const register = jest.fn();
      const underlying = { register, options: { injectionMode: "CLASSIC" } } as any;
      const container = new AwilixDIContainer(underlying);
      const fn = () => 1;

      const awilix = require("awilix");
      (awilix.asFunction as jest.Mock).mockReturnValue({ __fnToken: true });
      (awilix.asValue as jest.Mock).mockReturnValue({ __valToken: true });

      // Act
      container.register({ registerType: "function", key: "f", value: fn });
      container.register({ registerType: "value", key: "v", value: "123" as any });

      // Assert
      const first = (register as jest.Mock).mock.calls[0][0];
      const second = (register as jest.Mock).mock.calls[1][0];
      expect(first.f).toEqual({ __fnToken: true });
      expect(second.v).toEqual({ __valToken: true });
    });

    it("uses default registerType 'class' and default key when omitted", () => {
      // Arrange
      const register = jest.fn();
      const underlying = { register, options: { injectionMode: "PROXY" } } as any;
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
