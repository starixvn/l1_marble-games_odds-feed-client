import { log } from "@/utils";

describe("log", () => {
  describe("log", () => {
    it("is no-op outside development", () => {
      // Arrange
      const spy = jest.spyOn(console, "log").mockImplementation(() => {});

      // Act
      log("hello");

      // Assert
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("logs in development mode", () => {
      // Arrange
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      jest.isolateModules(() => {
        const spy = jest.spyOn(console, "log").mockImplementation(() => {});

        // Act
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require("@/utils/log");
        mod.log("dev");

        // Assert
        expect(spy).toHaveBeenCalledWith("dev");
        spy.mockRestore();
      });
      process.env.NODE_ENV = original;
    });
  });
});
