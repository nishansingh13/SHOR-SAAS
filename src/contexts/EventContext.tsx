import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
  
export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  status: 'active' | 'draft' | 'completed' | 'pending';
  participantCount: number;
  certificatesGenerated: number;
  createdAt: string;
  organizer: string;
  image?: string;
  venue?: string;
  time?: string;
  volunteerCount?: number;
  volunteersApplied?: number;
  isTshirtAvailable?: boolean;
  ticket?: Array<{ name: string; price: number; _id?: string }>;
}

interface EmailTemplate {
  subject: string;
  content: string;
}

interface EventContextType {
  events: Event[];
  publicEvents: Event[];
  selectedEvent: Event | null;
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'participantCount' | 'certificatesGenerated'>) => void;
  updateEvent: (id: string, event: Partial<Event>, backendOverride?: Partial<BackendEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  selectEvent: (event: Event | null) => void;
  refreshEvents: () => Promise<void>;
  refreshPublicEvents: () => Promise<void>;
  getRawEventById: (id: string) => BackendEvent | undefined;
  emailTemplate: EmailTemplate;
  setEmailTemplate: (template: EmailTemplate) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface BackendEvent {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  date?: string | Date;
  image?: string;
  venue?: string;
  time?: string;
  ticket?: Array<{ name: string; price: number }>;
  volunteerCount?: number;
  isTshirtAvailable?: boolean;
  participantCount?: number;
  certificatesGenerated?: number;
  createdAt?: string | Date;
  organizer?: string;
  organiserId?: string;
  status?: string;
}

const mapBackendToEvent = (e: BackendEvent): Event => ({
  id: e._id || e.id || String(Math.random()),
  name: e.title ?? e.name ?? 'Untitled',
  description: e.description ?? '',
  date: e.date ? new Date(e.date).toISOString() : new Date().toISOString(),
  status: ((): Event['status'] => {
    const s = e.status ?? e['status'];
    if (s === 'active' || s === 'draft' || s === 'completed' || s === 'pending') return s as Event['status'];
    return 'pending';
  })(),
  participantCount: e.participantCount ?? 0,
  certificatesGenerated: e.certificatesGenerated ?? 0,
  createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
  organizer: e.organizer ?? (e.organiserId ? String(e.organiserId) : 'Organizer'),
  image: e.image,
  venue: e.venue,
  time: e.time,
  volunteerCount: e.volunteerCount,
  volunteersApplied: 0,
  isTshirtAvailable: e.isTshirtAvailable,
  ticket: e.ticket,
});

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [publicEvents, setPublicEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rawEventsMap, setRawEventsMap] = useState<Record<string, BackendEvent>>({});
  const [emailTemplate, setEmailTemplate] = useState({
      subject: 'Your Certificate for {{ event_name }}',
      content: `Dear {{ participant_name }},
  
  Congratulations on successfully completing {{ event_name }}!
  
  Please find your certificate of completion attached to this email. This certificate validates your participation and successful completion of the program.
  
  Event Details:
  - Event: {{ event_name }}
  - Date: {{ event_date }}
  - Certificate ID: {{ certificate_id }}
  
  Thank you for your participation!
  
  Best regards,
  {{ organizer_name }}`
    });
  const refreshEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        setEvents([]);
        setRawEventsMap({});
        return;
      }
      const response = await axios.get(`${API_BASE}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: BackendEvent[] = response.data;
  const mapped: Event[] = Array.isArray(data) ? data.map(mapBackendToEvent) : [];
      setEvents(mapped);
      const nextMap: Record<string, BackendEvent> = {};
      for (const e of data || []) {
        const key = e._id || e.id;
        if (key) nextMap[key] = e;
      }
      setRawEventsMap(nextMap);
      console.log(`Loaded ${mapped.length} managed events, participantCounts:`, mapped.map(e => ({ id: e.id, count: e.participantCount })));
    } catch (err) {
      console.error('Error loading managed events:', err);
      setEvents([]);
      setRawEventsMap({});
    }
  }, [user]);

  const refreshPublicEvents = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/public/events`);
      const data: BackendEvent[] = response.data;
      const mapped: Event[] = Array.isArray(data) ? data.map(mapBackendToEvent) : [];
      setPublicEvents(mapped);
      
      console.log(`Loaded ${mapped.length} public events`);
    } catch (err) {
      console.error('Error loading public events:', err);
      setPublicEvents([]);
    }
  }, []);

  useEffect(() => {
    refreshPublicEvents();
    
    if (user) {
      refreshEvents();
    }
  }, [refreshEvents, refreshPublicEvents, user]);

  const createEvent = (eventData: Omit<Event, 'id' | 'createdAt' | 'participantCount' | 'certificatesGenerated'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      participantCount: 0,
      certificatesGenerated: 0
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = async (id: string, eventData: Partial<Event>, backendOverride?: Partial<BackendEvent>) => {
    const existing = rawEventsMap[id];

    if (!existing) {
      setEvents(prev => prev.map(event => event.id === id ? { ...event, ...eventData } : event));
      return;
    }

    const payload: BackendEvent = {
      title: backendOverride?.title ?? eventData.name ?? existing.title ?? existing.name ?? 'Untitled',
      description: backendOverride?.description ?? eventData.description ?? existing.description ?? '',
      date: backendOverride?.date ?? (eventData.date ? new Date(eventData.date).toISOString() : existing.date),
      image: backendOverride?.image ?? existing.image ?? '',
      venue: backendOverride?.venue ?? existing.venue ?? '',
      time: backendOverride?.time ?? existing.time ?? '',
      ticket: backendOverride?.ticket ?? existing.ticket ?? [],
      volunteerCount: backendOverride?.volunteerCount ?? existing.volunteerCount ?? 0,
      isTshirtAvailable: backendOverride?.isTshirtAvailable ?? existing.isTshirtAvailable ?? true,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE}/events/${id}`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      console.log('Event updated successfully:', response.data);
      await refreshEvents();
    } catch (err) {
      console.error('Update failed, applying local update:', err);
      setEvents(prev => prev.map(event => event.id === id ? { ...event, ...eventData } : event));
    }
  };

  const deleteEvent = async (id: string) => {
    const isLocalOnly = !rawEventsMap[id];
    if (isLocalOnly) {
      setEvents(prev => prev.filter(e => e.id !== id));
      if (selectedEvent?.id === id) setSelectedEvent(null);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE}/events/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      console.log('Event deleted successfully:', response.data);
      setEvents(prev => prev.filter(e => e.id !== id));
      setRawEventsMap(prev => {
        const rest = { ...prev };
        delete rest[id];
        return rest;
      });
      if (selectedEvent?.id === id) setSelectedEvent(null);
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const selectEvent = (event: Event | null) => {
    setSelectedEvent(event);
  };

  const getRawEventById = (id: string) => rawEventsMap[id];

  return (
    <EventContext.Provider value={{
      events,
      publicEvents,
      selectedEvent,
      createEvent,
      updateEvent,
      deleteEvent,
      selectEvent,
      refreshEvents,
      refreshPublicEvents,
      getRawEventById,
      emailTemplate,
      setEmailTemplate: (template: EmailTemplate) => setEmailTemplate(template),
    }}>
      {children}
    </EventContext.Provider>
  );
};