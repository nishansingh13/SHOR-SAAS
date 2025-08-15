import React, { useState, useRef, useCallback } from 'react';
import { Move, Type, Save, Eye, Upload, RotateCcw, Trash2 } from 'lucide-react';

export interface Placeholder {
  id: string;
  name: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
  width: number;
  height: number;
}

export interface ImageTemplatePayload {
  name: string;
  type: 'image';
  backgroundImage: string;
  placeholders: Placeholder[];
  content: string; // JSON string of { backgroundImage, placeholders }
}

interface ImageCertificateEditorProps {
  onSave: (template: ImageTemplatePayload) => void;
  onCancel: () => void;
  initialTemplate?: Partial<ImageTemplatePayload> | null;
  saving?: boolean;
}

const ImageCertificateEditor: React.FC<ImageCertificateEditorProps> = ({
  onSave,
  onCancel,
  initialTemplate,
  saving = false,
}) => {
  const [backgroundImage, setBackgroundImage] = useState<string>(initialTemplate?.backgroundImage || '');
  const [placeholders, setPlaceholders] = useState<Placeholder[]>(
    (initialTemplate?.placeholders as Placeholder[]) || []
  );
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<string | null>(null);
  const [draggedPlaceholder, setDraggedPlaceholder] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [templateName, setTemplateName] = useState(initialTemplate?.name || '');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availablePlaceholders = [
    'participant_name',
    'event_name',
    'event_date',
    'certificate_id',
    'organizer_name',
    'completion_date',
    'event_description'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addPlaceholder = (placeholderName: string) => {
    const newPlaceholder: Placeholder = {
      id: `${placeholderName}_${Date.now()}`,
      name: placeholderName,
      x: 100,
      y: 100,
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      fontWeight: 'normal',
      textAlign: 'center',
      rotation: 0,
      width: 200,
      height: 40
    };
    setPlaceholders(prev => [...prev, newPlaceholder]);
    setSelectedPlaceholder(newPlaceholder.id);
  };

  const updatePlaceholder = useCallback((id: string, updates: Partial<Placeholder>) => {
    setPlaceholders(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deletePlaceholder = (id: string) => {
    setPlaceholders(prev => prev.filter(p => p.id !== id));
    if (selectedPlaceholder === id) {
      setSelectedPlaceholder(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, placeholderId: string) => {
    e.preventDefault();
    setDraggedPlaceholder(placeholderId);
    setSelectedPlaceholder(placeholderId);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedPlaceholder || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updatePlaceholder(draggedPlaceholder, { x, y });
  }, [draggedPlaceholder, updatePlaceholder]);

  const handleMouseUp = () => {
    setDraggedPlaceholder(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedPlaceholder(null);
    }
  };

  const generatePreviewContent = (): Array<Placeholder & { text: string }> => {
    const sampleData: Record<string, string> = {
      participant_name: 'John Doe',
      event_name: 'Sample Event',
      event_date: new Date().toLocaleDateString(),
      certificate_id: 'CERT-2025-001',
      organizer_name: 'Event Organizer',
      completion_date: new Date().toLocaleDateString(),
      event_description: 'Professional Development Workshop'
    };

    return placeholders.map(placeholder => ({
      ...placeholder,
      text: sampleData[placeholder.name] || placeholder.name
    }));
  };

  const handleSave = () => {
    if (!templateName || !backgroundImage || placeholders.length === 0) {
      alert('Please provide a template name, background image, and at least one placeholder.');
      return;
    }

    const payload: ImageTemplatePayload = {
      name: templateName,
      type: 'image',
      backgroundImage,
      placeholders,
      content: JSON.stringify({ backgroundImage, placeholders })
    };

    onSave(payload);
  };

  const selectedPlaceholderData = placeholders.find(p => p.id === selectedPlaceholder);

  const itemsToRender: Array<Placeholder & { text: string }> = showPreview
    ? generatePreviewContent()
    : placeholders.map(p => ({ ...p, text: `{{ ${p.name} }}` }));

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Image Certificate Editor</h2>
            <p className="text-sm text-gray-600">Design your certificate by positioning placeholders on the background image</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center"
              disabled={saving}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Edit Mode' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>}
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Template'}
            </button>
            <button
              onClick={onCancel}
              disabled={saving}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="flex h-full" style={{ height: 'calc(95vh - 80px)' }}>
          {/* Left Sidebar - Controls */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter template name"
                />
              </div>

              {/* Background Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors duration-200"
                    disabled={saving}
                  >
                    <Upload className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {backgroundImage ? 'Change Image' : 'Upload Background'}
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={saving}
                  />
                  {backgroundImage && (
                    <div className="relative">
                      <img
                        src={backgroundImage}
                        alt="Background preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Available Placeholders */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Placeholders
                </label>
                <div className="space-y-2">
                  {availablePlaceholders.map((placeholder) => (
                    <button
                      key={placeholder}
                      onClick={() => addPlaceholder(placeholder)}
                      disabled={placeholders.some(p => p.name === placeholder) || saving}
                      className="w-full flex items-center px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Type className="h-4 w-4 mr-2 text-gray-400" />
                      {placeholder.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Placeholder Properties */}
              {selectedPlaceholderData && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Editing: {selectedPlaceholderData.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
                        <input
                          type="number"
                          value={selectedPlaceholderData.fontSize}
                          onChange={(e) => updatePlaceholder(selectedPlaceholderData.id, { fontSize: parseInt(e.target.value) })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min="8"
                          max="72"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                        <input
                          type="color"
                          value={selectedPlaceholderData.color}
                          onChange={(e) => updatePlaceholder(selectedPlaceholderData.id, { color: e.target.value })}
                          className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Font Family</label>
                      <select
                        value={selectedPlaceholderData.fontFamily}
                        onChange={(e) => updatePlaceholder(selectedPlaceholderData.id, { fontFamily: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Times New Roman, serif">Times New Roman</option>
                        <option value="Helvetica, sans-serif">Helvetica</option>
                        <option value="Courier New, monospace">Courier New</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Font Weight</label>
                      <select
                        value={selectedPlaceholderData.fontWeight}
                        onChange={(e) => updatePlaceholder(selectedPlaceholderData.id, { fontWeight: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="lighter">Light</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Text Align</label>
                      <select
                        value={selectedPlaceholderData.textAlign}
                        onChange={(e) => updatePlaceholder(selectedPlaceholderData.id, { textAlign: e.target.value as 'left' | 'center' | 'right' })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
                        <input
                          type="number"
                          value={selectedPlaceholderData.width}
                          onChange={(e) => updatePlaceholder(selectedPlaceholderData.id, { width: parseInt(e.target.value) })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min="50"
                          max="500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
                        <input
                          type="number"
                          value={selectedPlaceholderData.height}
                          onChange={(e) => updatePlaceholder(selectedPlaceholderData.id, { height: parseInt(e.target.value) })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min="20"
                          max="200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Rotation: {selectedPlaceholderData.rotation}°
                      </label>
                      <input
                        type="range"
                        value={selectedPlaceholderData.rotation}
                        onChange={(e) => updatePlaceholder(selectedPlaceholderData.id, { rotation: parseInt(e.target.value) })}
                        className="w-full"
                        min="-45"
                        max="45"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => updatePlaceholder(selectedPlaceholderData.id, { rotation: 0 })}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset
                      </button>
                      <button
                        onClick={() => deletePlaceholder(selectedPlaceholderData.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 overflow-auto bg-gray-100 p-6">
            <div className="flex justify-center">
              {backgroundImage ? (
                <div
                  ref={canvasRef}
                  className="relative bg-white shadow-lg rounded-lg overflow-hidden cursor-crosshair"
                  style={{ width: '800px', height: '600px' }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onClick={handleCanvasClick}
                >
                  {/* Background Image */}
                  <img
                    src={backgroundImage}
                    alt="Certificate background"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />

                  {/* Placeholders */}
                  {itemsToRender.map((placeholder) => (
                    <div
                      key={placeholder.id}
                      className={`
                        absolute cursor-move select-none border-2 transition-all duration-200
                        ${selectedPlaceholder === placeholder.id 
                          ? 'border-blue-500 bg-blue-50 bg-opacity-50' 
                          : 'border-transparent hover:border-blue-300 hover:bg-blue-50 hover:bg-opacity-30'
                        }
                        ${showPreview ? 'border-transparent hover:border-transparent' : ''}
                      `}
                      style={{
                        left: `${placeholder.x}px`,
                        top: `${placeholder.y}px`,
                        width: `${placeholder.width}px`,
                        height: `${placeholder.height}px`,
                        fontSize: `${placeholder.fontSize}px`,
                        fontFamily: placeholder.fontFamily,
                        color: placeholder.color,
                        fontWeight: placeholder.fontWeight,
                        textAlign: placeholder.textAlign as React.CSSProperties['textAlign'],
                        transform: `rotate(${placeholder.rotation}deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: placeholder.textAlign === 'center' ? 'center' : placeholder.textAlign === 'right' ? 'flex-end' : 'flex-start',
                        padding: '4px',
                        lineHeight: '1.2'
                      }}
                      onMouseDown={(e) => !showPreview && handleMouseDown(e, placeholder.id)}
                    >
                      {placeholder.text}
                      
                      {/* Resize Handle */}
                      {selectedPlaceholder === placeholder.id && !showPreview && (
                        <div
                          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            // Handle resize logic here
                          }}
                        />
                      )}
                    </div>
                  ))}

                  {/* Grid Overlay (only in edit mode) */}
                  {!showPreview && (
                    <div className="absolute inset-0 pointer-events-none opacity-10">
                      <svg width="100%" height="100%">
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#000" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Upload a background image to start designing</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      disabled={saving}
                    >
                      Choose Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Placeholder List */}
          <div className="w-64 bg-gray-50 border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Placeholders</h3>
              <div className="space-y-2">
                {placeholders.map((placeholder) => (
                  <div
                    key={placeholder.id}
                    className={`
                      p-3 bg-white rounded-lg border cursor-pointer transition-all duration-200
                      ${selectedPlaceholder === placeholder.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    onClick={() => setSelectedPlaceholder(placeholder.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Move className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {placeholder.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaceholder(placeholder.id);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                        disabled={saving}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Position: {Math.round(placeholder.x)}, {Math.round(placeholder.y)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Size: {placeholder.fontSize}px, {placeholder.fontWeight}
                    </div>
                  </div>
                ))}
                
                {placeholders.length === 0 && (
                  <div className="text-center py-8">
                    <Type className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No placeholders added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCertificateEditor;