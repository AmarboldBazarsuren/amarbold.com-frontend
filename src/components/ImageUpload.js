// src/components/ImageUpload.js - MANUAL CROP EDITOR
import React, { useState, useRef } from 'react';
import { Upload, X, Loader, Crop, Check } from 'lucide-react';
import api from '../config/api';

function ImageUpload({ 
  label = 'Зураг upload', 
  onUploadSuccess, 
  currentImage = null,
  uploadType = 'course-thumbnail',
  accept = 'image/jpeg,image/png,image/gif,image/webp'
}) {
  const [preview, setPreview] = useState(currentImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 50 });
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // 🔥 ЗӨВХӨН COURSE THUMBNAIL Л CROP ХИЙХ
  const needsCrop = uploadType === 'course-thumbnail';

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation
    if (file.size > 5 * 1024 * 1024) {
      setError('Зургийн хэмжээ 5MB-аас бага байх ёстой');
      return;
    }

    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        if (needsCrop) {
          // 🔥 CROP MODAL НЭЭХ
          setOriginalImage(img);
          initializeCropArea(img);
          setShowCropModal(true);
        } else {
          // Profile, banner - шууд upload
          setPreview(event.target.result);
          uploadImage(file);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // 🔥 АНХНЫ CROP ХЭСГИЙГ ТООЦООЛОХ (2:1 харьцаатай, дундаас)
  const initializeCropArea = (img) => {
    const targetRatio = 2; // 2:1
    const imgRatio = img.width / img.height;

    let width, height, x, y;

    if (imgRatio > targetRatio) {
      // Зураг хэт өргөн → өндрийг бүтнээр авах
      height = img.height;
      width = height * targetRatio;
      x = (img.width - width) / 2;
      y = 0;
    } else {
      // Зураг хэт өндөр → өргөнийг бүтнээр авах
      width = img.width;
      height = width / targetRatio;
      x = 0;
      y = (img.height - height) / 2;
    }

    setCropArea({ x, y, width, height });
  };

  // 🔥 CROP ХИЙЖ ФАЙЛ ҮҮСГЭХ
  const handleCropConfirm = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Max 1200px өргөнтэй болгох
    const maxWidth = 1200;
    let outputWidth = cropArea.width;
    let outputHeight = cropArea.height;

    if (outputWidth > maxWidth) {
      outputWidth = maxWidth;
      outputHeight = maxWidth / 2; // 2:1 харьцаа хадгалах
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Crop хэсгийг зурах
    ctx.drawImage(
      originalImage,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, outputWidth, outputHeight
    );

    // Canvas → Blob → File → Upload
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setError('Crop хийхэд алдаа гарлаа');
          return;
        }

        const croppedFile = new File(
          [blob],
          `cropped_${Date.now()}.jpg`,
          { type: 'image/jpeg' }
        );

        // Preview үүсгэх
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(croppedFile);

        // Modal хаах
        setShowCropModal(false);

        // Upload хийх
        await uploadImage(croppedFile);
      },
      'image/jpeg',
      0.92
    );
  };

  const uploadImage = async (file) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      
      const fieldName = uploadType === 'course-thumbnail' ? 'thumbnail' :
                       uploadType === 'profile-image' ? 'profile_image' :
                       uploadType === 'profile-banner' ? 'profile_banner' : 'file';
      
      formData.append(fieldName, file);

      const token = localStorage.getItem('token');
      const response = await api.post(
        `/api/upload/${uploadType}`,
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
        onUploadSuccess(response.data.data.url);
        setPreview(response.data.data.url);
      }
    } catch (err) {
      console.error('❌ Upload алдаа:', err);
      setError(err.response?.data?.message || 'Upload хийхэд алдаа гарлаа');
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadSuccess('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
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
              transition: 'all 0.3s ease',
              zIndex: 10
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
              gap: '12px',
              zIndex: 5
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
            {needsCrop && (
              <p style={{ color: '#00d4ff', fontSize: '11px', fontWeight: '600', marginTop: '4px' }}>
                ✂️ Crop хийх боломжтой
              </p>
            )}
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
          padding: '12px',
          background: 'rgba(255, 59, 48, 0.1)',
          border: '1px solid rgba(255, 59, 48, 0.3)',
          borderRadius: '8px',
          color: '#ff3b30',
          fontSize: '12px'
        }}>
          {error}
        </div>
      )}

      {/* Helper Text */}
      {!error && (
        <small style={{
          display: 'block',
          marginTop: '8px',
          color: '#808080',
          fontSize: '12px'
        }}>
          {needsCrop 
            ? '✨ Зураг сонгосны дараа 2:1 харьцаагаар crop хийх боломжтой'
            : `Зөвлөмж: ${uploadType === 'profile-banner' ? '1200x400px' : '800x600px'} хэмжээтэй зураг ашиглах нь тохиромжтой`
          }
        </small>
      )}

      {/* 🔥 CROP MODAL */}
      {showCropModal && (
        <CropModal
          image={originalImage}
          cropArea={cropArea}
          onCropChange={setCropArea}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// 🔥 CROP MODAL COMPONENT
function CropModal({ image, cropArea, onCropChange, onConfirm, onCancel }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Canvas дээр зураг болон crop box зурах
  React.useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;

    // Container size
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Зургийг container-д тааруулах
    const imgRatio = image.width / image.height;
    const containerRatio = containerWidth / containerHeight;

    let displayWidth, displayHeight;

    if (imgRatio > containerRatio) {
      displayWidth = containerWidth;
      displayHeight = containerWidth / imgRatio;
    } else {
      displayHeight = containerHeight;
      displayWidth = containerHeight * imgRatio;
    }

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    setScale(displayWidth / image.width);

    // Зураг зурах
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, displayWidth, displayHeight);

    // Crop box зурах
    const scaledCrop = {
      x: cropArea.x * (displayWidth / image.width),
      y: cropArea.y * (displayHeight / image.height),
      width: cropArea.width * (displayWidth / image.width),
      height: cropArea.height * (displayHeight / image.height)
    };

    // Харанхуй overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Crop хэсгийг тодруулах
    ctx.clearRect(scaledCrop.x, scaledCrop.y, scaledCrop.width, scaledCrop.height);
    ctx.drawImage(
      image,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      scaledCrop.x, scaledCrop.y, scaledCrop.width, scaledCrop.height
    );

    // Crop box border
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(scaledCrop.x, scaledCrop.y, scaledCrop.width, scaledCrop.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(scaledCrop.x + (scaledCrop.width / 3) * i, scaledCrop.y);
      ctx.lineTo(scaledCrop.x + (scaledCrop.width / 3) * i, scaledCrop.y + scaledCrop.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(scaledCrop.x, scaledCrop.y + (scaledCrop.height / 3) * i);
      ctx.lineTo(scaledCrop.x + scaledCrop.width, scaledCrop.y + (scaledCrop.height / 3) * i);
      ctx.stroke();
    }
  }, [image, cropArea]);

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaledCrop = {
      x: cropArea.x * scale,
      y: cropArea.y * scale,
      width: cropArea.width * scale,
      height: cropArea.height * scale
    };

    // Crop box дотор дарсан эсэхийг шалгах
    if (
      x >= scaledCrop.x &&
      x <= scaledCrop.x + scaledCrop.width &&
      y >= scaledCrop.y &&
      y <= scaledCrop.y + scaledCrop.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - scaledCrop.x, y: y - scaledCrop.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let newX = (x - dragStart.x) / scale;
    let newY = (y - dragStart.y) / scale;

    // Хязгаарлах
    newX = Math.max(0, Math.min(newX, image.width - cropArea.width));
    newY = Math.max(0, Math.min(newY, image.height - cropArea.height));

    onCropChange({ ...cropArea, x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{
        color: '#ffffff',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <Crop size={24} color="#00d4ff" />
          Зургийг 2:1 харьцаагаар таарууулна уу
        </h3>
        <p style={{ fontSize: '14px', color: '#808080' }}>
          Crop box-г чирж хөдөлгөж болно
        </p>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        style={{
          maxWidth: '90vw',
          maxHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          Болих
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: '12px 24px',
            background: '#00d4ff',
            border: 'none',
            borderRadius: '8px',
            color: '#000000',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#00b8e6'}
          onMouseOut={(e) => e.currentTarget.style.background = '#00d4ff'}
        >
          <Check size={18} />
          Crop хийх
        </button>
      </div>
    </div>
  );
}

export default ImageUpload;