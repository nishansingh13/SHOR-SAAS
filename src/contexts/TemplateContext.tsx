import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Template {
  id: string;
  name: string;
  type: 'html' | 'pdf' | 'image';
  content: string;
  placeholders: string[];
  previewUrl?: string;
  backgroundImage?: string;
  createdAt: string;
  lastModified: string;
}

interface TemplateContextType {
  templates: Template[];
  selectedTemplate: Template | null;
  createTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'lastModified'>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  selectTemplate: (template: Template | null) => void;
  refreshTemplates: () => Promise<void>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTemplates = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

type BackendTemplate = {
  _id?: string;
  id?: string;
  name: string;
  type: 'html' | 'pdf' | 'image';
  content: string;
  placeholders?: string[];
  previewUrl?: string;
  backgroundImage?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

const mapBackendToTemplate = (t: BackendTemplate): Template => ({
  id: t._id || t.id || String(Math.random()),
  name: t.name,
  type: t.type,
  content: t.content,
  placeholders: t.placeholders || [],
  previewUrl: t.previewUrl,
  backgroundImage: t.backgroundImage,
  createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
  lastModified: t.updatedAt ? new Date(t.updatedAt).toISOString() : new Date().toISOString(),
});

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const refreshTemplates = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTemplates([]);
      return;
    }
    try {
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API_BASE}/templates`, { headers });
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data: BackendTemplate[] = await res.json();
      setTemplates(Array.isArray(data) ? data.map(mapBackendToTemplate) : []);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshTemplates();
    } else {
      setTemplates([]);
    }
  }, []);

  const createTemplate = async (templateData: Omit<Template, 'id' | 'createdAt' | 'lastModified'>) => {
    try {
      const payload: BackendTemplate = {
        name: templateData.name,
        type: templateData.type,
        content: templateData.content,
        placeholders: templateData.placeholders,
        previewUrl: templateData.previewUrl,
        backgroundImage: templateData.backgroundImage,
      };
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create template');
      await refreshTemplates();
    } catch (err) {
      console.error('Create template failed:', err);
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<Template>) => {
    try {
      const payload: Partial<BackendTemplate> = {
        name: templateData.name,
        type: templateData.type,
        content: templateData.content,
        placeholders: templateData.placeholders,
        previewUrl: templateData.previewUrl,
        backgroundImage: templateData.backgroundImage,
      };
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update template');
      await refreshTemplates();
    } catch (err) {
      console.error('Update template failed:', err);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const headersDel: Record<string, string> | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;
      const res = await fetch(`${API_BASE}/templates/${id}`, { 
        method: 'DELETE',
        headers: headersDel,
      });
      if (!res.ok) throw new Error('Failed to delete template');
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (selectedTemplate?.id === id) setSelectedTemplate(null);
    } catch (err) {
      console.error('Delete template failed:', err);
    }
  };

  const selectTemplate = (template: Template | null) => {
    setSelectedTemplate(template);
  };

  return (
    <TemplateContext.Provider value={{
      templates,
      selectedTemplate,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      selectTemplate,
      refreshTemplates,
    }}>
      {children}
    </TemplateContext.Provider>
  );
};