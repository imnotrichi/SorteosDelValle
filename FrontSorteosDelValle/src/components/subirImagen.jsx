import React, { useState } from 'react';
import uploadIcon from '../assets/subir.png';

const FileUpload = ({ label, id = "dropzone-file", onChange }) => {
  
  const [fileName, setFileName] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setFileName(file.name);
    } else {
      setFileName(null);
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div>
      <span className="text-sm font-medium pb-2 block text-text-light dark:text-text-dark">{label}</span>
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center w-full h-44 border-2 border-border-light dark:border-border-dark border-dashed rounded-lg cursor-pointer bg-background-light dark:bg-background-dark hover:bg-primary/5 transition-colors">
        
        <div className="flex flex-col items-center justify-center py-6 text-center px-4">
          <img src={uploadIcon} alt="Upload" className="w-8 h-6 mb-2" />
          
          {fileName ? (
            <p className="text-sm font-semibold text-button-add-light break-all">{fileName}</p>
          ) : (
            <>
              <p className="text-sm text-text-light/60 dark:text-text-dark/60">
                <span className="font-semibold">Haz clic aquí</span> para subir una imagen
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
        />
      </label>
    </div>
  );
};

export default FileUpload;