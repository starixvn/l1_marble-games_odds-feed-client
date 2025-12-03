import { createContainer } from "awilix";
import { init, register } from "odds-feed-client/dependency-injection";
import { AwilixDIContainer } from "odds-feed-client/awilix";
import { OddsFeedCron } from "odds-feed-client";
import express, { Request, Response } from "express";
import { registerLogServices, initLogServices } from "./container-registry";

export function oddsFeedFilter(event: any) {
  return event.operatorGameId === "158";
}

const container = createContainer();
const diContainer = new AwilixDIContainer(container);

register(diContainer, {
  eventQueueMaxLength: 2,
  oddsFeedFilter,
  logApiToFile: true,
  shouldValidateOdds: false,
});
registerLogServices(diContainer);
init(diContainer, {
  startCurrentEvents: true
});
initLogServices(diContainer);

// Get the oddsFeedCron instance for API control
const oddsFeedCron = diContainer.resolve<OddsFeedCron & { stop(): void }>("oddsFeedCron");

// Set up Express API server
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Odds Feed Client API is running" });
});

// Start cron endpoint
app.post("/api/cron/start", async (req: Request, res: Response) => {
  try {
    await oddsFeedCron.start();
    res.json({ 
      success: true, 
      message: "Cron started successfully",
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to start cron",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Stop cron endpoint
app.post("/api/cron/stop", (_req: Request, res: Response) => {
  try {
    oddsFeedCron.stop();
    res.json({ 
      success: true, 
      message: "Cron stopped successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to stop cron",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get cron status endpoint
app.get("/api/cron/status", (_req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: "Cron status endpoint - check if cron is running by attempting start/stop",
    endpoints: {
      start: "POST /api/cron/start",
      stop: "POST /api/cron/stop"
    }
  });
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`\n=== Odds Feed Client API Server ===`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /health - Health check`);
  console.log(`  POST /api/cron/start - Start the cron (body: { "startCurrentEvents": true/false })`);
  console.log(`  POST /api/cron/stop - Stop the cron`);
  console.log(`  GET  /api/cron/status - Get API information`);
  console.log(`\nExample usage:`);
  console.log(`  curl -X POST http://localhost:${PORT}/api/cron/start`);
  console.log(`  curl -X POST http://localhost:${PORT}/api/cron/stop`);
  console.log(`=====================================\n`);
});
