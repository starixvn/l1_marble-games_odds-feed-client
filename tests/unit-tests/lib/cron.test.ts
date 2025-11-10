describe("lib/cron export", () => {
  describe("CronJob re-export", () => {
    it("re-exports CronJob from cron package", () => {
      // Arrange
      // Act
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require("@/lib/cron");

      // Assert
      expect(typeof mod.CronJob).toBe("function");
    });
  });
});
