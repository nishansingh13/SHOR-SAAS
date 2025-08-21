import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useAdmin from '../../contexts/useAdmin';

type RequestFromAdmin = {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  GSTIN?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
};

type EventRecord = { _id?: string; id?: string; title?: string; name?: string; organiser?: string; organiserId?: string };

const AdminApproval: React.FC = () => {
  const { user } = useAuth();
  const { approveOrganizer, approveEvent, fetchPendingOrganizers, fetchPendingEvents } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [organizers, setOrganizers] = useState<RequestFromAdmin[]>([]);
  const [events, setEvents] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [orgData, evtData] = await Promise.all([
          fetchPendingOrganizers(),
          fetchPendingEvents(),
        ]);
    setOrganizers(orgData || []);
    setEvents((evtData as unknown[] | undefined) || []);
      } catch (err: unknown) {
        console.error('Failed to load approvals', err);
        const message = err instanceof Error ? err.message : String(err);
        setError(message || 'Failed to load approvals');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchPendingOrganizers, fetchPendingEvents]);

  const handleApproveEvent = async (id: string) => {
     console.log(id)
    await approveEvent(id)
      .then(() => {
        setEvents(prev => prev.filter(e => (e as EventRecord)._id !== id));
      })
      .catch(err => {
        console.error('Failed to approve event', err);
        alert('Failed to approve event');
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Approvals</h1>
          <p className="text-sm text-gray-600">Approve newly registered organizers and events</p>
        </div>
      </div>

      { loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold mb-3">Pending Organizers</h2>
            {organizers.length === 0 ? (
              <p className="text-sm text-gray-500">No pending organizers</p>
            ) : (
              <ul className="space-y-3">
                {organizers.map(org => {
                  const id = org._id || org.id || '';
                  return (
                  <li key={id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{org.name}</div>
                      <div className="text-sm text-gray-500">{org.email} {org.GSTIN ? `· GSTIN: ${org.GSTIN}` : ''}</div>
                      <div className="text-xs text-gray-400">Status: {org.status || 'pending'}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={async () => {
                        try {
                          await approveOrganizer(id);
                          setOrganizers(prev => prev.filter(o => (o._id || o.id) !== id));
                        } catch (e) {
                          console.error(e);
                          alert('Failed to approve organizer');
                        }
                      }} className="px-3 py-1 bg-emerald-600 text-white rounded">Approve</button>
                    </div>
                  </li>
                )})}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold mb-3">Pending Events</h2>
                {events.length === 0 ? (
              <p className="text-sm text-gray-500">No pending events</p>
            ) : (
              <ul className="space-y-3">
                {events.map((ev) => {
                  const e = ev as unknown as EventRecord;
                  const id = e._id || e.id || '';
                  return (
                    <li key={id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{e.title || e.name}</div>
                        <div className="text-sm text-gray-500">Created by: {e.organiser || e.organiserId}</div>
                      </div>
                      <div className="flex items-center space-x-2">
            <button onClick={async () => {
              await handleApproveEvent(id); 
            }} className="px-3 py-1 bg-emerald-600 text-white rounded">Approve</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApproval;
