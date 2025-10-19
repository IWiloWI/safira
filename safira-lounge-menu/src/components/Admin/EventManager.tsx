/**
 * Event Manager Component
 * Admin interface for managing upcoming events
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSave, FaTimes, FaCalendar } from 'react-icons/fa';
import { Event, EventFormData } from '../../types/event.types';
import { Language } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import * as api from '../../services/api';

// Styled components
const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
`;

const Title = styled.h2`
  font-family: 'Oswald', sans-serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FF41FB;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const AddButton = styled(motion.button)`
  background: linear-gradient(145deg, #FF41FB, #FF1493);
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 65, 251, 0.4);
  }
`;

const EventsGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const EventCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
`;

const EventCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 15px;
`;

const EventInfo = styled.div`
  flex: 1;
`;

const EventTitle = styled.h3`
  font-family: 'Aldrich', sans-serif;
  font-size: 1.2rem;
  color: white;
  margin: 0 0 8px 0;
`;

const EventMeta = styled.div`
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
`;

const EventActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.85rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 65, 251, 0.2);
    border-color: #FF41FB;
  }

  &.delete {
    &:hover {
      background: rgba(244, 67, 54, 0.2);
      border-color: #f44336;
      color: #f44336;
    }
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: linear-gradient(145deg, #1a1a2e, #16213e);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 20px;
  padding: 30px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const ModalTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  color: #FF41FB;
  margin: 0;
  text-transform: uppercase;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.3s ease;

  &:hover {
    color: white;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 15px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.95rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #FF41FB;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 15px rgba(255, 65, 251, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const Textarea = styled.textarea`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 15px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.95rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #FF41FB;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 15px rgba(255, 65, 251, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 15px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #FF41FB;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 15px rgba(255, 65, 251, 0.2);
  }

  option {
    background: #1a1a2e;
    color: white;
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #FF41FB;
  }

  label {
    cursor: pointer;
    user-select: none;
  }
`;

const LanguageTabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const LanguageTab = styled.button<{ $active: boolean }>`
  background: ${props => props.$active
    ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
    : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active
    ? '#FF41FB'
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$active
    ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
    : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
`;

const Button = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  background: ${props => props.$variant === 'primary'
    ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
    : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.$variant === 'primary'
    ? '#FF41FB'
    : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 10px;
  padding: 12px 24px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 65, 251, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Aldrich', sans-serif;

  svg {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.3;
  }

  h3 {
    font-size: 1.2rem;
    margin: 0 0 10px 0;
    color: rgba(255, 255, 255, 0.7);
  }

  p {
    font-size: 0.95rem;
    margin: 0;
  }
`;

// Component interfaces
export interface EventManagerProps {
  className?: string;
  testId?: string;
}

/**
 * Event Manager Component
 */
export const EventManager: React.FC<EventManagerProps> = ({
  className,
  testId = 'event-manager'
}) => {
  const { language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [currentLang, setCurrentLang] = useState<Language>('de');
  const [formData, setFormData] = useState<EventFormData>({
    title: { de: '', da: '', en: '', tr: '', it: '' },
    description: { de: '', da: '', en: '', tr: '', it: '' },
    date: '',
    time: '',
    image: '',
    link: '',
    active: true,
    sortOrder: 0,
    type: 'other',
    backgroundColor: '',
    textColor: '#ffffff'
  });

  /**
   * Load events from API
   */
  const loadEvents = useCallback(async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  /**
   * Open modal for creating new event
   */
  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: { de: '', da: '', en: '', tr: '', it: '' },
      description: { de: '', da: '', en: '', tr: '', it: '' },
      date: '',
      time: '',
      image: '',
      link: '',
      active: true,
      sortOrder: 0,
      type: 'other',
      backgroundColor: '',
      textColor: '#ffffff'
    });
    setIsModalOpen(true);
  };

  /**
   * Open modal for editing event
   */
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || { de: '', da: '', en: '', tr: '', it: '' },
      date: event.date,
      time: event.time || '',
      image: event.image || '',
      link: event.link || '',
      active: event.active,
      sortOrder: event.sortOrder || 0,
      type: event.type || 'other',
      backgroundColor: event.backgroundColor || '',
      textColor: event.textColor || '#ffffff'
    });
    setIsModalOpen(true);
  };

  /**
   * Delete event
   */
  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.deleteEvent(eventId);
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  /**
   * Toggle event active status
   */
  const handleToggleActive = async (event: Event) => {
    try {
      await api.updateEvent(event.id, { ...event, active: !event.active });
      loadEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, formData);
      } else {
        await api.createEvent(formData);
      }

      setIsModalOpen(false);
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  /**
   * Update form field
   */
  const updateField = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Update multilingual field
   */
  const updateMultilingualField = (
    field: 'title' | 'description',
    lang: Language,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value }
    }));
  };

  return (
    <Container className={className} data-testid={testId}>
      <Header>
        <Title>Event Manager</Title>
        <AddButton
          onClick={handleCreate}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> Add Event
        </AddButton>
      </Header>

      {events.length === 0 ? (
        <EmptyState>
          <FaCalendar />
          <h3>No Events Yet</h3>
          <p>Create your first event to get started</p>
        </EmptyState>
      ) : (
        <EventsGrid>
          {events.map((event) => (
            <EventCard
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EventCardHeader>
                <EventInfo>
                  <EventTitle>
                    {typeof event.title === 'string'
                      ? event.title
                      : event.title[language] || event.title.de}
                  </EventTitle>
                  <EventMeta>
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    {event.time && <span>🕐 {event.time}</span>}
                    {event.type && <span>🏷️ {event.type}</span>}
                    <span>{event.active ? '✅ Active' : '❌ Inactive'}</span>
                  </EventMeta>
                </EventInfo>

                <EventActions>
                  <IconButton
                    onClick={() => handleToggleActive(event)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={event.active ? 'Deactivate' : 'Activate'}
                  >
                    {event.active ? <FaEyeSlash /> : <FaEye />}
                  </IconButton>

                  <IconButton
                    onClick={() => handleEdit(event)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaEdit />
                  </IconButton>

                  <IconButton
                    className="delete"
                    onClick={() => handleDelete(event.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTrash />
                  </IconButton>
                </EventActions>
              </EventCardHeader>
            </EventCard>
          ))}
        </EventsGrid>
      )}

      {/* Event Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>
                  {editingEvent ? 'Edit Event' : 'Create Event'}
                </ModalTitle>
                <CloseButton onClick={() => setIsModalOpen(false)}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>

              <Form onSubmit={handleSubmit}>
                {/* Title */}
                <FormGroup>
                  <Label>Title</Label>
                  <LanguageTabs>
                    {(['de', 'en', 'da', 'tr', 'it'] as Language[]).map(lang => (
                      <LanguageTab
                        key={lang}
                        type="button"
                        $active={currentLang === lang}
                        onClick={() => setCurrentLang(lang)}
                      >
                        {lang.toUpperCase()}
                      </LanguageTab>
                    ))}
                  </LanguageTabs>
                  <Input
                    type="text"
                    value={formData.title[currentLang] || ''}
                    onChange={(e) => updateMultilingualField('title', currentLang, e.target.value)}
                    placeholder={`Event title (${currentLang.toUpperCase()})`}
                    required={currentLang === 'de'}
                  />
                </FormGroup>

                {/* Description */}
                <FormGroup>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={formData.description?.[currentLang] || ''}
                    onChange={(e) => updateMultilingualField('description', currentLang, e.target.value)}
                    placeholder={`Event description (${currentLang.toUpperCase()})`}
                  />
                </FormGroup>

                {/* Date & Time */}
                <FormGroup>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Time (Optional)</Label>
                  <Input
                    type="text"
                    value={formData.time || ''}
                    onChange={(e) => updateField('time', e.target.value)}
                    placeholder="e.g., 20:00 or 20:00-23:00"
                  />
                </FormGroup>

                {/* Type */}
                <FormGroup>
                  <Label>Event Type</Label>
                  <Select
                    value={formData.type}
                    onChange={(e) => updateField('type', e.target.value)}
                  >
                    <option value="concert">Concert</option>
                    <option value="party">Party</option>
                    <option value="special">Special Event</option>
                    <option value="announcement">Announcement</option>
                    <option value="other">Other</option>
                  </Select>
                </FormGroup>

                {/* Image URL */}
                <FormGroup>
                  <Label>Image URL (Optional)</Label>
                  <Input
                    type="url"
                    value={formData.image || ''}
                    onChange={(e) => updateField('image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </FormGroup>

                {/* Link */}
                <FormGroup>
                  <Label>Link (Optional)</Label>
                  <Input
                    type="url"
                    value={formData.link || ''}
                    onChange={(e) => updateField('link', e.target.value)}
                    placeholder="https://example.com"
                  />
                </FormGroup>

                {/* Active */}
                <FormGroup>
                  <Checkbox>
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => updateField('active', e.target.checked)}
                    />
                    <Label htmlFor="active">Active (visible on menu)</Label>
                  </Checkbox>
                </FormGroup>

                {/* Submit */}
                <ButtonGroup>
                  <Button
                    type="button"
                    $variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <FaTimes /> Cancel
                  </Button>
                  <Button
                    type="submit"
                    $variant="primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaSave /> {editingEvent ? 'Update' : 'Create'}
                  </Button>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default EventManager;
