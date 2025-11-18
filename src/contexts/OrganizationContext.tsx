import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface Organization {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  website?: string;
  isActive: boolean;
  owner: string;
  members: Array<{
    user: string;
    role: 'admin' | 'organizer' | 'staff';
    joinedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface OrganizationContextType {
  organization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  createOrganization: (data: Partial<Organization>) => Promise<void>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<void>;
  addMember: (id: string, email: string, role: string) => Promise<void>;
  removeMember: (id: string, memberId: string) => Promise<void>;
  refreshOrganization: () => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const refreshOrganization = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_BASE}/organizations/my-organization`, {
        headers: getAuthHeaders(),
      });
      setOrganization(response.data);
    } catch (error: unknown) {
      if ((error as { response?: { status?: number } }).response?.status !== 404) {
        console.error('Error fetching organization:', error);
      }
      setOrganization(null);
    }
  };

  const refreshOrganizations = async () => {
    if (!user || user.role !== 'admin') return;
    try {
      const response = await axios.get(`${API_BASE}/organizations`, {
        headers: getAuthHeaders(),
      });
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (user) {
        await refreshOrganization();
        if (user.role === 'admin') {
          await refreshOrganizations();
        }
      }
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const createOrganization = async (data: Partial<Organization>) => {
    try {
      const response = await axios.post(`${API_BASE}/organizations`, data, {
        headers: getAuthHeaders(),
      });
      setOrganization(response.data);
      toast.success('Organization created successfully');
      await refreshOrganization();
    } catch (error: unknown) {
      console.error('Error creating organization:', error);
      toast.error((error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to create organization');
      throw error;
    }
  };

  const updateOrganization = async (id: string, data: Partial<Organization>) => {
    try {
      await axios.put(`${API_BASE}/organizations/${id}`, data, {
        headers: getAuthHeaders(),
      });
      toast.success('Organization updated successfully');
      await refreshOrganization();
    } catch (error: unknown) {
      console.error('Error updating organization:', error);
      toast.error((error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to update organization');
      throw error;
    }
  };

  const addMember = async (id: string, email: string, role: string) => {
    try {
      await axios.post(`${API_BASE}/organizations/${id}/members`, { email, role }, {
        headers: getAuthHeaders(),
      });
      toast.success('Member added successfully');
      await refreshOrganization();
    } catch (error: unknown) {
      console.error('Error adding member:', error);
      toast.error((error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to add member');
      throw error;
    }
  };

  const removeMember = async (id: string, memberId: string) => {
    try {
      await axios.delete(`${API_BASE}/organizations/${id}/members/${memberId}`, {
        headers: getAuthHeaders(),
      });
      toast.success('Member removed successfully');
      await refreshOrganization();
    } catch (error: unknown) {
      console.error('Error removing member:', error);
      toast.error((error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to remove member');
      throw error;
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizations,
        loading,
        createOrganization,
        updateOrganization,
        addMember,
        removeMember,
        refreshOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
