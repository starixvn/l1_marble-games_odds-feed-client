import { Event } from "@/domain";
import fs from "node:fs/promises";
import path from "node:path";
import { AppConfigs } from "../interfaces";

export function toBase64Filename(input: string) {
    return Buffer.from(input)
        .toString("base64")
        .replaceAll("+", "-")   // URL-safe
        .replaceAll("/", "_")   // URL-safe
        .replace(/=+$/, "");   // remove trailing '='
}

const DEFAULT_DATA_DIR = "data";

async function writeFileEnsurePathCreated(filePath: string, content: string) {
    const dirPath = path.dirname(filePath);
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
    await fs.writeFile(filePath, content);
}

interface ApiLoggerContainer {
    appConfigs: AppConfigs;
}

export class ApiLogger {
    private readonly dataDir: string;
    private readonly writeToFile: boolean;

    constructor(container: ApiLoggerContainer) {
        this.dataDir = (container.appConfigs as any).dataDir ?? DEFAULT_DATA_DIR;
        this.writeToFile = (container.appConfigs as any).writeToFile ?? false;
    }
 
    async logSchedule(events: Event[]): Promise<void> {
        if (!this.writeToFile) {
            return;
        }
        await writeFileEnsurePathCreated(`${this.dataDir}/schedule/${Date.now()}.json`, JSON.stringify(events, null, 2));
    }

    async logEventDetails({ event, eventId }: { event: Event, eventId: number }): Promise<void> {
        if (!this.writeToFile) {
            return;
        }
        await writeFileEnsurePathCreated(`${this.dataDir}/event_details/${eventId}_${Date.now()}.json`, JSON.stringify(event, null, 2));
    }

    async logRemoteJson({ url, data }: { url: string, data: any }): Promise<void> {
        if (!this.writeToFile) {
            return;
        }
        await writeFileEnsurePathCreated(`${this.dataDir}/remote_json/${toBase64Filename(url)}}.json`, JSON.stringify(data, null, 2));
    }
}