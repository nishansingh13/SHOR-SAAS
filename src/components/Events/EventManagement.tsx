import React, { useState } from 'react';
import { useEvents } from '../../contexts/EventContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Event as AppEvent } from '../../contexts/EventContext';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Users, 
  Award,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const EventManagement: React.FC = () => {
  const { events, createEvent, updateEvent, deleteEvent, refreshEvents, getRawEventById } = useEvents();
  const { user } = useAuth();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AppEvent | null>(null);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    date: '',
    venue: '',
    time: '',
    ticket: [{ name: '', price: 0 } as { name: string; price: number }],
    volunteerCount: 0,
    isTshirtAvailable: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    const payload = {
      title: formData.title,
      description: formData.description,
      image: formData.image,
      date: formData.date,
      venue: formData.venue,
      time: formData.time,
      ticket: formData.ticket,
      volunteerCount: formData.volunteerCount,
      isTshirtAvailable: formData.isTshirtAvailable,
      organiserId: user?.id // Add the organiser ID from the logged-in user
    };

    if (editingEvent) {
      const mapped = {
        name: formData.title,
        description: formData.description,
        date: formData.date,
        status: 'draft' as const,
        organizer: user?.name || '',
      };
      try {
        await updateEvent(editingEvent.id, mapped, payload);
      } catch {
        setError('Failed to update event');
      }
      setEditingEvent(null);
    } else {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/events`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create event');
        await refreshEvents();
      } catch (err) {
        console.error(err);
        setError('Failed to create event');
        // Fallback to local add so UI isn’t blocked
        const mapped = {
          name: formData.title,
          description: formData.description,
          date: formData.date,
          status: 'draft' as const,
          organizer: user?.name || '',
        };
        createEvent(mapped);
      }
    }

    setFormData({
      title: '',
      description: '',
      image: '',
      date: '',
      venue: '',
      time: '',
      ticket: [{ name: '', price: 0 }],
      volunteerCount: 0,
      isTshirtAvailable: true,
    });
    setShowCreateModal(false);
  };

  const handleEdit = (event: AppEvent) => {
    setEditingEvent(event);
    const raw = getRawEventById(event.id);

    const dateVal = raw?.date ?? event.date;
    let dateForInput = '';
    if (dateVal) {
      const iso = new Date(typeof dateVal === 'string' || dateVal instanceof Date ? dateVal : String(dateVal)).toISOString();
      dateForInput = iso.slice(0, 10);
    }

    setFormData({
      title: (raw?.title ?? event.name) || '',
      description: (raw?.description ?? event.description) || '',
      image: raw?.image ?? '',
      date: dateForInput,
      venue: raw?.venue ?? '',
      time: raw?.time ?? '',
      ticket: raw?.ticket && raw.ticket.length > 0
        ? raw.ticket.map(t => ({ name: t.name || '', price: Number(t.price) || 0 }))
        : [{ name: '', price: 0 }],
      volunteerCount: typeof raw?.volunteerCount === 'number' ? raw.volunteerCount : 0,
      isTshirtAvailable: typeof raw?.isTshirtAvailable === 'boolean' ? raw.isTshirtAvailable : true,
    });
    setShowCreateModal(true);
  };

  const handleCancel = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      date: '',
      venue: '',
      time: '',
      ticket: [{ name: '', price: 0 }],
      volunteerCount: 0,
      isTshirtAvailable: true,
    });
  };

  const getStatusIcon = (status: string) => {
      console.log(status);
    switch (status) {
    
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <Award className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const addTicket = () => {
    setFormData((prev) => ({ ...prev, ticket: [...prev.ticket, { name: '', price: 0 }] }));
  };

  const removeTicket = (index: number) => {
    setFormData((prev) => ({ ...prev, ticket: prev.ticket.filter((_, i) => i !== index) }));
  };

  const updateTicket = (index: number, field: 'name' | 'price', value: string) => {
    setFormData((prev) => ({
      ...prev,
      ticket: prev.ticket.map((t, i) =>
        i === index ? { ...t, [field]: field === 'price' ? Number(value) : value.toUpperCase() } : t
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600">Create and manage your events and programs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(event.status)}
                  <span className={`
                    ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${event.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    ${event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${event.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                  `}>
                    {event.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  {event.participantCount} participants
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Award className="h-4 w-4 mr-2" />
                  {event.certificatesGenerated} certificates generated
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Created by {event.organizer} on {new Date(event.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>

              {error && (
                <div className="mb-3 text-sm text-red-600" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter venue"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tickets
                    </label>
                    <button
                      type="button"
                      onClick={addTicket}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Ticket
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.ticket.map((ticket, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-7">
                          <label className="block text-xs text-gray-600 mb-1">Name</label>
                          <input
                            type="text"
                            required
                            value={ticket.name}
                            onChange={(e) => updateTicket(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="GENERAL / VIP"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-xs text-gray-600 mb-1">Price</label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            required
                            value={ticket.price}
                            onChange={(e) => updateTicket(index, 'price', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1">
                          {formData.ticket.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTicket(index)}
                              className="px-2 py-2 text-red-600 hover:text-red-700"
                              aria-label="Remove ticket"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volunteer Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formData.volunteerCount}
                      onChange={(e) => setFormData({ ...formData, volunteerCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      id="tshirt"
                      type="checkbox"
                      checked={formData.isTshirtAvailable}
                      onChange={(e) => setFormData({ ...formData, isTshirtAvailable: e.target.checked })}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="tshirt" className="ml-2 block text-sm text-gray-700">
                      T-Shirt Available
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;