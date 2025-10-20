import { OddsFeedPullService, OddsFeedScheduler, Logger, OddsFeedCron } from "@/interfaces";
import * as cron from "@/lib/cron";


interface OddsFeedCronContainer {
    logService: Logger;
    oddsFeedPullService: OddsFeedPullService;
    oddsFeedScheduler: OddsFeedScheduler;
}

export class OddsFeedCronImpl implements OddsFeedCron {

    constructor(container: OddsFeedCronContainer) {
        this.logService = container.logService;
        this.oddsFeedPullService = container.oddsFeedPullService;
        this.oddsFeedScheduler = container.oddsFeedScheduler;
    }

    private readonly logService: Logger;
    private readonly oddsFeedPullService: OddsFeedPullService;
    private readonly oddsFeedScheduler: OddsFeedScheduler;
    
    public async start() {
        this.schedule();
        this.scheduleNextEventsCron();
      }
    
    public scheduleNextEventsCron() {
        const cronExpression = "*/30 * * * * *";

        const job = new cron.CronJob(
            cronExpression,
            () => this.schedule().catch(this.logService.logError),
            () => {
            this.logService.logError("Cron job unexpectedly stopped because some other tasks halt it.");
            job.start();
            }
        );

        job.start();
    }
    
    public async schedule() {
        const upcomingEvents = await this.oddsFeedPullService.pullUpcoming();
        for (const upcomingEvent of upcomingEvents) {
            void this.scheduleEvent(upcomingEvent);
        }
    }

    public async scheduleEvent({ eventID }: { eventID: number }): Promise<void> {
        try {
            const eventWithDetails = await this.oddsFeedPullService.pullEventWithEventDetails(eventID);
            if (!eventWithDetails) {
                return;
            }
            this.oddsFeedScheduler.scheduleEvent(eventWithDetails);
        } catch (error) {
            this.logService.logError(`Failed to schedule event ${eventID}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}