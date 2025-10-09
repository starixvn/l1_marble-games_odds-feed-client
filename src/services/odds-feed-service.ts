import { Event } from "@/domain";
import { retry } from "@/utils";
import { 
    AppConfigs, 
    Logger, 
    OddsFeedService,
    MarbleLoggerService
} from "@/interfaces";

interface OddsFeedServiceContainer {
  logService: Logger;
  appConfigs: AppConfigs;
  marbleLoggerService: MarbleLoggerService;

}

export class OddsFeedServiceImpl implements OddsFeedService {
  private readonly logService: Logger;
  private readonly appConfigs: AppConfigs;
  private readonly marbleLoggerService: MarbleLoggerService;
  private token = "";

  constructor(container: OddsFeedServiceContainer) {
    this.logService = container.logService;
    this.appConfigs = container.appConfigs;
    this.marbleLoggerService = container.marbleLoggerService;
  }
  
  async fetchSchedule(retries = 3, delay = 1000, { eventId }: { eventId?: number } = {}): Promise<Event[]> {
    try {
      return await retry(() => this.getSchedule(), retries, delay);
    } catch (error) {
      this.marbleLoggerService.error(error as Error, { eventId });
      return [];
    }
  }

  async fetchEventDetails(
    eventId: number,
    validator: (event: Event) => boolean = () => true,
    retries = 3,
    delay = 1000
  ): Promise<Event | null> {
    try {
      return await retry(() => this.getEventDetails(eventId, validator), retries, delay);
    } catch (error) {
      this.marbleLoggerService.error(error as Error, { eventId });
      return null;
    }
  }
  
  async getRemoteJson<T>(url: string, annotation: { eventId?: number }, retries = 3, delay = 1000): Promise<T | null> {
    try {
      const response = await retry(() => fetch(url), retries, delay);
      return (await response.json()) as T;
    } catch (error) {
      this.marbleLoggerService.error(error as Error, annotation);
      return null;
    }
  }

  private async getAndUpdateOddsFeedToken() {
    const response = await fetch(`${this.appConfigs.oddsFeedAPI.url}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operatorId: this.appConfigs.oddsFeedAPI.operatorId,
        password: this.appConfigs.oddsFeedAPI.password,
      }),
    });

    const data = await response.json();
    this.token = data.access_token;
    return this.token;
  }

  private async getSchedule(): Promise<Event[]> {
    const token = this.token || (await this.getAndUpdateOddsFeedToken());
    const response = await fetch(`${this.appConfigs.oddsFeedAPI.url}/api/schedule`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await this.getAndUpdateOddsFeedToken();
      throw new Error("Unauthorized! Invalid token, attempt retry...");
    }

    if (response.status !== 200) {
      throw new Error(`Failed to get schedule: ${response.status}`);
    }

    return response.json();
  }

  private async getEventDetails(eventId: number, validator: (event: Event) => boolean): Promise<Event | null> {
    const token = this.token || (await this.getAndUpdateOddsFeedToken());

    const response = await fetch(`${this.appConfigs.oddsFeedAPI.url}/api/events?eventID=${eventId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      await this.getAndUpdateOddsFeedToken();
      throw new Error("Unauthorized! Invalid token, attempt retry...");
    }

    if (response.status !== 200) {
      throw new Error(`Failed to get event details: ${response.status}`);
    }

    const data = await response.json();

    if (!validator(data)) {
      this.logService.logError(`Error missing data for event ${eventId}, attempt retry...`);
      throw new Error(`Invalid event details: ${eventId}`);
    }

    return data;
  }
}
