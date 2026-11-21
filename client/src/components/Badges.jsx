import React from 'react';
import {
  Clock,
  Search,
  RotateCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export const StatusBadge = ({ status, isOverdue = false }) => {
  const configs = {
    Submitted: {
      className: 'bg-status-submitted-bg text-status-submitted-fg border-status-submitted-border',
      icon: Clock,
      label: 'Submitted',
    },
    'Under Review': {
      className: 'bg-status-under-review-bg text-status-under-review-fg border-status-under-review-border',
      icon: Search,
      label: 'Under Review',
    },
    'In Progress': {
      className: 'bg-status-in-progress-bg text-status-in-progress-fg border-status-in-progress-border',
      icon: RotateCw,
      label: 'In Progress',
    },
    Resolved: {
      className: 'bg-status-resolved-bg text-status-resolved-fg border-status-resolved-border',
      icon: CheckCircle2,
      label: 'Resolved',
    },
    Rejected: {
      className: 'bg-status-rejected-bg text-status-rejected-fg border-status-rejected-border',
      icon: XCircle,
      label: 'Rejected',
    },
  };

  const config = configs[status] || {
    className: 'bg-surface text-text border-border',
    icon: Clock,
    label: status || 'Unknown',
  };
  const Icon = config.icon;

  return (
    <div className="inline-flex items-center space-x-1.5 flex-wrap gap-y-1">
      <span
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-pill text-xs font-semibold border shadow-sm ${config.className}`}
      >
        <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        <span>{config.label}</span>
      </span>

      {isOverdue && status !== 'Resolved' && status !== 'Rejected' && (
        <span
          className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-pill text-xs font-bold bg-status-overdue-bg text-status-overdue-fg border border-status-overdue-border shadow-sm"
          role="status"
          aria-label="Overdue: Inactive for more than 3 days"
        >
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span>Overdue</span>
        </span>
      )}
    </div>
  );
};

export const CategoryBadge = ({ category }) => {
  return (
    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-surface text-text border border-border shadow-sm">
      <Layers className="w-3 h-3 text-muted" aria-hidden="true" />
      <span>{category}</span>
    </span>
  );
};
