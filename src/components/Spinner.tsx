import React from "react";

export const Spinner: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center h-64 w-full animate-fade-in">
    <svg className="animate-spin h-8 w-8 text-primary mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    {label && <span className="text-muted-foreground text-sm">{label}</span>}
  </div>
);
