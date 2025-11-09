import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  Building2, 
  User, 
  CreditCard, 
  FileText, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

interface OrganizerFormData {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  
  organizationName: string;
  organizationType: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  
  panCard: string | null;
  gstCertificate: string | null;
  bankStatement: string | null;
  organizationLicense: string | null;
  
  previousExperience: string;
  expectedEventsPerYear: string;
  reasonForJoining: string;
}

const OrganizerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrganizerFormData>({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    organizationName: '',
    organizationType: 'company',
    website: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    panCard: null,
    gstCertificate: null,
    bankStatement: null,
    organizationLicense: null,
    previousExperience: '',
    expectedEventsPerYear: '',
    reasonForJoining: ''
  });

  const steps = [
    { 
      id: 1, 
      title: 'Personal Information', 
      icon: User,
      description: 'Basic personal details and contact information'
    },
    { 
      id: 2, 
      title: 'Organization Details', 
      icon: Building2,
      description: 'Information about your organization'
    },
    { 
      id: 3, 
      title: 'Banking Information', 
      icon: CreditCard,
      description: 'Bank details for payments and settlements'
    },
    { 
      id: 4, 
      title: 'Document Upload', 
      icon: Upload,
      description: 'Upload required documents for verification'
    },
    { 
      id: 5, 
      title: 'Additional Information', 
      icon: FileText,
      description: 'Experience and expectations'
    }
  ];

  const organizationTypes = [
    'company',
    'startup',
    'educational_institution',
    'ngo',
    'government',
    'freelancer',
    'other'
  ];

  const handleInputChange = (field: keyof OrganizerFormData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

   const handleFileUpload = async (field: keyof OrganizerFormData, file: File) => {
  const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUDINARY_CLOUD || !CLOUDINARY_PRESET) {
    toast.error('File upload not configured. Please contact administrator.');
    return;
  }

  if (!file.type.startsWith('image/')) {
    toast.error('Only image files are allowed (JPG, PNG, etc.)');
    return;
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    toast.error('Image size must be less than 5MB');
    return;
  }

  const uploadToast = toast.loading(`Uploading ${String(field)}...`);

  try {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
      {
        method: 'POST',
        body: fd,
      }
    );

    if (!response.ok) throw new Error('Failed to upload file');

    const data = await response.json();
    handleInputChange(field, data.secure_url);
    toast.success(`${String(field)} uploaded successfully!`, { id: uploadToast });
  } catch (error) {
    console.error('File upload error:', error);
    toast.error('Failed to upload file. Please try again.', { id: uploadToast });
  }
};


  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.fullName && formData.email && formData.phone && formData.position);
      case 2:
        return !!(formData.organizationName && formData.organizationType && formData.address && formData.city && formData.state && formData.pincode);
      case 3:
        return !!(formData.bankName && formData.accountNumber && formData.ifscCode && formData.accountHolderName);
      case 4:
        return !!(formData.panCard && formData.bankStatement);
      case 5:
        return !!(formData.previousExperience && formData.expectedEventsPerYear && formData.reasonForJoining);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      
      console.log('Submitting organizer request with data:', formData);
      
      const response = await fetch(`${API_BASE}/organizer-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Application submitted successfully! We will review your application and contact you within 2-3 business days.');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Position/Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="e.g., CEO, Manager, Coordinator"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Organization Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Enter organization name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.organizationType}
                  onChange={(e) => handleInputChange('organizationType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  {organizationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                  placeholder="Enter complete address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pin Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Banking Information</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                <p className="text-sm text-amber-800">
                  Bank details are required for payment settlements and revenue sharing.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="e.g., State Bank of India"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="As per bank records"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="SBIN0001234"
                  maxLength={11}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Document Upload</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-sm text-blue-800">
                  Please upload clear, readable documents in PDF or image format (max 5MB each).
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PAN Card */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PAN Card <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
                  {formData.panCard ? (
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="h-6 w-6 mr-2" />
                      <span className="font-medium">PAN Card uploaded</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload PAN Card (Image only)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('panCard', file);
                        }}
                        className="mt-2 text-xs"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Bank Statement */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bank Statement <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
                  {formData.bankStatement ? (
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="h-6 w-6 mr-2" />
                      <span className="font-medium">Bank Statement uploaded</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload Bank Statement (Image only)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('bankStatement', file);
                        }}
                        className="mt-2 text-xs"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* GST Certificate */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GST Certificate <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
                  {formData.gstCertificate ? (
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="h-6 w-6 mr-2" />
                      <span className="font-medium">GST Certificate uploaded</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload GST Certificate (Image only)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('gstCertificate', file);
                        }}
                        className="mt-2 text-xs"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Organization License */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization License <span className="text-gray-500">(If applicable)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
                  {formData.organizationLicense ? (
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="h-6 w-6 mr-2" />
                      <span className="font-medium">License uploaded</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload Organization License (Image only)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('organizationLicense', file);
                        }}
                        className="mt-2 text-xs"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Previous Experience in Event Management <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.previousExperience}
                  onChange={(e) => handleInputChange('previousExperience', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                  placeholder="Describe your experience in organizing events, workshops, or training programs..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expected Number of Events Per Year <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.expectedEventsPerYear}
                  onChange={(e) => handleInputChange('expectedEventsPerYear', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  <option value="">Select expected frequency</option>
                  <option value="1-5">1-5 events</option>
                  <option value="6-10">6-10 events</option>
                  <option value="11-20">11-20 events</option>
                  <option value="20+">More than 20 events</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Why do you want to join SETU as an organizer? <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.reasonForJoining}
                  onChange={(e) => handleInputChange('reasonForJoining', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                  placeholder="Tell us about your goals and how you plan to contribute to the SETU community..."
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white py-6 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300"
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold">Become an Organizer</h1>
            <p className="text-emerald-100 mt-1">Join the SETU platform to organize events</p>
          </div>
          
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div 
        className="max-w-4xl mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <React.Fragment key={step.id}>
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                    ${isCompleted 
                      ? 'bg-emerald-600 text-white' 
                      : isActive 
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-200' 
                        : 'bg-gray-200 text-gray-400'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${isActive ? 'text-emerald-600' : 'text-gray-600'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 max-w-20 hidden md:block">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
                
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-4 rounded transition-all duration-300
                    ${currentStep > step.id ? 'bg-emerald-600' : 'bg-gray-200'}
                  `} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Content */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          key={currentStep} // This will trigger animation on step change
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <motion.button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              whileHover={currentStep > 1 ? { scale: 1.02 } : {}}
              whileTap={currentStep > 1 ? { scale: 0.98 } : {}}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </motion.button>
            
            <motion.button
              onClick={currentStep === steps.length ? handleSubmit : handleNext}
              disabled={loading || !validateStep(currentStep)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-700 text-white rounded-xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              whileHover={validateStep(currentStep) ? { scale: 1.02 } : {}}
              whileTap={validateStep(currentStep) ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : currentStep === steps.length ? (
                <>
                  Submit Application
                  <CheckCircle className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowLeft className="h-4 w-4 transform rotate-180" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrganizerRegistration;
