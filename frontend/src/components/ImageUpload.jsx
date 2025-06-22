import React, { useRef, useState } from 'react'
import './ImageUpload.css'

const ImageUpload = ({ selectedImage, onImageSelect, onPredict, isLoading }) => {
  const fileInputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onImageSelect(e.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      alert('Please select a valid image file')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const removeImage = () => {
    onImageSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="image-upload">
      <h2 className="section-title">
        <span>📸</span>
        Upload Plant Image
      </h2>
      
      <div className="upload-area">
        {!selectedImage ? (
          <div
            className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <div className="upload-content">
              <div className="upload-icon">📷</div>
              <h3>Upload Plant Photo</h3>
              <p>Drag and drop an image here, or click to browse</p>
              <p className="upload-hint">Supported formats: JPG, PNG, JPEG</p>
            </div>
          </div>
        ) : (
          <div className="image-preview">
            <img src={selectedImage} alt="Selected plant" />
            <div className="image-actions">
              <button onClick={removeImage} className="btn btn-secondary">
                <span>🗑️</span>
                Remove
              </button>
              <button onClick={handleClick} className="btn btn-secondary">
                <span>🔄</span>
                Change
              </button>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {selectedImage && (
        <div className="upload-actions">
          <button
            onClick={onPredict}
            disabled={isLoading}
            className="btn btn-primary btn-large"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              <>
                <span>🔍</span>
                Diagnose Disease
              </>
            )}
          </button>
        </div>
      )}

      <div className="upload-tips">
        <h4>📝 Tips for Best Results:</h4>
        <ul>
          <li>Take a clear, well-lit photo of the affected area</li>
          <li>Ensure the plant leaves are clearly visible</li>
          <li>Avoid shadows and reflections</li>
          <li>Include multiple leaves if possible</li>
          <li>Use a plain background for better accuracy</li>
        </ul>
      </div>
    </div>
  )
}

export default ImageUpload 