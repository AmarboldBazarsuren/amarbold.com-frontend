// src/components/ImageUpload.js
import React, { useState, useRef } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import axios from 'axios';

function ImageUpload({ 
  label = 'Зураг upload', 
  onUploadSuccess, 
  currentImage = null,
  uploadType = 'course-thumbnail', // 'course-thumbnail' | 'profile-image' | 'profile-banner'
  accept = 'image/jpeg,image/png,image/gif,image/webp'
}) {
  const [preview, setPreview] = useState(currentImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      setError('Зургийн хэмжээ 5MB-аас бага байх ёстой');
      return;
    }

    // Preview үүсгэх
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload хийх
    await uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // ✅ Field name-ийг uploadType дээр үндэслэн тодорхойлох
      const fieldName = uploadType === 'course-thumbnail' ? 'thumbnail' :
                       uploadType === 'profile-image' ? 'profile_image' :
                       uploadType === 'profile-banner' ? 'profile_banner' : 'file';
      
      formData.append(fieldName, file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/upload/${uploadType}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        console.log('✅ Upload амжилттай:', response.data.data.url);
        onUploadSuccess(response.data.data.url); // ✅ URL буцаах
        setPreview(response.data.data.url); // ✅ Preview шинэчлэх
      }
    } catch (err) {
      console.error('❌ Upload алдаа:', err);
      setError(err.response?.data?.message || 'Upload хийхэд алдаа гарлаа');
      setPreview(currentImage); // Preview буцаах
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        color: '#b0b0b0',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        {label}
      </label>

      {/* Preview эсвэл Upload Button */}
      {preview ? (
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: uploadType === 'profile-banner' ? '100%' : '300px',
          height: uploadType === 'profile-banner' ? '150px' : '200px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          background: '#1a1a1a'
        }}>
          <img 
            src={preview} 
            alt="Preview" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
          />
          
          {/* Remove Button */}
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 59, 48, 0.9)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.9)'}
          >
            <X size={18} />
          </button>

          {/* Uploading Overlay */}
          {uploading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <Loader size={32} color="#00d4ff" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: '#ffffff', fontSize: '14px' }}>Upload хийж байна...</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            maxWidth: uploadType === 'profile-banner' ? '100%' : '300px',
            height: uploadType === 'profile-banner' ? '150px' : '200px',
            border: '2px dashed rgba(0, 212, 255, 0.3)',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            gap: '12px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.6)';
            e.currentTarget.style.background = 'rgba(0, 212, 255, 0.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
          }}
        >
          <Upload size={40} color="#00d4ff" />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#ffffff', fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
              Зураг сонгох
            </p>
            <p style={{ color: '#808080', fontSize: '12px' }}>
              JPG, PNG, GIF эсвэл WEBP (max 5MB)
            </p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Error Message */}
      {error && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: 'rgba(255, 59, 48, 0.1)',
          border: '1px solid rgba(255, 59, 48, 0.3)',
          borderRadius: '6px',
          color: '#ff3b30',
          fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      {/* Helper Text */}
      <small style={{
        display: 'block',
        marginTop: '8px',
        color: '#808080',
        fontSize: '12px'
      }}>
        Зөвлөмж: {uploadType === 'profile-banner' ? '1200x400px' : '800x600px'} хэмжээтэй зураг ашиглах нь тохиромжтой
      </small>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ImageUpload;