import React from 'react';

const FileUpload = ({ label, id = "dropzone-file" }) => {
  return (
    <div>
      <span className="text-base font-medium pb-2 block">{label}</span>
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center w-full h-48 border-2 border-border-light dark:border-border-dark border-dashed rounded-lg cursor-pointer bg-background-light dark:bg-background-dark hover:bg-primary/10"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <span className="material-symbols-outlined text-4xl text-text-light/60">
            cloud_upload
          </span>
          <p className="mb-2 text-sm text-text-light/60">
            <span className="font-semibold">Haz click aquí</span> para subir una imagen
          </p>
          <p className="text-xs text-text-light/50">PNG o JPG (Max. 800x400px)</p>
        </div>
        <input id={id} type="file" className="hidden" />
      </label>
    </div>
  );
};
export default FileUpload;