export type Event = {
  eventID: number;
  eventNameAKey: string;
  eventNameBKey: string;
  theme?: string;
  scheduleStartTs: string;
  productCode: string;
  productTypeKey: string;
  eventDetails: EventDetail[];
  voiceConfig?: string;
  now?: string;
  eventConfig?: Record<string, any>;
};

export type EventDetail = {
  eventID: number;
  oddsAvailableTs: string;
  scheduleStartTs: string;
  resultsAvailableTs: string;
  hasResults: boolean;
  goalInfo: string;
  playlist: string;
  result: string;
  markets: Market[];
  inGameEventInfo: string;
  phase: number;
};

type Market = {
  selections: Selection[];
}

type Selection = {
  price: string;
  point: number;
  settlementStatus: "W" | "L" | "P";
}