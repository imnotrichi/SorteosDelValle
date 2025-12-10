import React, { useState, useEffect, useRef } from 'react';
import uploadIcon from '../assets/subir.png';

const FileUpload = ({ label, id = "dropzone-file", onChange, fileValue, initialImage, disabled = false }) => {

  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialImage && !fileValue) {
      setPreview(initialImage);
    }
  }, [initialImage, fileValue]);

  useEffect(() => {
    if (fileValue) {
      const objectUrl = URL.createObjectURL(fileValue);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (!initialImage) {
      setPreview(null);
      if (inputRef.current) {
        inputRef.current.value = null;
      }
    }
  }, [fileValue, initialImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onChange) {
      onChange(e);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const fakeEvent = { target: { files: [file] } };
        if (onChange) onChange(fakeEvent);
      } else {
        alert("Por favor, suelta solo archivos de imagen.");
      }
    }
  };

  let containerClasses = "flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-lg transition-all duration-200 ";

  if (disabled) {
    containerClasses += "border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed";
  } else if (isDragging) {
    containerClasses += "border-primary bg-primary/10 cursor-copy scale-[1.02]";
  } else {
    containerClasses += "border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark cursor-pointer hover:bg-primary/5";
  }

  return (
    <div className="font-display">
      {label && (
        <span className="text-sm font-medium pb-2 block text-text-light dark:text-text-dark">
          {label}
        </span>
      )}
      
      <label
        htmlFor={id}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={containerClasses}
      >
        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Vista previa" 
              className="w-full h-full object-cover rounded-lg"
            />
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-lg">
              <span className="material-symbols-outlined text-3xl mb-1">edit</span>
              <p className="text-sm font-bold">Haz clic para cambiar</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center px-4">
            <img src={uploadIcon} alt="Upload" className="w-8 h-6 mb-2 opacity-60" />
            <p className="text-sm text-text-light/60 dark:text-text-dark/60">
              <span className="font-semibold">Haz clic aquí</span> para subir una imagen
            </p>
            <p className="text-xs text-text-light/40 dark:text-text-dark/40 mt-1">
              PNG o JPG (Max. 5MB)
            </p>
          </div>
        )}

        <input
          id={id}
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          ref={inputRef}
          disabled={disabled}
        />
      </label>
    </div>
  );
};

export default FileUpload;