import React, { useState, useEffect, useRef } from 'react';
import uploadIcon from '../assets/subir.png';

const FileUpload = ({ label, id = "dropzone-file", onChange, fileValue, disabled }) => {

  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (fileValue) {
      setFileName(fileValue.name);
    } else {
      setFileName(null);
      if (inputRef.current) {
        inputRef.current.value = null;
      }
    }
  }, [fileValue]);

  const processFile = (file) => {
    if (file) {
      setFileName(file.name);

      if (onChange) {
        const syntheticEvent = {
          target: {
            files: [file]
          }
        };
        onChange(syntheticEvent);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
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
        processFile(file);
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
    <div>
      <span className={`text-sm font-medium pb-2 block ${disabled ? 'text-gray-400' : 'text-text-light dark:text-text-dark'}`}>
        {label}
      </span>

      <label
        htmlFor={id}
        className={containerClasses}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >

        <div className="flex flex-col items-center justify-center py-6 text-center px-4 pointer-events-none">

          <img
            src={uploadIcon}
            alt="Upload"
            className={`w-8 h-6 mb-2 transition-opacity ${disabled ? 'opacity-50 grayscale' : ''}`}
          />

          {fileName ? (
            <p className="text-sm font-semibold text-button-add-light break-all">{fileName}</p>
          ) : (
            <>
              <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-text-light/60 dark:text-text-dark/60'}`}>
                {isDragging ? (
                  <span className="font-bold text-primary">¡Suelta la imagen aquí!</span>
                ) : (
                  <>
                    <span className="font-semibold">{disabled ? "Edición bloqueada" : "Haz clic aquí"}</span>
                    {!disabled && " o arrastra una imagen"}
                  </>
                )}
              </p>
              <p className="text-xs text-text-light/40 dark:text-text-dark/40 mt-1">
                PNG o JPG (Max. 800x400px)
              </p>
            </>
          )}
        </div>

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