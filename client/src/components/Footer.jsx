import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-text">
            <ShieldCheck className="w-5 h-5 text-primary" aria-hidden="true" />
            <span className="font-semibold text-sm">Campus Complaint System</span>
            <span className="text-muted">|</span>
            <span className="text-xs text-muted">Student Voice & Administrative Accountability</span>
          </div>
          <div className="text-xs text-muted flex items-center space-x-1">
            <span>Built with MERN Stack • Windows PowerShell Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
