import React from 'react';

export function InfoFechaCard({ label, fecha }) {
  return (
    <div className="bg-background-light rounded-lg p-4">
      <p className="text-base text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-semibold text-text-light">
        {fecha}
      </p>
    </div>
  );
}