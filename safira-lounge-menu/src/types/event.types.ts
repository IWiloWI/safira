/**
 * Event Type Definitions
 * Types for upcoming events and announcements
 */

import { MultilingualText } from './index';

/**
 * Event interface
 */
export interface Event {
  /** Unique event ID */
  id: string;
  /** Event title (multilingual) */
  title: MultilingualText;
  /** Event description (multilingual) */
  description?: MultilingualText;
  /** Event date (ISO string) */
  date: string;
  /** Event time (e.g., "20:00" or "20:00-23:00") */
  time?: string;
  /** Event image URL */
  image?: string;
  /** Event link/URL */
  link?: string;
  /** Whether event is active/visible */
  active: boolean;
  /** Display order */
  sortOrder?: number;
  /** Event type/category */
  type?: 'concert' | 'party' | 'special' | 'announcement' | 'other';
  /** Background color for event card */
  backgroundColor?: string;
  /** Text color for event card */
  textColor?: string;
  /** Created timestamp */
  createdAt?: string;
  /** Updated timestamp */
  updatedAt?: string;
}

/**
 * Event form data for admin
 */
export interface EventFormData {
  title: MultilingualText;
  description?: MultilingualText;
  date: string;
  time?: string;
  image?: string;
  link?: string;
  active: boolean;
  sortOrder?: number;
  type?: Event['type'];
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Event filters for admin
 */
export interface EventFilters {
  active?: boolean;
  type?: Event['type'];
  dateFrom?: string;
  dateTo?: string;
}
