import React, { useState } from 'react';
import { useTemplates } from '../../contexts/TemplateContext';
import ImageCertificateEditor, { type ImageTemplatePayload, type Placeholder } from './ImageCertificateEditor';
import { Plus, Edit3, Trash2, BookTemplate as FileTemplate, Eye, Code, Image, FileText } from 'lucide-react';

const TemplateManagement: React.FC = () => {
  const { templates, createTemplate, deleteTemplate, updateTemplate } = useTemplates();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<import('../../contexts/TemplateContext').Template | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImageTemplate, setEditingImageTemplate] = useState<import('../../contexts/TemplateContext').Template | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [creatingHtml, setCreatingHtml] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'html' as 'html' | 'pdf' | 'image',
    content: ''
  });

  const defaultHtmlTemplate = `
<div style="width: 700px; height: 500px; border: 4px solid #2563EB; padding: 25px; font-family: serif; text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); margin-right: 200px; position: relative;">
  <h1 style="color: #2563EB; font-size: 36px; margin-bottom: 15px;">Certificate of Achievement</h1>
  <div style="width: 120px; height: 4px; background: #2563EB; margin: 15px auto;"></div>
  <p style="font-size: 16px; margin: 15px 0;">This is to certify that</p>
  <h2 style="color: #1e40af; font-size: 28px; margin: 15px 0; text-decoration: underline;">{{ participant_name }}</h2>
  <p style="font-size: 16px; margin: 15px 0;">has successfully completed</p>
  <h3 style="color: #2563EB; font-size: 22px; margin: 15px 0;">{{ event_name }}</h3>
  <p style="font-size: 14px; margin: 15px 0;">on {{ event_date }}</p>
  <div style="margin-top: 40px;">
    <div style="display: inline-block; width: 180px; border-top: 2px solid #2563EB; text-align: center; padding-top: 10px;">
      <p style="font-size: 14px; margin: 0;">Authorized Signature</p>
    </div>
  </div>
  <p style="position: absolute; bottom: 15px; right: 15px; font-size: 12px; color: #64748b;">Certificate ID: {{ certificate_id }}</p>
</div>

  `;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const placeholders = extractPlaceholders(formData.content);
    setCreatingHtml(true);
    try {
      if (editingTemplateId) {
        await updateTemplate(editingTemplateId, {
          ...formData,
          placeholders
        });
        setEditingTemplateId(null);
      } else {
        await createTemplate({
          ...formData,
          placeholders
        });
      }
      setFormData({ name: '', type: 'html', content: '' });
      setShowCreateModal(false);
    } finally {
      setCreatingHtml(false);
    }
  };

  const extractPlaceholders = (content: string): string[] => {
    const regex = /\{\{\s*([^}]+)\s*\}\}/g;
    const placeholders: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      if (!placeholders.includes(match[1].trim())) {
        placeholders.push(match[1].trim());
      }
    }
    return placeholders;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'html':
        return <Code className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      default:
        return <FileTemplate className="h-5 w-5" />;
    }
  };

  const handleCreateNew = () => {
    setEditingTemplateId(null);
    setFormData({ name: '', type: 'html', content: defaultHtmlTemplate });
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template: import('../../contexts/TemplateContext').Template) => {
    // Prefill the create modal for editing
    setEditingTemplateId(template.id);
    setFormData({ name: template.name, type: template.type, content: template.content });
    setShowCreateModal(true);
  };

  const handleCreateImageTemplate = () => {
    setEditingImageTemplate(null);
    setShowImageEditor(true);
  };

  const handleEditImageTemplate = (template: import('../../contexts/TemplateContext').Template) => {
    setEditingImageTemplate(template);
    setShowImageEditor(true);
  };

  const handleSaveImageTemplate = async (templateData: ImageTemplatePayload) => {
    const placeholderNames = templateData.placeholders.map((p: Placeholder) => p.name);
    setSavingImage(true);
    try {
      if (editingImageTemplate) {
        await updateTemplate(editingImageTemplate.id, {
          name: templateData.name,
          type: 'image',
          content: JSON.stringify({ backgroundImage: templateData.backgroundImage, placeholders: templateData.placeholders }),
          placeholders: placeholderNames,
          backgroundImage: templateData.backgroundImage,
        });
      } else {
        await createTemplate({
          ...templateData,
          placeholders: placeholderNames
        });
      }
      setShowImageEditor(false);
      setEditingImageTemplate(null);
    } finally {
      setSavingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Templates</h1>
          <p className="text-gray-600">Create and manage certificate templates with placeholders</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleCreateImageTemplate}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 flex items-center"
          >
            <Image className="h-5 w-5 mr-2" />
            Image Template
          </button>
          <button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            HTML Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    {getTypeIcon(template.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{template.type} template</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {template.type === 'image' ? (
                    <button
                      onClick={() => handleEditImageTemplate(template)}
                      className="p-2 text-gray-400 hover:text-emerald-600 transition-colors duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-2 text-gray-400 hover:text-emerald-600 transition-colors duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Placeholders:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.placeholders.slice(0, 3).map((placeholder) => (
                      <span
                        key={placeholder}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {placeholder}
                      </span>
                    ))}
                    {template.placeholders.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{template.placeholders.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Modified: {new Date(template.lastModified).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create New Template</h2>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter template name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'html' | 'pdf' | 'image' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="html">HTML Template</option>
                      <option value="pdf">PDF Template</option>
                      <option value="image">Image Template</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Content
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="Enter your template content with placeholders like {{ participant_name }}"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Available Placeholders:</h4>
                  <div className="flex flex-wrap gap-2">
                    {['participant_name', 'event_name', 'event_date', 'certificate_id', 'organizer_name'].map((placeholder) => (
                      <code
                        key={placeholder}
                        className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                        onClick={() => {
                          const textarea = document.querySelector('textarea');
                          if (textarea) {
                            const cursorPosition = (textarea as HTMLTextAreaElement).selectionStart || 0;
                            const textBefore = formData.content.substring(0, cursorPosition);
                            const textAfter = formData.content.substring(cursorPosition);
                            const newContent = textBefore + `{{ ${placeholder} }}` + textAfter;
                            setFormData({ ...formData, content: newContent });
                          }
                        }}
                      >
                        {`{{ ${placeholder} }}`}
                      </code>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={creatingHtml}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={creatingHtml}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {creatingHtml && (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                )}
                {creatingHtml ? 'Creating...' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && previewTemplate.type !== 'image' && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Preview: {previewTemplate.name}
              </h2>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-auto bg-gray-50" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div
                  dangerouslySetInnerHTML={{
                    __html: previewTemplate.content
                      .replace(/\{\{\s*participant_name\s*\}\}/g, 'John Doe')
                      .replace(/\{\{\s*event_name\s*\}\}/g, 'Sample Event')
                      .replace(/\{\{\s*event_date\s*\}\}/g, new Date().toLocaleDateString())
                      .replace(/\{\{\s*certificate_id\s*\}\}/g, 'CERT-2025-001')
                      .replace(/\{\{\s*organizer_name\s*\}\}/g, 'Event Organizer')
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Template Preview Modal */}
      {previewTemplate && previewTemplate.type === 'image' && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Preview: {previewTemplate.name}
              </h2>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-auto bg-gray-50" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              <div className="bg-white p-8 rounded-lg shadow-sm flex justify-center">
                <div className="relative" style={{ width: '800px', height: '600px' }}>
                  {previewTemplate.backgroundImage && (
                    <img
                      src={previewTemplate.backgroundImage}
                      alt="Certificate background"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                  {(() => {
                    try {
                      const parsed = JSON.parse(previewTemplate.content || '{}') as { placeholders?: Placeholder[] };
                      return (parsed.placeholders || []).map((placeholder) => (
                        <div
                          key={placeholder.id}
                          className="absolute"
                          style={{
                            left: `${placeholder.x}px`,
                            top: `${placeholder.y}px`,
                            width: `${placeholder.width}px`,
                            height: `${placeholder.height}px`,
                            fontSize: `${placeholder.fontSize}px`,
                            fontFamily: placeholder.fontFamily,
                            color: placeholder.color,
                            fontWeight: placeholder.fontWeight,
                            textAlign: placeholder.textAlign,
                            transform: `rotate(${placeholder.rotation}deg)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: placeholder.textAlign === 'center' ? 'center' : placeholder.textAlign === 'right' ? 'flex-end' : 'flex-start',
                            lineHeight: '1.2'
                          }}
                        >
                          {placeholder.name === 'participant_name' ? 'John Doe' :
                           placeholder.name === 'event_name' ? 'Sample Event' :
                           placeholder.name === 'event_date' ? new Date().toLocaleDateString() :
                           placeholder.name === 'certificate_id' ? 'CERT-2025-001' :
                           placeholder.name === 'organizer_name' ? 'Event Organizer' :
                           placeholder.name === 'completion_date' ? new Date().toLocaleDateString() :
                           placeholder.name === 'event_description' ? 'Professional Development Workshop' :
                           placeholder.name}
                        </div>
                      ));
                    } catch {
                      return null;
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Certificate Editor */}
      {showImageEditor && (
        <ImageCertificateEditor
          onSave={handleSaveImageTemplate}
          onCancel={() => {
            if (savingImage) return; // prevent closing while saving
            setShowImageEditor(false);
            setEditingImageTemplate(null);
          }}
          initialTemplate={editingImageTemplate && editingImageTemplate.type === 'image' ? (() => {
            try {
              const parsed = JSON.parse(editingImageTemplate.content || '{}') as { backgroundImage?: string; placeholders?: Placeholder[] };
              return {
                name: editingImageTemplate.name,
                type: 'image' as const,
                backgroundImage: editingImageTemplate.backgroundImage || parsed.backgroundImage || '',
                placeholders: parsed.placeholders || [],
                content: editingImageTemplate.content,
              };
            } catch {
              return {
                name: editingImageTemplate.name,
                type: 'image' as const,
                backgroundImage: editingImageTemplate.backgroundImage || '',
                placeholders: [],
                content: editingImageTemplate.content,
              };
            }
          })() : null}
          saving={savingImage}
        />
      )}
    </div>
  );
};

export default TemplateManagement;