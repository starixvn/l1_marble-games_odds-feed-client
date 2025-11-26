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
    logApiToFile?: boolean;
}

export class ApiLogger {
    private readonly dataDir: string;
    private readonly logApiToFile: boolean;

    constructor(container: ApiLoggerContainer) {
        this.dataDir = (container.appConfigs as any).dataDir ?? DEFAULT_DATA_DIR;
        this.logApiToFile = 
            container.logApiToFile ?? 
            (container.appConfigs as any).logApiToFile 
            ?? false;
    }
 
    async logSchedule(events: Event[]): Promise<void> {
        if (!this.logApiToFile) {
            return;
        }
        try {
            await writeFileEnsurePathCreated(`${this.dataDir}/schedule/${Date.now()}.json`, JSON.stringify(events, null, 2));
        } catch (error) {
            console.error(`Failed to log schedule:`, error);
        }
    }

    async logEventDetails({ event, eventId }: { event: Event, eventId: number }): Promise<void> {
        if (!this.logApiToFile) {
            return;
        }
        try {
            await writeFileEnsurePathCreated(`${this.dataDir}/event_details/${eventId}/${Date.now()}.json`, JSON.stringify(event, null, 2));
        } catch (error) {
            console.error(`Failed to log event details for event ${eventId}:`, error);
        }
    }

    async logRemoteJson({ url, data }: { url: string, data: any }): Promise<void> {
        if (!this.logApiToFile) {
            return;
        }
        await writeFileEnsurePathCreated(`${this.dataDir}/remote_json/${toBase64Filename(url)}`, JSON.stringify(data, null, 2));
    }
}