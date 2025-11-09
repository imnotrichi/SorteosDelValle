import React from 'react';

const FileUpload = ({ label, id = "dropzone-file" }) => {
  return (
    <div>
      <span className="text-sm font-medium pb-2 block text-text-light dark:text-text-dark">{label}</span>
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center w-full h-44 border-2 border-border-light dark:border-border-dark border-dashed rounded-lg cursor-pointer bg-background-light dark:bg-background-dark hover:bg-primary/5 transition-colors">
        <div className="flex flex-col items-center justify-center py-6">
          <span className="material-symbols-outlined text-5xl text-text-light/30 dark:text-text-dark/30 mb-3">
            cloud_upload
          </span>
          <p className="text-sm text-text-light/60 dark:text-text-dark/60">
            <span className="font-semibold">Haz clic aquí</span> para subir una imagen
          </p>
          <p className="text-xs text-text-light/40 dark:text-text-dark/40 mt-1">
            PNG o JPG (Max. 800x400px)
          </p>
        </div>
        <input id={id} type="file" className="hidden" accept="image/png,image/jpeg,image/jpg" />
      </label>
    </div>
  );
};

export default FileUpload;