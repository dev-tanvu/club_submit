import { useState } from 'react';
import type { FormEvent, ChangeEvent, DragEvent } from 'react';

interface ImageFile {
  file: File;
  preview: string;
}

interface LandingPageProps {
  category: string;
}

export default function LandingPage({ category }: LandingPageProps) {
  const [formData, setFormData] = useState({
    fullNameBengali: '',
    fullNameEnglish: '',
    institutionName: '',
    class: '',
    email: '',
    phone: '',
    whatsapp: ''
  });

  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const numericRegex = /^\d+$/;
    return numericRegex.test(phone) && phone.length >= 11;
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      errors.phone = 'Phone number must be numeric and at least 11 characters long';
    }

    // WhatsApp validation
    if (formData.whatsapp && !validatePhoneNumber(formData.whatsapp)) {
      errors.whatsapp = 'WhatsApp number must be numeric and at least 11 characters long';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateImage = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024;

    if (!file.type.startsWith('image/')) {
      setError('Please upload only image files');
      setTimeout(() => setError(''), 3000);
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 5 MB');
      setTimeout(() => setError(''), 3000);
      return false;
    }

    return true;
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);

    if (images.length + fileArray.length > 3) {
      setError('You can only upload up to 3 images');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setUploading(true);

    const validImages: ImageFile[] = [];
    fileArray.forEach((file) => {
      if (validateImage(file)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          validImages.push({
            file,
            preview: e.target?.result as string
          });

          if (validImages.length === fileArray.length) {
            setImages([...images, ...validImages]);
            setUploading(false);
          }
        };
        reader.readAsDataURL(file);
      } else {
        setUploading(false);
      }
    });
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const uploadImageToCloudinary = async (file: File, participantName: string, className: string, phoneLast3: string, category: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'photography-contest');
    formData.append('public_id', `${participantName}_${className}_${phoneLast3}_${category}`);
    formData.append('folder', 'photography-contest');
    
    const response = await fetch('https://api.cloudinary.com/v1_1/dxl1tjcim/image/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    return data.secure_url;
  };

  const submitToGoogleSheets = async (formData: any, imageUrls: string[], category: string) => {
    // Prepare the submission data
    const submissionData = {
      category: category,
      fullNameBengali: formData.fullNameBengali,
      fullNameEnglish: formData.fullNameEnglish,
      institutionName: formData.institutionName,
      class: formData.class,
      email: formData.email,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      imageUrls: imageUrls,
      timestamp: new Date().toISOString()
    };

    try {
      // Replace with your Google Apps Script web app URL
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbybApdPags-3VvuHYWcuzl8lLx3aSE49un5WBsF85MWYN6-SnoJrJwNX7q3JXD8iD_Z/exec';
      
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit to Google Sheets');
      }

      // Also save to localStorage as a backup
      const existingSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
      existingSubmissions.push({
        ...submissionData,
        submissionDate: new Date().toLocaleString()
      });
      localStorage.setItem('formSubmissions', JSON.stringify(existingSubmissions));

      return { 
        success: true, 
        message: 'Form submitted successfully! Data saved to Google Sheets and locally.' 
      };
    } catch (error) {
      console.error('Google Sheets submission error:', error);
      throw new Error('Failed to submit form data to Google Sheets. Please try again later.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (images.length === 0) {
      setError('Please upload at least one image');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      // Category is passed as prop from App component
      
      // Generate naming convention: participantname_class_last3digit of phone number
      const participantName = formData.fullNameEnglish.replace(/\s+/g, '_').toLowerCase();
      const className = formData.class.replace(/\s+/g, '_').toLowerCase();
      const phoneLast3 = formData.phone.slice(-3);
      
      // Upload images to Cloudinary
      const imageUploadPromises = images.map(img => 
        uploadImageToCloudinary(img.file, participantName, className, phoneLast3, category)
      );
      
      const imageUrls = await Promise.all(imageUploadPromises);
      
      // Submit form data and image URLs to Google Sheets
      const result = await submitToGoogleSheets(formData, imageUrls, category);
      
      setShowSuccess(true);
      setError('');
      setTimeout(() => {
        setFormData({
          fullNameBengali: '',
          fullNameEnglish: '',
          institutionName: '',
          class: '',
          email: '',
          phone: '',
          whatsapp: ''
        });
        setImages([]);
        setValidationErrors({});
        setShowSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Submission error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit form. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  return (
    <div className="landing-page">
      <div className="content-container">
        <h1 className="registration-title">Registration Form</h1>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullNameBengali">Full Name (in Bengali)</label>
            <input
              type="text"
              id="fullNameBengali"
              name="fullNameBengali"
              value={formData.fullNameBengali}
              onChange={handleChange}
              required
              placeholder="আপনার পুরো নাম লিখুন"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullNameEnglish">Full Name (in English)</label>
            <input
              type="text"
              id="fullNameEnglish"
              name="fullNameEnglish"
              value={formData.fullNameEnglish}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="institutionName">Institution Name</label>
            <input
              type="text"
              id="institutionName"
              name="institutionName"
              value={formData.institutionName}
              onChange={handleChange}
              required
              placeholder="Enter your institution name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="class">Class</label>
            <input
              type="text"
              id="class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
              placeholder="Enter your class"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email ID</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className={validationErrors.email ? 'error' : ''}
            />
            {validationErrors.email && (
              <span className="error-message">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="number"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
              min="0"
              className={validationErrors.phone ? 'error' : ''}
            />
            {validationErrors.phone && (
              <span className="error-message">{validationErrors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="whatsapp">WhatsApp Number</label>
            <input
              type="number"
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              required
              placeholder="Enter your WhatsApp number"
              min="0"
              className={validationErrors.whatsapp ? 'error' : ''}
            />
            {validationErrors.whatsapp && (
              <span className="error-message">{validationErrors.whatsapp}</span>
            )}
          </div>

          <div className="upload-section">
            <label className="upload-label">Upload Your Images</label>
            <div
              className={`upload-zone ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="upload-text">Upload Images (max 3, &lt; 5MB each)</p>
              <p className="upload-subtext">Drag and drop or click to browse</p>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                style={{ display: 'none' }}
              />
            </div>

            {images.length > 0 && (
              <div className="image-previews">
                {images.map((img, index) => (
                  <div key={index} className="preview-item">
                    <img src={img.preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={uploading}>
            {uploading ? 'Submitting...' : 'Submit Entry'}
          </button>
        </form>

        {uploading && (
          <div className="toast">
            <div className="toast-spinner"></div>
            Uploading images and submitting form...
          </div>
        )}

        {error && (
          <div className="toast error">
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="success-modal">
            <div className="success-content">
              <div className="success-icon">✓</div>
              <h2>Thank you for your submission!</h2>
              <p>We've received your entry successfully.</p>
              <p>Images uploaded to Cloudinary with your naming convention.</p>
              <a 
                href="/submission-data.html" 
                target="_blank" 
                style={{
                  display: 'inline-block',
                  marginTop: '15px',
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px'
                }}
              >
                📋 View All Submissions
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
