/**
 * Shared TypeScript types for the thea application.
 */

export type Priority = "low" | "medium" | "high" | "critical";

export type Status = "open" | "in_progress" | "done" | "closed";

export type EventType =
  | "created"
  | "status_changed"
  | "priority_changed"
  | "agent_assigned"
  | "agent_unassigned"
  | "edited"
  | "comment";

export interface Issue {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  agentSession: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IssueLabel {
  id: number;
  issueId: number;
  label: string;
}

export interface IssueEvent {
  id: number;
  issueId: number;
  type: EventType;
  detail: string;
  createdAt: string;
}

export interface AoStatus {
  sessions: AoSession[];
}

export interface AoSession {
  name: string;
  status: string;
}
