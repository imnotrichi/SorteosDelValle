import React from 'react';

export function InfoFechaCard({ label, fecha }) {
  return (
    <div className="bg-background-light rounded-lg p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-text-light">
        {fecha}
      </p>
    </div>
  );
}