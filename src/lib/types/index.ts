export interface Event {
  id: string;
  userId: string;
  eventName: string;
  properties: Record<string, unknown> | null;
  device: string | null;
  country: string | null;
  referrer: string | null;
  createdAt: string;
}

export interface IngestEventPayload {
  user_id: string;
  event_name: string;
  properties?: Record<string, unknown>;
  device?: string;
  country?: string;
  referrer?: string;
  created_at?: string;
}

export interface OverviewResponse {
  totalEvents: number;
  uniqueUsers: number;
  newSignups: number;
  activeUsers: number;
  revenue: number;
  topEvents: { eventName: string; count: number }[];
  trafficSources: { source: string; count: number }[];
}

export interface EventsSeriesResponse {
  series: { date: string; count: number }[];
}

export interface RetentionCohort {
  period: string;
  newUsers: number;
  retention: Record<string, number>;
}

export interface RetentionResponse {
  cohorts: RetentionCohort[];
}

export interface FunnelStep {
  eventName: string;
  count: number;
  dropoff: number;
  conversionFromPrevious: number;
  conversionFromFirst: number;
}

export interface FunnelResponse {
  steps: FunnelStep[];
}
