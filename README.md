# Odd Feed Client

Event-based odd feed client for Marble games. Provides a small set of services to pull schedules and event details, emit domain events, and manage an in-memory store. Ships with a simple dependency injection setup and an Awilix adapter.

## Project Overview

The **odd-feed-client** is a TypeScript library that acts as a bridge between external odds feed APIs and Marble game services. It periodically fetches event data, schedules event processing, and emits domain events for consumption by other services.

### Main Purpose

- **Data Ingestion**: Pulls event schedules and details from external odds feed APIs
- **Event Scheduling**: Schedules time-based events (event starts, odds availability, results)
- **Event Publishing**: Emits domain events for downstream services to consume
- **Data Management**: Maintains in-memory store of events keyed by gameId and eventId
- **Lifecycle Management**: Handles event cleanup and memory management

## Architecture Map

```mermaid
graph TB
    subgraph "External Systems"
        API[Odds Feed API]
    end

    subgraph "Core Services"
        OS[OddFeedService<br/>API Client]
        PS[OddFeedPullService<br/>Data Orchestrator]
        CR[OddFeedCron<br/>Scheduler]
        SC[OddFeedScheduler<br/>Event Scheduler]
        ST[OddFeedStore<br/>In-Memory Store]
        ES[OddFeedEventSource<br/>Event Emitter]
    end

    subgraph "Supporting Services"
        CL[EventCleanerService<br/>Memory Management]
        ML[MarbleLoggerService<br/>Logging & Monitoring]
        SCH[Scheduler<br/>Time-based Tasks]
    end

    subgraph "Consumers"
        EXT[External Services<br/>Event Listeners]
    end

    API --> OS
    OS --> PS
    CR --> PS
    PS --> ST
    PS --> SC
    SC --> ES
    SC --> SCH
    ES --> EXT
    CL --> ES
    ML --> OS
    ML --> PS
```

## Features & Services

### Core Services

| Service                | Purpose                  | Key Methods                                                      | Dependencies                                        |
| ---------------------- | ------------------------ | ---------------------------------------------------------------- | --------------------------------------------------- |
| **OddFeedService**     | API client for odds feed | `fetchSchedule()`, `fetchEventDetails()`, `getRemoteJson()`      | AppConfigs, Logger, MarbleLoggerService             |
| **OddFeedPullService** | Data orchestration       | `pullUpcoming()`, `pullEventWithEventDetails()`                  | OddFeedService, OddFeedStore, Logger, oddFeedFilter |
| **OddFeedCron**        | Periodic scheduling      | `start()`, `scheduleNextEventsCron()`                            | OddFeedPullService, OddFeedScheduler, Logger        |
| **OddFeedScheduler**   | Event timing             | `scheduleEvent()`, `scheduleEventUpcoming()`                     | OddFeedEventSource, Scheduler, OddFeedPullService   |
| **OddFeedStore**       | In-memory storage        | `setEventByGameId()`, `getEventByGameId()`, `cleanup()`          | OddFeedEventSource                                  |
| **OddFeedEventSource** | Event emission           | `onEventStart()`, `onEventUpcoming()`, `registerEventListener()` | None (EventEmitter)                                 |

### Supporting Services

| Service                 | Purpose                   | Key Methods                                | Dependencies       |
| ----------------------- | ------------------------- | ------------------------------------------ | ------------------ |
| **EventCleanerService** | Memory management         | `handleEventStart()`, `dispose()`          | OddFeedEventSource |
| **MarbleLoggerService** | Logging & monitoring      | `log()`, `error()`, `warning()`, `debug()` | AppConfigs         |
| **Scheduler**           | Time-based task execution | `schedule()`, `cancel()`, `dispose()`      | None               |

## Cron Flow

### Main Execution Flow

```mermaid
sequenceDiagram
    participant CR as OddFeedCron
    participant PS as OddFeedPullService
    participant OS as OddFeedService
    participant ST as OddFeedStore
    participant SC as OddFeedScheduler
    participant ES as OddFeedEventSource
    participant EXT as External Listeners

    Note over CR: Every 30 seconds
    CR->>PS: pullUpcoming()
    PS->>OS: fetchSchedule()
    OS-->>PS: Event[]
    PS->>ST: setEventByGameId()

    loop For each event
        PS->>OS: fetchEventDetails(eventId)
        OS-->>PS: Event with details
        PS->>ST: setEventByGameId()
        PS->>SC: scheduleEvent(event)

        SC->>ES: onEventUpcoming()
        ES->>EXT: EventUpcoming notification

        SC->>SC: scheduleEventStart()
        SC->>SC: scheduleEventDetailStart()
        SC->>SC: scheduleEventDetailOddsAvailable()
        SC->>SC: scheduleEventDetailResultsAvailable()
    end
```

### Event Lifecycle

```mermaid
sequenceDiagram
    participant SCH as Scheduler
    participant SC as OddFeedScheduler
    participant PS as OddFeedPullService
    participant ES as OddFeedEventSource
    participant CL as EventCleanerService
    participant ST as OddFeedStore

    Note over SCH: At scheduled time
    SCH->>SC: handleEventStart()
    SC->>PS: pullEventWithEventDetails()
    PS-->>SC: Updated Event
    SC->>ES: onEventStart()
    ES->>CL: EventStart notification
    CL->>ST: cleanup() if needed
    ES->>EXT: EventStart notification
```

## Technical Stack

### Dependencies

- **Runtime**: Node.js >= 18
- **Language**: TypeScript 5.9.3
- **DI Container**: Awilix 12.0.5
- **Cron**: cron 4.3.3
- **Monitoring**: @sentry/node 10.17.0
- **Testing**: Jest 30.2.0

### Key Libraries

- **EventEmitter**: Node.js built-in for event handling
- **Fetch API**: For HTTP requests to odds feed APIs
- **BigInt**: For event ID manipulation (gameId/roundId extraction)

## Component Guide

### Domain Models

#### Event (`src/domain/index.ts`)

```typescript
type Event = {
  eventID: number;
  eventNameAKey: string;
  eventNameBKey: string;
  theme?: string;
  scheduleStartTs: string;
  productCode: string;
  productTypeKey: string;
  eventDetails: EventDetail[];
  voiceConfig?: string;
};
```

#### EventDetail (`src/domain/index.ts`)

```typescript
type EventDetail = {
  eventID: number;
  oddsAvailableTs: string;
  scheduleStartTs: string;
  resultsAvailableTs: string;
  hasResults: boolean;
  goalInfo: string;
  playlist: string;
  result: string;
  markets: any;
  inGameEventInfo: string;
  phase: number;
};
```

### Service Details

#### OddFeedService (`src/services/odd-feed-service.ts`)

- **Authentication**: Handles OAuth token management
- **API Calls**: Makes HTTP requests to odds feed endpoints
- **Retry Logic**: Built-in retry mechanism with exponential backoff
- **Error Handling**: Comprehensive error logging via MarbleLoggerService

#### OddFeedPullService (`src/services/odd-feed-pull-service.ts`)

- **Data Orchestration**: Coordinates between API calls and storage
- **Filtering**: Applies user-defined filters to events
- **Storage**: Manages event storage in OddFeedStore
- **Game ID Extraction**: Uses idHelper to extract gameId from eventId

#### OddFeedScheduler (`src/services/odd-feed-scheduler.ts`)

- **Event Scheduling**: Schedules multiple event types per event
- **Time Management**: Handles different timestamps (start, odds, results)
- **Event Emission**: Triggers appropriate events at scheduled times
- **Retry Logic**: Built-in retry for result availability

#### OddFeedStore (`src/services/odd-feed-store.ts`)

- **In-Memory Storage**: `Record<string, Record<number, Event>>` structure
- **Game-based Organization**: Events organized by gameId, then eventId
- **Cleanup Management**: Handles event cleanup via EventCleanerService
- **Lifecycle**: Registers for system cleanup events

#### EventCleanerService (`src/services/event-cleaner-service.ts`)

- **Memory Management**: Prevents memory leaks by cleaning old events
- **Queue Management**: Maintains FIFO queue per game (max 50 events)
- **Automatic Cleanup**: Triggers cleanup when queue exceeds limit
- **Event Emission**: Emits system cleanup events

### Dependency Injection

#### Registration (`src/dependency-injection/index.ts`)

```typescript
// Core services registered as singletons
marbleLoggerService -> MarbleLoggerServiceImpl
oddFeedEventSource -> OddFeedEventSourceImpl
oddFeedPullService -> OddFeedPullServiceImpl
oddFeedScheduler -> OddFeedSchedulerImpl
oddFeedStore -> OddFeedStoreImpl (with disposer)
eventCleanerService -> EventCleanerServiceImpl (with disposer)
scheduler -> SchedulerImpl (with disposer)
oddFeedService -> OddFeedServiceImpl
oddFeedCron -> OddFeedCronImpl
oddFeedFilter -> Function (configurable)
```

#### Initialization Flow

1. **MarbleLoggerService.init()** - Initialize logging
2. **OddFeedStore.initEvent()** - Register cleanup listeners
3. **EventCleanerService.initEvent()** - Register event listeners
4. **OddFeedCron.start()** - Start periodic scheduling

## Improvements & Refactors

### High Priority Issues

#### 1. **Console.log Usage** (Lines: `src/services/odd-feed-scheduler.ts:118`, `src/services/odd-feed-store.ts:56`)

- **Issue**: Direct console.log usage instead of proper logging
- **Impact**: Inconsistent logging, no log level control
- **Fix**: Replace with MarbleLoggerService calls
- **Files**: `src/services/odd-feed-scheduler.ts`, `src/services/odd-feed-store.ts`

**Example Fix:**

```typescript
// ❌ Before (src/services/odd-feed-scheduler.ts:118)
console.error(
  `Failed to get event details for event ${event.eventID} and index ${index} after ${retry} retries`
);

// ✅ After
this.logService.error(
  `Failed to get event details for event ${event.eventID} and index ${index} after ${retry} retries`
);

// ❌ Before (src/services/odd-feed-store.ts:56)
console.log(`Cleaning up event ${eventId} for game ${gameId}`);

// ✅ After
this.marbleLoggerService.log(
  `Cleaning up event ${eventId} for game ${gameId}`,
  { eventId }
);
```

#### 2. **Type Safety Issues** (Lines: `src/container/awilix/index.ts:79`, `src/services/scheduler.ts:57`)

- **Issue**: `any` types in critical paths
- **Impact**: Loss of type safety, potential runtime errors
- **Fix**: Add proper type definitions for container cradle and callback args
- **Files**: `src/container/awilix/index.ts`, `src/services/scheduler.ts`

**Example Fix:**

```typescript
// ❌ Before (src/container/awilix/index.ts:79)
? reg.inject((cradle: any) => ({

// ✅ After
interface ContainerCradle {
  resolve: (key: string) => any;
  [key: string]: any;
}
? reg.inject((cradle: ContainerCradle) => ({

// ❌ Before (src/services/scheduler.ts:57)
return (...args: any[]) => {

// ✅ After
interface ScheduledCallback {
  (...args: unknown[]): void | Promise<void>;
}
return (...args: unknown[]) => {
```

#### 3. **Error Handling Inconsistency**

- **Issue**: Mixed error handling patterns (console.error vs MarbleLoggerService)
- **Impact**: Inconsistent error reporting
- **Fix**: Standardize on MarbleLoggerService for all error logging

**Example Fix:**

```typescript
// ❌ Before - Mixed patterns
try {
  // some operation
} catch (error) {
  console.error("Error occurred:", error); // Inconsistent
  this.marbleLoggerService.error(error); // Also inconsistent
}

// ✅ After - Standardized
try {
  // some operation
} catch (error) {
  this.marbleLoggerService.error(error as Error, {
    eventId: this.currentEventId,
  });
}
```

### Medium Priority Improvements

#### 4. **Memory Management**

- **Issue**: In-memory store grows indefinitely without proper cleanup
- **Impact**: Potential memory leaks in long-running processes
- **Fix**: Implement TTL-based cleanup and memory monitoring
- **Files**: `src/services/odd-feed-store.ts`, `src/services/event-cleaner-service.ts`

**Example Fix:**

```typescript
// ❌ Before - No TTL management
export class OddFeedStoreImpl {
  private readonly eventByGameId: Record<string, Record<number, Event>> = {};

  setEventByGameId(gameId: string, eventId: number, event: Event): void {
    if (!this.eventByGameId[gameId]) {
      this.eventByGameId[gameId] = {};
    }
    this.eventByGameId[gameId][eventId] = event;
  }
}

// ✅ After - With TTL and memory monitoring
interface StoredEvent {
  event: Event;
  timestamp: number;
  ttl: number;
}

export class OddFeedStoreImpl {
  private readonly eventByGameId: Record<string, Record<number, StoredEvent>> =
    {};
  private readonly maxMemoryMB = 100;

  setEventByGameId(
    gameId: string,
    eventId: number,
    event: Event,
    ttl = 3600000
  ): void {
    if (!this.eventByGameId[gameId]) {
      this.eventByGameId[gameId] = {};
    }

    this.eventByGameId[gameId][eventId] = {
      event,
      timestamp: Date.now(),
      ttl,
    };

    this.cleanupExpiredEvents();
    this.monitorMemoryUsage();
  }

  private cleanupExpiredEvents(): void {
    const now = Date.now();
    Object.keys(this.eventByGameId).forEach((gameId) => {
      Object.keys(this.eventByGameId[gameId]).forEach((eventId) => {
        const stored = this.eventByGameId[gameId][eventId];
        if (now - stored.timestamp > stored.ttl) {
          delete this.eventByGameId[gameId][eventId];
        }
      });
    });
  }
}
```

#### 5. **Configuration Management**

- **Issue**: Hardcoded values (MAX*LENGTH = 50, cron expression "*/30 \_ \* \* \* \*")
- **Impact**: Inflexible configuration
- **Fix**: Make configurable via AppConfigs interface
- **Files**: `src/services/event-cleaner-service.ts`, `src/services/odd-feed-cron.ts`

**Example Fix:**

```typescript
// ❌ Before - Hardcoded values
const MAX_LENGTH = 50;
const cronExpression = "*/30 * * * * *";

// ✅ After - Configurable via AppConfigs
interface AppConfigs {
  oddsFeedAPI: { /* existing */ };
  sentry: { /* existing */ };
  eventCleaner: {
    maxQueueLength: number;
  };
  cron: {
    scheduleInterval: string;
  };
}

// In EventCleanerServiceImpl
constructor(container: EventCleanerServiceContainer) {
  this.maxLength = container.appConfigs.eventCleaner.maxQueueLength;
}

// In OddFeedCronImpl
public scheduleNextEventsCron() {
  const cronExpression = this.appConfigs.cron.scheduleInterval;
  // ...
}
```

#### 6. **Async/Await Patterns**

- **Issue**: Mixed Promise handling patterns
- **Impact**: Potential race conditions and error handling issues
- **Fix**: Standardize on async/await with proper error boundaries
- **Files**: `src/services/odd-feed-cron.ts:45-51`

**Example Fix:**

```typescript
// ❌ Before - Mixed patterns with potential race conditions
public async schedule() {
  const upcomingEvents = await this.oddFeedPullService.pullUpcoming();
  upcomingEvents.forEach(async (event) => {  // ❌ forEach with async
    const eventWithDetails = await this.oddFeedPullService.pullEventWithEventDetails(event.eventID);
    if (!eventWithDetails) {
      return;
    }
    this.oddFeedScheduler.scheduleEvent(eventWithDetails);
  });
}

// ✅ After - Proper async handling
public async schedule() {
  try {
    const upcomingEvents = await this.oddFeedPullService.pullUpcoming();

    // Process events sequentially to avoid overwhelming the API
    for (const event of upcomingEvents) {
      try {
        const eventWithDetails = await this.oddFeedPullService.pullEventWithEventDetails(event.eventID);
        if (eventWithDetails) {
          this.oddFeedScheduler.scheduleEvent(eventWithDetails);
        }
      } catch (error) {
        this.logService.logError(`Failed to process event ${event.eventID}: ${error.message}`);
      }
    }
  } catch (error) {
    this.logService.logError(`Failed to pull upcoming events: ${error.message}`);
  }
}
```

### Low Priority Enhancements

#### 7. **Testing Coverage**

- **Issue**: Limited test coverage for complex scenarios
- **Impact**: Potential bugs in edge cases
- **Fix**: Add integration tests for event flows and error scenarios

#### 8. **Documentation**

- **Issue**: Missing JSDoc comments for public APIs
- **Impact**: Poor developer experience
- **Fix**: Add comprehensive JSDoc documentation

#### 9. **Performance Optimization**

- **Issue**: Synchronous event processing in forEach loops
- **Impact**: Blocking operations during event processing
- **Fix**: Implement batch processing and async event handling

### Architectural Improvements

#### 10. **Event Store Persistence**

- **Issue**: In-memory store lost on restart
- **Impact**: Data loss during service restarts
- **Fix**: Add optional persistence layer (Redis, database)

#### 11. **Health Checks**

- **Issue**: No health monitoring for external API connectivity
- **Impact**: Silent failures in API communication
- **Fix**: Implement health check endpoints and monitoring

#### 12. **Rate Limiting**

- **Issue**: No rate limiting for API calls
- **Impact**: Potential API throttling or blocking
- **Fix**: Implement rate limiting and backoff strategies

### Code Quality Issues

#### 13. **Magic Numbers**

- **Issue**: Hardcoded values throughout codebase
- **Impact**: Difficult maintenance and configuration
- **Fix**: Extract to constants or configuration

#### 14. **Error Recovery**

- **Issue**: Limited error recovery mechanisms
- **Impact**: Service failures cascade through system
- **Fix**: Implement circuit breaker patterns and graceful degradation

#### 15. **Monitoring & Observability**

- **Issue**: Limited metrics and monitoring
- **Impact**: Difficult to diagnose production issues
- **Fix**: Add comprehensive metrics collection and alerting

### Naming & API Design Issues

#### 16. **Confusing Method Naming** (`src/services/odd-feed-event-source.ts`, `src/interfaces/odd-feed-event-source.ts`)

- **Issue**: Methods named `onEventStart()`, `onEventUpcoming()` actually **emit** events, not listen to them
- **Impact**: Misleading API - developers expect these to be listeners, not emitters
- **Fix**: Rename to `emitEventStart()`, `emitEventUpcoming()` for clarity
- **Files**: `src/services/odd-feed-event-source.ts:51-84`, `src/interfaces/odd-feed-event-source.ts:49-55`

**Example Fix:**

```typescript
// ❌ Before - Confusing naming
export type OddFeedEventSource<TEvent extends Event = Event> = {
  onEventStart: (event: TEvent) => void;        // ❌ Sounds like listener
  onEventUpcoming: (event: TEvent) => void;     // ❌ Sounds like listener
  onDataCleanup: (eventID: number) => void;     // ❌ Sounds like listener
}

// ✅ After - Clear naming
export type OddFeedEventSource<TEvent extends Event = Event> = {
  emitEventStart: (event: TEvent) => void;      // ✅ Clearly emits
  emitEventUpcoming: (event: TEvent) => void;   // ✅ Clearly emits
  emitDataCleanup: (eventID: number) => void;   // ✅ Clearly emits
}

// Implementation
public emitEventStart(event: TEvent) {
  const key = OddFeedEventName.EventStart;
  this.emit(key, { event });
}
```

#### 17. **Inconsistent EventEmitter API** (`src/services/odd-feed-event-source.ts`)

- **Issue**: Uses `register/unregister` instead of standard EventEmitter `on/off` methods
- **Impact**: Inconsistent with Node.js EventEmitter conventions
- **Fix**: Rename to `on/off` methods for consistency with EventEmitter API
- **Files**: `src/services/odd-feed-event-source.ts:20-49`, `src/interfaces/odd-feed-event-source.ts:40-48`

**Example Fix:**

```typescript
// ❌ Before - Non-standard naming
export type OddFeedEventSource<TEvent extends Event = Event> = {
  registerWildcardEventListener: (listener: CatchAllEventListener<TEvent>) => void;
  unregisterWildcardEventListener: (listener: CatchAllEventListener<TEvent>) => void;
  registerEventListener: (eventName: OddFeedEventName, listener: EventListener<TEvent>) => void;
  unregisterEventListener: (eventName: OddFeedEventName, listener: EventListener<TEvent>) => void;
}

// ✅ After - Standard EventEmitter naming
export type OddFeedEventSource<TEvent extends Event = Event> = {
  on: (eventName: OddFeedEventName | SystemEventName, listener: Function) => void;
  off: (eventName: OddFeedEventName | SystemEventName, listener: Function) => void;
  // Or more specific:
  onWildcard: (listener: CatchAllEventListener<TEvent>) => void;
  offWildcard: (listener: CatchAllEventListener<TEvent>) => void;
  onEvent: (eventName: OddFeedEventName, listener: EventListener<TEvent>) => void;
  offEvent: (eventName: OddFeedEventName, listener: EventListener<TEvent>) => void;
}

// Implementation
public on(eventName: OddFeedEventName | SystemEventName, listener: Function) {
  this.oddFeedEventSource.on(eventName, listener);
}

public off(eventName: OddFeedEventName | SystemEventName, listener: Function) {
  this.oddFeedEventSource.off(eventName, listener);
}
```

#### 18. **Misleading "Notification" Naming** (`src/interfaces/odd-feed-event-source.ts`)

- **Issue**: Types named `EventNotification`, `EventDetailNotification` contain event data, not notifications
- **Impact**: Confusing naming - these are payloads/messages, not notifications
- **Fix**: Rename to `EventPayload`, `EventDetailPayload`, `SystemPayload`
- **Files**: `src/interfaces/odd-feed-event-source.ts:17-30`

**Example Fix:**

```typescript
// ❌ Before - Misleading "Notification" naming
export interface EventDetailNotification<TEvent extends Event = Event> {
  event: TEvent;
  index: number;
}

export interface EventNotification<TEvent extends Event = Event> {
  event: TEvent;
}

export interface SystemNotification {
  eventID: number;
}

export type Notification<TEvent extends Event = Event> =
  | EventNotification<TEvent>
  | EventDetailNotification<TEvent>
  | SystemNotification;

// ✅ After - Clear "Payload" naming
export interface EventDetailPayload<TEvent extends Event = Event> {
  event: TEvent;
  index: number;
}

export interface EventPayload<TEvent extends Event = Event> {
  event: TEvent;
}

export interface SystemPayload {
  eventID: number;
}

export type EventData<TEvent extends Event = Event> =
  | EventPayload<TEvent>
  | EventDetailPayload<TEvent>
  | SystemPayload;

// Updated listener types
export type CatchAllEventListener<TEvent extends Event = Event> = (
  eventName: OddFeedEventName,
  payload: EventData<TEvent>
) => void;
```

#### 19. **Inconsistent Property Naming** (`src/services/odd-feed-event-source.ts`)

- **Issue**: Property `OddFeedEventSource` (PascalCase) should be `oddFeedEventSource` (camelCase)
- **Impact**: Inconsistent with TypeScript/JavaScript naming conventions
- **Fix**: Rename to camelCase following standard conventions
- **Files**: `src/services/odd-feed-event-source.ts:15,18`

**Example Fix:**

```typescript
// ❌ Before - PascalCase property
export class OddFeedEventSourceImpl<TEvent extends Event = Event> {
  public OddFeedEventSource: EventEmitter; // ❌ PascalCase

  constructor() {
    this.OddFeedEventSource = new EventEmitter(); // ❌ PascalCase
  }

  public registerEventListener(
    eventName: OddFeedEventName,
    listener: EventListener<TEvent>
  ) {
    this.OddFeedEventSource.on(eventName, listener); // ❌ PascalCase
  }
}

// ✅ After - camelCase property
export class OddFeedEventSourceImpl<TEvent extends Event = Event> {
  public oddFeedEventSource: EventEmitter; // ✅ camelCase

  constructor() {
    this.oddFeedEventSource = new EventEmitter(); // ✅ camelCase
  }

  public registerEventListener(
    eventName: OddFeedEventName,
    listener: EventListener<TEvent>
  ) {
    this.oddFeedEventSource.on(eventName, listener); // ✅ camelCase
  }
}
```

#### 20. **Redundant Event Detail Registration** (`src/services/odd-feed-event-source.ts`)

- **Issue**: Separate `registerEventDetailEventListener` method that does the same as `registerEventListener`
- **Impact**: Unnecessary API complexity and confusion
- **Fix**: Remove redundant method, use single `registerEventListener` for all event types
- **Files**: `src/services/odd-feed-event-source.ts:35-41`, `src/interfaces/odd-feed-event-source.ts:45-46`

**Example Fix:**

```typescript
// ❌ Before - Redundant methods
export type OddFeedEventSource<TEvent extends Event = Event> = {
  registerEventListener: (eventName: OddFeedEventName, listener: EventListener<TEvent>) => void;
  registerEventDetailEventListener: (eventName: OddFeedEventName, listener: EventDetailListener<TEvent>) => void;  // ❌ Redundant
  unregisterEventListener: (eventName: OddFeedEventName, listener: EventListener<TEvent>) => void;
  unregisterEventDetailEventListener: (eventName: OddFeedEventName, listener: EventDetailListener<TEvent>) => void;  // ❌ Redundant
}

// Implementation
public registerEventDetailEventListener(eventName: OddFeedEventName, listener: EventDetailListener<TEvent>) {
  this.OddFeedEventSource.on(eventName, listener);  // ❌ Same as registerEventListener
}

// ✅ After - Simplified API
export type OddFeedEventSource<TEvent extends Event = Event> = {
  registerEventListener: (eventName: OddFeedEventName, listener: EventListener<TEvent>) => void;
  unregisterEventListener: (eventName: OddFeedEventName, listener: EventListener<TEvent>) => void;
  // Remove redundant methods
}

// Implementation - Single method handles all event types
public registerEventListener(eventName: OddFeedEventName, listener: EventListener<TEvent>) {
  this.oddFeedEventSource.on(eventName, listener);
}
```

#### 21. **Inconsistent Event Name Casing** (`src/interfaces/odd-feed-event-source.ts`)

- **Issue**: Mixed casing in event names (`EventDetailUpComing` vs `EventUpcoming`)
- **Impact**: Inconsistent API design
- **Fix**: Standardize to consistent casing (e.g., `EventDetailUpcoming`)
- **Files**: `src/interfaces/odd-feed-event-source.ts:6,10`

**Example Fix:**

```typescript
// ❌ Before - Inconsistent casing
export enum OddFeedEventName {
  Wildcard = "*",
  EventStart = "event.ScheduleStart",
  EventDetailUpComing = "eventDetail.UpComing", // ❌ Mixed case
  EventDetailStart = "eventDetail.ScheduleStart",
  EventDetailOddsAvailable = "eventDetail.OddsAvailable",
  EventDetailResultsAvailable = "eventDetail.ResultsAvailable",
  EventUpcoming = "event.Upcoming", // ❌ Different casing
}

// ✅ After - Consistent casing
export enum OddFeedEventName {
  Wildcard = "*",
  EventStart = "event.ScheduleStart",
  EventDetailUpcoming = "eventDetail.Upcoming", // ✅ Consistent
  EventDetailStart = "eventDetail.ScheduleStart",
  EventDetailOddsAvailable = "eventDetail.OddsAvailable",
  EventDetailResultsAvailable = "eventDetail.ResultsAvailable",
  EventUpcoming = "event.Upcoming", // ✅ Consistent
}
```

#### 22. **Generic Type Redundancy** (`src/interfaces/odd-feed-event-source.ts`)

- **Issue**: Repetitive `<TEvent extends Event = Event>` throughout interfaces
- **Impact**: Verbose and hard to maintain
- **Fix**: Create base types or use type aliases to reduce repetition
- **Files**: `src/interfaces/odd-feed-event-source.ts:17-38`

**Example Fix:**

```typescript
// ❌ Before - Repetitive generic types
export interface EventDetailNotification<TEvent extends Event = Event> {
  event: TEvent;
  index: number;
}

export interface EventNotification<TEvent extends Event = Event> {
  event: TEvent;
}

export type CatchAllEventListener<TEvent extends Event = Event> = (
  eventName: OddFeedEventName,
  notification: Notification<TEvent>
) => void;

export type EventDetailListener<TEvent extends Event = Event> = (
  notification: EventDetailNotification<TEvent>
) => void;

export type EventListener<TEvent extends Event = Event> = (
  notification: EventNotification<TEvent> | EventDetailNotification<TEvent>
) => void;

// ✅ After - Using type aliases
type EventType<TEvent extends Event = Event> = TEvent;

export interface EventDetailPayload<TEvent extends Event = Event> {
  event: EventType<TEvent>;
  index: number;
}

export interface EventPayload<TEvent extends Event = Event> {
  event: EventType<TEvent>;
}

// Or even better - create a base type
type BaseEventType = Event;

export interface EventDetailPayload<
  TEvent extends BaseEventType = BaseEventType
> {
  event: TEvent;
  index: number;
}

export interface EventPayload<TEvent extends BaseEventType = BaseEventType> {
  event: TEvent;
}

// Create reusable listener types
type BaseEventListener<TEvent extends BaseEventType = BaseEventType> = (
  payload: EventPayload<TEvent>
) => void;

type BaseEventDetailListener<TEvent extends BaseEventType = BaseEventType> = (
  payload: EventDetailPayload<TEvent>
) => void;
```

#### 23. **Confusing Handler Method Naming** (`src/services/odd-feed-scheduler.ts`)

- **Issue**: Methods named `handleEventStart()`, `handleEventDetailStart()` actually **emit** events, not handle them
- **Impact**: Misleading API - developers expect these to be event handlers, not emitters
- **Fix**: Rename to `emitEventStart()`, `emitEventDetailStart()` for clarity
- **Files**: `src/services/odd-feed-scheduler.ts:91-133`

**Example Fix:**

```typescript
// ❌ Before - Confusing "handle" naming
protected async handleEventStart(event: OddFeedEvent) {
  const updatedEvent = await this.pullEventAndUpdateStore(event);
  if (!updatedEvent) {
    return;
  }
  this.oddFeedEventSource.onEventStart(updatedEvent);  // ❌ Actually emits
}

protected async handleEventDetailStart(event: OddFeedEvent, index: number) {
  const updatedEvent = await this.pullEventAndUpdateStore(event);
  if (!updatedEvent) {
    return;
  }
  this.oddFeedEventSource.onEventDetailStart(updatedEvent, index);  // ❌ Actually emits
}

// ✅ After - Clear "emit" naming
protected async emitEventStart(event: OddFeedEvent) {
  const updatedEvent = await this.pullEventAndUpdateStore(event);
  if (!updatedEvent) {
    return;
  }
  this.oddFeedEventSource.emitEventStart(updatedEvent);  // ✅ Clearly emits
}

protected async emitEventDetailStart(event: OddFeedEvent, index: number) {
  const updatedEvent = await this.pullEventAndUpdateStore(event);
  if (!updatedEvent) {
    return;
  }
  this.oddFeedEventSource.emitEventDetailStart(updatedEvent, index);  // ✅ Clearly emits
}
```

#### 24. **Misleading Method Names in Scheduler** (`src/services/odd-feed-scheduler.ts`)

- **Issue**: `scheduleEventDetailUpComing()` immediately emits events, doesn't actually schedule them
- **Impact**: Confusing API - method name suggests scheduling but actually emits immediately
- **Fix**: Rename to `emitEventDetailUpcoming()` or `triggerEventDetailUpcoming()`
- **Files**: `src/services/odd-feed-scheduler.ts:57-58`

**Example Fix:**

```typescript
// ❌ Before - Misleading "schedule" naming
protected scheduleEventDetailUpComing(event: OddFeedEvent, index: number) {
  this.oddFeedEventSource.onEventDetailUpComing(event, index);  // ❌ Immediately emits, doesn't schedule
}

// ✅ After - Clear naming
protected emitEventDetailUpcoming(event: OddFeedEvent, index: number) {
  this.oddFeedEventSource.emitEventDetailUpcoming(event, index);  // ✅ Clearly emits immediately
}

```

---

## Requirements

- Node.js >= 18

## Installation

```bash
npm install odds-feed-client
# or
yarn add odds-feed-client
# or
pnpm add odds-feed-client
```

If you use the Awilix adapter shown below, also install `awilix` (it is already a dependency here, so this is optional for most setups):

```bash
npm install awilix
```

## Quick start (TypeScript)

The `example/` folder contains a runnable sample. Below is the minimal setup using Awilix.

```ts
import { createContainer, asClass, asValue } from "awilix";
import { register, init } from "odd-feed-client/dependency-injection";
import { AwilixDIContainer } from "odd-feed-client/awilix";
import type {
  AppConfigs,
  Logger,
  OddFeedEventSource,
  OddFeedEventName,
} from "odd-feed-client";

// 1) App configuration
const appConfigs: AppConfigs = {
  oddsFeedAPI: {
    url: "https://your-odds-feed-host",
    operatorId: "<operator-id>",
    password: "<operator-password>",
  },
};

// 2) Logger implementation (only logError is required)
class ConsoleLogger implements Logger {
  public logError(message: string) {
    console.error(message);
  }
}

// 3) Create Awilix container and register your own bindings
const container = createContainer();
container.register({
  appConfigs: asValue(appConfigs),
  logger: asClass(ConsoleLogger),
});

// 4) Wrap as a DI container and register odds-feed services
const di = new AwilixDIContainer(container);
register(di);
init(di); // starts cron and internal listeners

// 5) (Optional) Listen to feed events
const eventSource = di.resolve<oddsFeedEventSource>("oddsFeedEventSource");
eventSource.registerEventListener(
  OddFeedEventName.EventUpcoming,
  ({ event }) => {
    console.log("Upcoming event:", event.eventID);
  }
);
```

This will:

- authenticate to the odds feed and pull the schedule
- periodically (every ~30s) reschedule and fetch event details
- emit domain events via the internal event source
- store events in an in-memory store keyed by gameId and eventId

### Reading from the store

```ts
import type { oddsFeedStore } from "odds-feed-client";

const store = di.resolve<oddsFeedStore>("oddsFeedStore");
const event = store.getEventByGameId("<game-id>", /* eventId */ 123456);
```

### Odd feed filter (container value)

`oddsFeedPullService` can take an optional filter to decide which events to keep. Register a value named `oddsFeedFilter` in your container. It can be either:

- a function `(event) => boolean` (predicate), or
- a boolean (`true` to include all, `false` to include none).

If you don't register it, all events are included by default.

```ts
// Keep all events (default behavior example)
container.register({
  oddFeedFilter: asValue(true), // include all events
});

// Example: only include events for specific IDs
container.register({
  oddFeedFilter: asValue((event) => [111, 222, 333].includes(event.eventID)),
});
```

### Without Awilix

You can bring your own DI by implementing `DiContainer` and passing it to `register` and `init`. See `odds-feed-client/container` for the minimal required interface.

### Example app

Check `example/` for a complete, runnable setup that mirrors the snippets above.

### Exports

- `odds-feed-client`: re-exports interfaces and domain types
- `odds-feed-client/dependency-injection`: `register(diContainer)`, `init(diContainer)`
- `odds-feed-client/awilix`: `AwilixDIContainer` adapter
