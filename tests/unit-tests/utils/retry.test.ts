import { retry } from "@/utils";

describe("retry", () => {
  describe("retry", () => {
    it("returns immediately on success and does not retry", async () => {
      // Arrange
      const fn = jest.fn().mockResolvedValue("ok");

      // Act
      const result = await retry(fn, 3, 0);

      // Assert
      expect(result).toBe("ok");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("retries on failure and succeeds before max retries", async () => {
      // Arrange
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail1"))
        .mockRejectedValueOnce(new Error("fail2"))
        .mockResolvedValueOnce("ok");

      // Act
      const result = await retry(fn, 3, 0);

      // Assert
      expect(result).toBe("ok");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("throws last error after exhausting retries", async () => {
      // Arrange
      const fn = jest.fn().mockRejectedValue(new Error("boom"));

      // Act
      await expect(retry(fn, 2, 0)).rejects.toThrow("boom");

      // Assert
    });

    it("uses default retries/delay and succeeds on third attempt", async () => {
      // Arrange
      jest.useFakeTimers();
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail1"))
        .mockRejectedValueOnce(new Error("fail2"))
        .mockResolvedValueOnce("ok");

      // Act
      const promise = retry(fn);
      await jest.runAllTimersAsync();
      const result = await promise;

      // Assert
      expect(result).toBe("ok");
      expect(fn).toHaveBeenCalledTimes(3);
      jest.useRealTimers();
    });
  });
});
