import { ApiLogger, toBase64Filename } from "@/services/api-logger";
import type { AppConfigs } from "@/interfaces";
import fs from "node:fs/promises";

jest.mock("node:fs/promises", () => {
  const access = jest.fn();
  const mkdir = jest.fn();
  const writeFile = jest.fn();

  return {
    __esModule: true,
    default: { access, mkdir, writeFile },
  };
});

describe("ApiLogger", () => {
  const mockedFs = fs as unknown as {
    access: jest.Mock;
    mkdir: jest.Mock;
    writeFile: jest.Mock;
  };
  const baseAppConfigs = {
    oddsFeedAPI: {
      url: "",
      operatorId: "",
      password: "",
    },
    sentry: {
      sentryUrl: "",
      logIdentifier: "",
      env: "",
    },
  } as AppConfigs;

  beforeEach(() => {
    mockedFs.access.mockReset();
    mockedFs.mkdir.mockReset();
    mockedFs.writeFile.mockReset();
  });

  describe("logSchedule", () => {
    it("skips file operations when logApiToFile disabled", async () => {
      const logger = new ApiLogger({ appConfigs: baseAppConfigs, logApiToFile: false });

      await logger.logSchedule([{ eventID: 1 } as any]);

      expect(mockedFs.access).not.toHaveBeenCalled();
      expect(mockedFs.mkdir).not.toHaveBeenCalled();
      expect(mockedFs.writeFile).not.toHaveBeenCalled();
    });

    it("writes schedule data when enabled and directory exists", async () => {
      const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1700000000000);
      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);
      const logger = new ApiLogger({
        appConfigs: { ...baseAppConfigs, dataDir: "logs", logApiToFile: true } as any,
      });

      const events = [{ eventID: 1 } as any];
      await logger.logSchedule(events);

      expect(mockedFs.access).toHaveBeenCalledWith("logs/schedule");
      expect(mockedFs.mkdir).not.toHaveBeenCalled();
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        "logs/schedule/1700000000000.json",
        JSON.stringify(events, null, 2)
      );

      nowSpy.mockRestore();
    });
  });

  describe("logEventDetails", () => {
    it("creates directory when missing and writes event details", async () => {
      const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1700000001234);
      mockedFs.access.mockRejectedValue(new Error("not found"));
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);
      const logger = new ApiLogger({
        appConfigs: { ...baseAppConfigs, dataDir: "logs", logApiToFile: true } as any,
      });

      const event = { id: 10 } as any;
      await logger.logEventDetails({ event, eventId: 42 });

      expect(mockedFs.access).toHaveBeenCalledWith("logs/event_details/42");
      expect(mockedFs.mkdir).toHaveBeenCalledWith("logs/event_details/42", { recursive: true });
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        "logs/event_details/42/1700000001234.json",
        JSON.stringify(event, null, 2)
      );

      nowSpy.mockRestore();
    });
  });

  describe("logRemoteJson", () => {
    it("writes remote json with base64 filename", async () => {
      const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1700000010000);
      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);
      const logger = new ApiLogger({
        appConfigs: { ...baseAppConfigs, logApiToFile: true } as any,
      });

      const url = "https://example.com/foo?bar=baz";
      const data = { foo: "bar" };

      await logger.logRemoteJson({ url, data });

      const dir = `data/remote_json`;
      const filename = `${toBase64Filename(url)}`;

      expect(mockedFs.access).toHaveBeenCalledWith(dir);
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        `${dir}/${filename}`,
        JSON.stringify(data, null, 2)
      );

      nowSpy.mockRestore();
    });
  });
});

