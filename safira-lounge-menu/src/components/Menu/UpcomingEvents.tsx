/**
 * Upcoming Events Component
 * Displays upcoming events and announcements on the menu page
 */

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Event } from '../../types/event.types';
import { Language } from '../../types';

// Styled components
const EventsContainer = styled(motion.div)`
  width: 90vw;
  max-width: 900px;
  margin: 40px auto 60px;
  padding: 0 20px;

  @media (max-width: 768px) {
    margin: 30px auto 50px;
    width: 90vw;
  }
`;

const SectionTitle = styled(motion.h2)`
  font-family: 'Aldrich', sans-serif;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 400;
  color: white;
  text-align: center;
  margin: 0 0 30px 0;
  text-shadow:
    0 0 20px rgba(255, 65, 251, 0.5),
    0 0 40px rgba(255, 65, 251, 0.3),
    0 2px 10px rgba(255, 255, 255, 0.3);
  letter-spacing: 2px;
  text-transform: uppercase;

  @media (max-width: 768px) {
    margin: 0 0 20px 0;
  }
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const EventCard = styled(motion.div)<{ $bgColor?: string }>`
  position: relative;
  background: ${props => props.$bgColor || 'rgba(255, 255, 255, 0.05)'};
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};

  &:hover {
    transform: translateY(-5px);
    border-color: #FF41FB;
    box-shadow: 0 10px 30px rgba(255, 65, 251, 0.3);
  }

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const EventImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 15px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    height: 150px;
  }
`;

const EventContent = styled.div<{ $textColor?: string }>`
  color: ${props => props.$textColor || 'white'};
`;

const EventType = styled.div`
  display: inline-block;
  background: rgba(255, 65, 251, 0.2);
  color: #FF41FB;
  padding: 4px 12px;
  border-radius: 10px;
  font-family: 'Aldrich', sans-serif;
  font-size: clamp(0.7rem, 1.8vw, 0.8rem);
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const EventTitle = styled.h3`
  font-family: 'Aldrich', sans-serif;
  font-size: clamp(1.1rem, 2.8vw, 1.3rem);
  margin: 0 0 10px 0;
  line-height: 1.3;
`;

const EventDescription = styled.p`
  font-family: 'Aldrich', sans-serif;
  font-size: clamp(0.85rem, 2.2vw, 0.95rem);
  line-height: 1.5;
  margin: 0 0 15px 0;
  opacity: 0.9;
`;

const EventMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: 'Aldrich', sans-serif;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  opacity: 0.8;
`;

const EventDate = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '📅';
    font-size: 1.2rem;
  }
`;

const EventTime = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '🕐';
    font-size: 1.2rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Aldrich', sans-serif;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
`;

// Component interfaces
export interface UpcomingEventsProps {
  /** Events to display */
  events: Event[];
  /** Current language */
  language: Language;
  /** Event click handler */
  onEventClick?: (event: Event) => void;
  /** Show section title */
  showTitle?: boolean;
  /** CSS class name */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * Format date for display
 */
const formatDate = (dateString: string, language: Language): string => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const localeMap = {
    de: 'de-DE',
    da: 'da-DK',
    en: 'en-US',
    tr: 'tr-TR',
    it: 'it-IT'
  };

  return date.toLocaleDateString(localeMap[language] || 'de-DE', options);
};

/**
 * Get event type label
 */
const getEventTypeLabel = (type: Event['type'], language: Language): string => {
  const labels: Record<string, Record<Language, string>> = {
    concert: {
      de: 'Konzert',
      da: 'Koncert',
      en: 'Concert',
      tr: 'Konser',
      it: 'Concerto'
    },
    party: {
      de: 'Party',
      da: 'Fest',
      en: 'Party',
      tr: 'Parti',
      it: 'Festa'
    },
    special: {
      de: 'Special Event',
      da: 'Special Event',
      en: 'Special Event',
      tr: 'Özel Etkinlik',
      it: 'Evento Speciale'
    },
    announcement: {
      de: 'Ankündigung',
      da: 'Meddelelse',
      en: 'Announcement',
      tr: 'Duyuru',
      it: 'Annuncio'
    },
    other: {
      de: 'Event',
      da: 'Event',
      en: 'Event',
      tr: 'Etkinlik',
      it: 'Evento'
    }
  };

  return labels[type || 'other']?.[language] || labels.other[language];
};

/**
 * Upcoming Events Component
 */
export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  events,
  language,
  onEventClick,
  showTitle = true,
  className,
  testId = 'upcoming-events'
}) => {
  /**
   * Filter and sort events
   */
  const activeEvents = useMemo(() => {
    const now = new Date();

    return events
      .filter(event => {
        // Only show active events
        if (!event.active) return false;

        // Filter out past events
        const eventDate = new Date(event.date);
        return eventDate >= now;
      })
      .sort((a, b) => {
        // Sort by date (earliest first)
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;

        // Then by sortOrder
        return (a.sortOrder || 999) - (b.sortOrder || 999);
      });
  }, [events]);

  // Don't render if no events
  if (activeEvents.length === 0) {
    return null;
  }

  /**
   * Animation variants
   */
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <EventsContainer
      className={className}
      data-testid={testId}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {showTitle && (
        <SectionTitle variants={itemVariants}>
          Upcoming Events
        </SectionTitle>
      )}

      <EventsGrid>
        {activeEvents.map((event) => {
          const title = typeof event.title === 'string'
            ? event.title
            : event.title[language] || event.title.de || '';

          const description = event.description
            ? (typeof event.description === 'string'
              ? event.description
              : event.description[language] || event.description.de || '')
            : '';

          return (
            <EventCard
              key={event.id}
              variants={itemVariants}
              onClick={onEventClick ? () => onEventClick(event) : undefined}
              $bgColor={event.backgroundColor}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {event.image && (
                <EventImage
                  src={event.image}
                  alt={title}
                  loading="lazy"
                />
              )}

              <EventContent $textColor={event.textColor}>
                {event.type && (
                  <EventType>
                    {getEventTypeLabel(event.type, language)}
                  </EventType>
                )}

                <EventTitle>{title}</EventTitle>

                {description && (
                  <EventDescription>{description}</EventDescription>
                )}

                <EventMeta>
                  <EventDate>
                    {formatDate(event.date, language)}
                  </EventDate>

                  {event.time && (
                    <EventTime>
                      {event.time}
                    </EventTime>
                  )}
                </EventMeta>
              </EventContent>
            </EventCard>
          );
        })}
      </EventsGrid>
    </EventsContainer>
  );
};

/**
 * Default export
 */
export default UpcomingEvents;
