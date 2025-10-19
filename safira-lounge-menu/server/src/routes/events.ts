/**
 * Events API Routes
 * Handles CRUD operations for upcoming events
 */

import express, { Request, Response } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Path to events data file
const EVENTS_FILE = join(__dirname, '../../data/events.json');

/**
 * Event interface
 */
interface Event {
  id: string;
  title: {
    de: string;
    da?: string;
    en?: string;
    tr?: string;
    it?: string;
  };
  description?: {
    de: string;
    da?: string;
    en?: string;
    tr?: string;
    it?: string;
  };
  date: string;
  time?: string;
  image?: string;
  link?: string;
  active: boolean;
  sortOrder?: number;
  type?: 'concert' | 'party' | 'special' | 'announcement' | 'other';
  backgroundColor?: string;
  textColor?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Load events from file
 */
const loadEvents = (): Event[] => {
  try {
    if (!existsSync(EVENTS_FILE)) {
      return [];
    }
    const data = readFileSync(EVENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
};

/**
 * Save events to file
 */
const saveEvents = (events: Event[]): void => {
  try {
    writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving events:', error);
    throw error;
  }
};

/**
 * GET /api/events
 * Get all events
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const events = loadEvents();

    // Sort by date and sortOrder
    const sortedEvents = events.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return (a.sortOrder || 999) - (b.sortOrder || 999);
    });

    res.json(sortedEvents);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Failed to load events' });
  }
});

/**
 * GET /api/events/active
 * Get only active future events
 */
router.get('/active', (req: Request, res: Response) => {
  try {
    const events = loadEvents();
    const now = new Date();

    const activeEvents = events
      .filter(event => {
        if (!event.active) return false;
        const eventDate = new Date(event.date);
        return eventDate >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return (a.sortOrder || 999) - (b.sortOrder || 999);
      });

    res.json(activeEvents);
  } catch (error) {
    console.error('Error getting active events:', error);
    res.status(500).json({ error: 'Failed to load active events' });
  }
});

/**
 * GET /api/events/:id
 * Get event by ID
 */
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const events = loadEvents();
    const event = events.find(e => e.id === req.params.id);

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ error: 'Failed to load event' });
  }
});

/**
 * POST /api/events
 * Create new event
 */
router.post('/', (req: Request, res: Response): void => {
  try {
    const events = loadEvents();
    const now = new Date().toISOString();

    const newEvent: Event = {
      id: uuidv4(),
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time,
      image: req.body.image,
      link: req.body.link,
      active: req.body.active !== undefined ? req.body.active : true,
      sortOrder: req.body.sortOrder || 0,
      type: req.body.type || 'other',
      backgroundColor: req.body.backgroundColor,
      textColor: req.body.textColor || '#ffffff',
      createdAt: now,
      updatedAt: now
    };

    // Validate required fields
    if (!newEvent.title || !newEvent.title.de) {
      res.status(400).json({ error: 'Title (German) is required' });
      return;
    }

    if (!newEvent.date) {
      res.status(400).json({ error: 'Date is required' });
      return;
    }

    events.push(newEvent);
    saveEvents(events);

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * PUT /api/events/:id
 * Update event
 */
router.put('/:id', (req: Request, res: Response): void => {
  try {
    const events = loadEvents();
    const eventIndex = events.findIndex(e => e.id === req.params.id);

    if (eventIndex === -1) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const existingEvent = events[eventIndex];
    const now = new Date().toISOString();

    const updatedEvent: Event = {
      ...existingEvent,
      title: req.body.title || existingEvent.title,
      description: req.body.description !== undefined ? req.body.description : existingEvent.description,
      date: req.body.date || existingEvent.date,
      time: req.body.time !== undefined ? req.body.time : existingEvent.time,
      image: req.body.image !== undefined ? req.body.image : existingEvent.image,
      link: req.body.link !== undefined ? req.body.link : existingEvent.link,
      active: req.body.active !== undefined ? req.body.active : existingEvent.active,
      sortOrder: req.body.sortOrder !== undefined ? req.body.sortOrder : existingEvent.sortOrder,
      type: req.body.type || existingEvent.type,
      backgroundColor: req.body.backgroundColor !== undefined ? req.body.backgroundColor : existingEvent.backgroundColor,
      textColor: req.body.textColor || existingEvent.textColor,
      updatedAt: now
    };

    events[eventIndex] = updatedEvent;
    saveEvents(events);

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

/**
 * DELETE /api/events/:id
 * Delete event
 */
router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const events = loadEvents();
    const eventIndex = events.findIndex(e => e.id === req.params.id);

    if (eventIndex === -1) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    events.splice(eventIndex, 1);
    saveEvents(events);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
