import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useTemplates } from '../../contexts/TemplateContext';
import ImageCertificateEditor, { type ImageTemplatePayload, type Placeholder } from './ImageCertificateEditor';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  BookTemplate as FileTemplate, 
  Eye, 
  Code, 
  Image, 
  FileText,
  Star,
  TrendingUp,
  Layers,
  Palette
} from 'lucide-react';

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

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  // Calculate statistics
  const totalTemplates = templates.length;
  const htmlTemplates = templates.filter(t => t.type === 'html').length;
  const imageTemplates = templates.filter(t => t.type === 'image').length;
  const pdfTemplates = templates.filter(t => t.type === 'pdf').length;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
      {/* SETU Header */}
      <motion.div 
        className="bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-700 text-white"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.div 
                className="flex items-center mb-4"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Certificate Templates</h1>
                  <p className="text-emerald-100 text-sm">SETU Certificate Platform</p>
                </div>
              </motion.div>
              <motion.p 
                className="text-blue-100 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Design beautiful certificate templates with dynamic placeholders for your programs
              </motion.p>
            </div>
            
            <div className="flex space-x-3">
              <motion.button
                onClick={handleCreateImageTemplate}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center font-medium shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Image className="h-5 w-5 mr-2" />
                Image Template
              </motion.button>
              <motion.button
                onClick={handleCreateNew}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center font-medium shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Plus className="h-5 w-5 mr-2" />
                HTML Template
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          data-aos="fade-up"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{totalTemplates}</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">Total Templates</p>
            <p className="text-xs text-emerald-600 mt-2 font-medium">All Designs</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Code className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{htmlTemplates}</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">HTML Templates</p>
            <p className="text-xs text-blue-600 mt-2 font-medium">Code-Based</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Image className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{imageTemplates}</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">Image Templates</p>
            <p className="text-xs text-purple-600 mt-2 font-medium">Visual Design</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{pdfTemplates}</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">PDF Templates</p>
            <p className="text-xs text-amber-600 mt-2 font-medium">Document Format</p>
          </motion.div>
        </motion.div>

        {/* Templates Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          data-aos="fade-up"
          data-aos-delay="200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {templates.length > 0 ? templates.map((template, index) => (
            <motion.div 
              key={template.id} 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + (index * 0.1), duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              {/* Template Type Banner */}
              <div className={`h-2 ${
                template.type === 'html' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : ''
              }${template.type === 'image' ? 'bg-gradient-to-r from-purple-500 to-emerald-600' : ''}${
                template.type === 'pdf' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : ''
              }`} />
              
              <div className="p-6">
                {/* Header with Type Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-3 ${
                      template.type === 'html' ? 'bg-blue-100 text-blue-600' : ''
                    }${template.type === 'image' ? 'bg-purple-100 text-purple-600' : ''}${
                      template.type === 'pdf' ? 'bg-amber-100 text-amber-600' : ''
                    }`}>
                      {getTypeIcon(template.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize font-medium">{template.type} template</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <motion.button
                      onClick={() => setPreviewTemplate(template)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Eye className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => template.type === 'image' ? handleEditImageTemplate(template) : handleEditTemplate(template)}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Placeholders */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Palette className="h-4 w-4 mr-2 text-emerald-600" />
                    Placeholders:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.placeholders.slice(0, 3).map((placeholder) => (
                      <span
                        key={placeholder}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800"
                      >
                        {placeholder}
                      </span>
                    ))}
                    {template.placeholders.length > 3 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        +{template.placeholders.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-1 text-amber-500" />
                      Created {new Date(template.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                      Modified {new Date(template.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )) : (
            <motion.div 
              className="col-span-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="h-20 w-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Palette className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Templates Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Get started by creating your first certificate template for your educational programs
                </p>
                <div className="flex space-x-3 justify-center">
                  <motion.button
                    onClick={handleCreateImageTemplate}
                    className="bg-gradient-to-r from-purple-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-emerald-700 transition-all duration-300 flex items-center font-medium shadow-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image className="h-5 w-5 mr-2" />
                    Image Template
                  </motion.button>
                  <motion.button
                    onClick={handleCreateNew}
                    className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-300 flex items-center font-medium shadow-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    HTML Template
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Create Template Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-blue-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {editingTemplateId ? 'Edit Template' : 'Create New Template'}
                      </h2>
                      <p className="text-emerald-100 text-sm">SETU Certificate Platform</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setShowCreateModal(false)}
                    className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Template Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        placeholder="Enter template name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Template Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'html' | 'pdf' | 'image' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
                      >
                        <option value="html">HTML Template</option>
                        <option value="pdf">PDF Template</option>
                        <option value="image">Image Template</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Template Content
                    </label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={18}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm transition-all duration-200 resize-none"
                      placeholder="Enter your template content with placeholders like {{ participant_name }}"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <FileText className="h-5 w-5 text-emerald-600 mr-2" />
                      <h4 className="text-sm font-bold text-gray-800">Available Placeholders:</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['participant_name', 'event_name', 'event_date', 'certificate_id', 'organizer_name'].map((placeholder) => (
                        <motion.button
                          key={placeholder}
                          type="button"
                          className="flex items-center px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
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
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {`{{ ${placeholder} }}`}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-4">
                <motion.button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingHtml}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={creatingHtml}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-700 text-white rounded-xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg flex items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {creatingHtml ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {editingTemplateId ? 'Update Template' : 'Create Template'}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && previewTemplate.type !== 'image' && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setPreviewTemplate(null)}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-r from-emerald-600 to-blue-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Preview: {previewTemplate.name}
                      </h2>
                      <p className="text-emerald-100 text-sm">Template Preview - SETU Platform</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setPreviewTemplate(null)}
                    className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>
              </div>
              
              <div className="p-8 overflow-auto bg-gradient-to-br from-gray-50 to-emerald-50" style={{ maxHeight: 'calc(90vh - 100px)' }}>
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Template Preview Modal */}
      <AnimatePresence>
        {previewTemplate && previewTemplate.type === 'image' && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setPreviewTemplate(null)}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-r from-purple-600 to-emerald-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                      <Image className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Preview: {previewTemplate.name}
                      </h2>
                      <p className="text-purple-100 text-sm">Image Template Preview - SETU Platform</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setPreviewTemplate(null)}
                    className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>
              </div>
              
              <div className="p-8 overflow-auto bg-gradient-to-br from-gray-50 to-purple-50" style={{ maxHeight: 'calc(90vh - 100px)' }}>
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 flex justify-center">
                  <div className="relative shadow-2xl rounded-xl overflow-hidden" style={{ width: '800px', height: '600px' }}>
                    {previewTemplate.backgroundImage && (
                      <img
                        src={previewTemplate.backgroundImage}
                        alt="Certificate background"
                        className="w-full h-full object-cover"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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