import axios from 'axios';
import React, { createContext, useState } from 'react';

export type RequestFromAdmin = {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  GSTIN?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
};

export type EventRecord = {
    _id?: string;
    title: string;
    description: string;
    image: string;
    date: string;
    venue: string;
    time: string;
    ticket: unknown[]; // Adjust type if you know ticket structure
    volunteerCount: number;
    volunteersApplied: number;
    isTshirtAvailable: boolean;
    organiserId: string;
    createdAt?: string;
    updatedAt?: string;
    status?: 'pending' | 'approved' | 'rejected';
    __v?: number;
};

export type AdminContextType = {
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  approveOrganizer: (id: string) => Promise<RequestFromAdmin | null>;
  approveEvent: (id: string) => Promise<unknown>;
  fetchPendingOrganizers: () => Promise<RequestFromAdmin[]>;
  fetchPendingEvents: () => Promise<EventRecord[]>;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);
const server = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const approveOrganizer = async (_id: string) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // backend route: POST /api/admin/approve-organizer expects an id (controller reads params in some versions)
    // send id in body; if backend expects params it should be adjusted server-side.
    const res = await axios.post(`${server}/admin/approve-organizer`, { id: _id }, { headers });
    return res.data;
  };

  const approveEvent = async (_id: string) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.post(`${server}/admin/approve-event`, { eventId: _id }, { headers });
    return res.data;
  };
  const rejectEvent = async (_id: string) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.post(`${server}/admin/reject-event`, { eventId: _id }, { headers });
    return res.data;
  };

  const fetchPendingOrganizers = async () => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${server}/admin/pending-organizers`, { headers });
    if (res.status === 200) return res.data as RequestFromAdmin[];
    return [];
  };

  const fetchPendingEvents = async () => {
        try{
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${server}/admin/pending-events`, { headers });
            if (res.status === 200) return res.data as RequestFromAdmin[];
            return [];
        }
        catch(err){
            console.error(err);
        }
  };


  return (
    <AdminContext.Provider
      value={{ isAdmin, setIsAdmin, approveOrganizer, approveEvent, fetchPendingOrganizers, fetchPendingEvents, rejectEvent }}
    >
      {children}
    </AdminContext.Provider>
  );
};

// Note: `useAdmin` hook moved to its own file to avoid fast-refresh warnings.
export { AdminContext };
