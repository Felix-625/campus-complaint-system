import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  ArrowRight,
  TrendingUp,
  Building2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CategoryBadge } from '../components/Badges';

const CATEGORY_CHART_COLORS = {
  Facilities: 'var(--chart-1)',
  Academic: 'var(--chart-2)',
  Security: 'var(--chart-3)',
  Canteen: 'var(--chart-4)',
  Other: 'var(--chart-5)',
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        setError('Failed to load administrative analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-muted">Loading admin dashboard & metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-danger">
        <p className="font-semibold">{error || 'Could not load statistics.'}</p>
      </div>
    );
  }

  const categoryChartData = Object.keys(stats.categoryCounts || {}).map((cat) => ({
    name: cat,
    count: stats.categoryCounts[cat],
    fill: CATEGORY_CHART_COLORS[cat] || 'var(--chart-1)',
  }));

  const dailyChartData = (stats.complaintsPerDay || []).map((d) => ({
    date: d.date.slice(5),
    complaints: d.count,
  }));

  const inProgressTotal =
    (stats.statusCounts['Submitted'] || 0) +
    (stats.statusCounts['Under Review'] || 0) +
    (stats.statusCounts['In Progress'] || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Real-time campus issue resolution rates, category distributions, and overdue escalation tracking.
          </p>
        </div>
        <Link
          to="/admin/complaints"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-on-primary text-sm font-semibold shadow-sm transition self-start sm:self-auto"
        >
          <Layers className="w-4 h-4" aria-hidden="true" />
          <span>Manage All Complaints</span>
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface rounded-lg border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Complaints</span>
            <Layers className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div className="text-3xl font-extrabold text-text">{stats.total}</div>
          <div className="mt-2 text-xs text-muted">
            {stats.anonymousCount} Anonymous • {stats.identifiedCount} Identified
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Complaints</span>
            <Clock className="w-4 h-4 text-muted" aria-hidden="true" />
          </div>
          <div className="text-3xl font-extrabold text-text">{inProgressTotal}</div>
          <div className="mt-2 text-xs text-muted">Submitted, Review, or In Progress</div>
        </div>

        <div className="bg-surface rounded-lg border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div className="text-3xl font-extrabold text-text">
            {stats.statusCounts['Resolved'] || 0}
          </div>
          <div className="mt-2 text-xs text-muted">
            {stats.total > 0
              ? `${Math.round(((stats.statusCounts['Resolved'] || 0) / stats.total) * 100)}% resolution rate`
              : '0%'}
          </div>
        </div>

        {/* Overdue Card (Highlighted with danger tokens) */}
        <div
          className={`rounded-lg border p-5 shadow-sm transition ${
            stats.overdueCount > 0
              ? 'bg-status-overdue-bg border-status-overdue-border'
              : 'bg-surface border-border'
          }`}
        >
          <div className="flex items-center justify-between text-muted mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                stats.overdueCount > 0 ? 'text-danger' : 'text-muted'
              }`}
            >
              Overdue Issues
            </span>
            <AlertTriangle
              className={`w-4 h-4 ${stats.overdueCount > 0 ? 'text-danger animate-bounce' : 'text-muted'}`}
              aria-hidden="true"
            />
          </div>
          <div
            className={`text-3xl font-extrabold ${
              stats.overdueCount > 0 ? 'text-danger' : 'text-text'
            }`}
          >
            {stats.overdueCount}
          </div>
          <div
            className={`mt-2 text-xs ${
              stats.overdueCount > 0 ? 'text-danger font-semibold' : 'text-muted'
            }`}
          >
            No update in &gt; 3 days
          </div>
        </div>
      </div>

      {/* OVERDUE ALERTS SECTION */}
      {stats.overdueComplaints && stats.overdueComplaints.length > 0 && (
        <div className="bg-status-overdue-bg border-2 border-status-overdue-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-md bg-danger text-on-dark shadow-sm">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-danger">Overdue Complaints Requiring Action</h3>
                <p className="text-xs text-muted">
                  These complaints have had no status update or timeline note for more than 3 days.
                </p>
              </div>
            </div>
            <Link
              to="/admin/complaints?overdueOnly=true"
              className="text-xs font-bold text-danger hover:underline"
            >
              Filter in Table →
            </Link>
          </div>

          <div className="space-y-3">
            {stats.overdueComplaints.map((item) => {
              const daysSinceUpdate = Math.floor(
                (Date.now() - new Date(item.lastUpdated).getTime()) / (24 * 60 * 60 * 1000)
              );

              return (
                <div
                  key={item._id}
                  className="bg-surface rounded-md border border-status-overdue-border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-danger bg-status-overdue-bg px-2 py-0.5 rounded border border-status-overdue-border">
                        {item.trackingCode}
                      </span>
                      <CategoryBadge category={item.category} />
                      <span
                        className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-pill text-xs font-bold bg-status-overdue-bg text-status-overdue-fg border border-status-overdue-border shadow-sm"
                        role="status"
                        aria-label="Overdue issue badge"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                        <span>Overdue ({daysSinceUpdate}d inactive)</span>
                      </span>
                    </div>
                    <div className="text-sm font-bold text-text">{item.title}</div>
                    <div className="text-xs text-muted">
                      Location: {item.location} • Assigned: {item.assignedOffice}
                    </div>
                  </div>

                  <Link
                    to={`/admin/complaints?search=${item.trackingCode}`}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-danger hover:bg-danger-hover text-on-dark text-xs font-semibold shadow-sm transition self-start sm:self-auto"
                  >
                    <span>Update Status</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics Charts (Recharts with CSS Variables) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Breakdown by Category */}
        <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-text">Complaints by Category</h3>
              <p className="text-xs text-muted">Distribution across campus service areas</p>
            </div>
            <Building2 className="w-4 h-4 text-muted" aria-hidden="true" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <Tooltip
                  cursor={{ fill: 'var(--color-surface-alt)', opacity: 0.2 }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '12px',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 14-Day Complaint Activity */}
        <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-text">14-Day Complaint Volume</h3>
              <p className="text-xs text-muted">Intake rate over the past two weeks</p>
            </div>
            <TrendingUp className="w-4 h-4 text-muted" aria-hidden="true" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <Tooltip
                  cursor={{ fill: 'var(--color-surface-alt)', opacity: 0.2 }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '12px',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                  }}
                />
                <Bar dataKey="complaints" radius={[4, 4, 0, 0]} fill="var(--chart-2)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
