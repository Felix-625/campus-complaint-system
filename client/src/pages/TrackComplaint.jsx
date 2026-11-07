import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { API_BASE, getImageUrl } from '../api/axios';
import {
  Search,
  MapPin,
  Building,
  Calendar,
  AlertCircle,
  Clock,
  Check,
  Copy,
} from 'lucide-react';
import { StatusBadge, CategoryBadge } from '../components/Badges';

export const TrackComplaint = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchComplaint = async (trackingCode) => {
    const formatted = trackingCode.trim().toUpperCase();
    if (!formatted) return;

    setLoading(true);
    setError(null);
    setComplaint(null);

    try {
      const res = await api.get(`/complaints/track/${formatted}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `No complaint found with code "${formatted}". Please verify and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchComplaint(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      setSearchParams({ code: code.trim().toUpperCase() });
      fetchComplaint(code);
    }
  };

  const handleCopyCode = () => {
    if (complaint?.trackingCode) {
      navigator.clipboard.writeText(complaint.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-text tracking-tight">Track Your Complaint</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your unique tracking code below to inspect real-time progress and administrative notes.
        </p>

        {/* Tracking Code Search Input */}
        <form onSubmit={handleSubmit} className="mt-6 max-w-md mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g., CMP-7K9XM"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-text text-sm font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-focus-ring transition shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-on-primary text-sm font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {loading && (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted">Searching complaint database...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-status-rejected-bg/15 border border-danger rounded-lg p-5 text-danger flex items-start space-x-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold">Tracking Lookup Failed</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {complaint && !loading && (
        <div className="space-y-8 animate-fadeIn">
          {/* Complaint Details Card */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-primary tracking-wider">
                  {complaint.trackingCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded-md text-muted hover:text-text hover:bg-surface-alt/40 transition"
                  title="Copy tracking code"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <CategoryBadge category={complaint.category} />
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            <div className="mt-5">
              <h2 className="text-xl font-bold text-text mb-2">{complaint.title}</h2>
              <p className="text-text text-sm leading-relaxed mb-6 whitespace-pre-line">
                {complaint.description}
              </p>

              {/* Location & Office Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border text-xs text-muted">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted flex-shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="text-text">Location:</strong> {complaint.location}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted flex-shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="text-text">Assigned Office:</strong> {complaint.assignedOffice}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted flex-shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="text-text">Filed Date:</strong>{' '}
                    {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Optional Photo */}
              {complaint.imageUrl && (
                <div className="mt-5 pt-4 border-t border-border">
                  <span className="text-xs font-semibold text-text block mb-2">Attached Photo:</span>
                  <a
                    href={getImageUrl(complaint.imageUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block border border-border rounded-lg overflow-hidden hover:opacity-95 transition"
                  >
                    <img
                      src={getImageUrl(complaint.imageUrl)}
                      alt="Complaint attachment"
                      className="max-h-60 rounded-md object-contain bg-surface-alt/20"
                    />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Vertical Stepper Timeline */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-bold text-text mb-6 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" aria-hidden="true" />
              <span>Resolution Timeline</span>
            </h3>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-border-strong ml-4 space-y-8">
              {complaint.timeline && complaint.timeline.length > 0 ? (
                complaint.timeline.map((item, idx) => {
                  const isCurrent = idx === complaint.timeline.length - 1;
                  return (
                    <div key={item._id || idx} className="relative group">
                      {/* Stepper Node Circle */}
                      <div
                        className={`absolute -left-[33px] sm:-left-[41px] top-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'border-border-strong text-on-accent bg-accent ring-2 ring-primary shadow-sm'
                            : 'border-primary text-on-primary bg-primary shadow-sm'
                        }`}
                        aria-label={isCurrent ? 'Current stage' : 'Completed stage'}
                      >
                        {isCurrent ? (
                          <div className="h-2 w-2 rounded-full bg-text animate-pulse" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-on-primary" aria-hidden="true" />
                        )}
                      </div>

                      {/* Timeline Item Content */}
                      <div className="bg-surface-alt/15 rounded-lg border border-border p-4 transition hover:bg-surface-alt/30 hover:shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-sm text-text">{item.status}</span>
                          <span className="text-xs text-muted">
                            {new Date(item.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-text leading-relaxed mb-2">
                          {item.note}
                        </p>

                        <div className="text-[11px] text-muted font-medium">
                          Logged by: <span className="text-text font-semibold">{item.by}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted">No timeline entries recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
