import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardList,
  PlusCircle,
  MapPin,
  Calendar,
  Building,
  ArrowRight,
  Clock,
  CheckCircle2,
  ThumbsUp,
  FileText,
} from 'lucide-react';
import { StatusBadge, CategoryBadge } from '../components/Badges';

export const MyComplaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMine = async () => {
      try {
        const res = await api.get('/complaints/mine');
        if (res.data.success) {
          setComplaints(res.data.complaints);
        }
      } catch (err) {
        setError('Failed to load your complaints.');
      } finally {
        setLoading(false);
      }
    };
    fetchMine();
  }, []);

  const totalCount = complaints.length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'In Progress'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-text tracking-tight">My Complaints</h1>
          <p className="mt-1 text-sm text-muted">
            Welcome back, <span className="font-semibold text-text">{user?.name}</span>. Here are the
            reports linked to your student account.
          </p>
        </div>
        <Link
          to="/submit"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-on-primary text-sm font-semibold shadow-sm transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" aria-hidden="true" />
          <span>New Complaint</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-surface rounded-lg border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reports</span>
            <ClipboardList className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text">{totalCount}</div>
        </div>

        <div className="bg-surface rounded-lg border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active / In Progress</span>
            <Clock className="w-4 h-4 text-muted" aria-hidden="true" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text">{inProgressCount}</div>
        </div>

        <div className="bg-surface rounded-lg border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text">{resolvedCount}</div>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-surface rounded-lg border border-border p-6 animate-pulse h-36"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-status-rejected-bg/15 border border-danger rounded-lg p-6 text-danger text-center text-sm font-medium">
          {error}
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border p-12 text-center">
          <FileText className="w-12 h-12 text-muted mx-auto mb-3" aria-hidden="true" />
          <h3 className="font-bold text-text text-lg">No complaints filed yet</h3>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto mb-6">
            You haven't submitted any complaints under your registered account.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-on-primary text-sm font-semibold transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span>File Your First Complaint</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((item) => {
            const latestTimeline =
              item.timeline && item.timeline.length > 0
                ? item.timeline[item.timeline.length - 1]
                : null;

            return (
              <div
                key={item._id}
                className="bg-surface rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-text bg-surface-alt/30 px-2 py-0.5 rounded-sm border border-border">
                      {item.trackingCode}
                    </span>
                    <CategoryBadge category={item.category} />
                    <StatusBadge status={item.status} />
                  </div>

                  <h3 className="text-base font-bold text-text">{item.title}</h3>
                  <p className="text-xs text-muted line-clamp-2">{item.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                    <span className="inline-flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
                      <span>{item.location}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      <Building className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
                      <span>{item.assignedOffice}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1 text-text font-medium">
                      <ThumbsUp className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                      <span>{item.upvoteCount} upvotes</span>
                    </span>
                  </div>

                  {latestTimeline && (
                    <div className="mt-2 bg-surface-alt/15 border border-border rounded-md p-2.5 text-xs text-text">
                      <span className="font-semibold text-text">Latest Update:</span>{' '}
                      {latestTimeline.note}
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col items-center justify-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                  <Link
                    to={`/track?code=${item.trackingCode}`}
                    className="inline-flex items-center space-x-1 px-4 py-2 rounded-md bg-surface hover:bg-surface-alt/30 text-text border border-border text-xs font-semibold transition shadow-sm"
                  >
                    <span>View Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
