import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  ShieldAlert,
  Search,
  PlusCircle,
  EyeOff,
  GitBranch,
  ThumbsUp,
  ClockAlert,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { StatusBadge, CategoryBadge } from '../components/Badges';

export const Home = () => {
  const [trackingInput, setTrackingInput] = useState('');
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      navigate(`/track?code=${encodeURIComponent(trackingInput.trim().toUpperCase())}`);
    }
  };

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get('/complaints/public');
        if (res.data.success) {
          setRecentComplaints(res.data.complaints.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load recent complaints', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface pt-12 pb-16 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-pill text-xs font-semibold bg-accent text-on-accent mb-6 shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Campus Accountability & Resolution Portal</span>
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text tracking-tight leading-tight">
            Speak up for your campus. <br className="hidden sm:inline" />
            <span className="text-primary underline decoration-accent decoration-wavy decoration-2">
              Track real resolutions.
            </span>
          </h1>

          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Report facilities issues, safety hazards, or academic concerns securely. Submit anonymously or
            under your student name, and watch updates roll out on a public timeline.
          </p>

          {/* Quick Tracking Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <form
              onSubmit={handleTrackSubmit}
              className="flex items-center bg-surface rounded-lg shadow-sm border border-border p-1.5 focus-within:ring-2 focus-within:ring-focus-ring transition"
            >
              <div className="pl-3 text-muted">
                <Search className="w-5 h-5" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Enter Tracking Code (e.g., CMP-7K9XM)..."
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm text-text placeholder:text-muted bg-transparent focus:outline-none uppercase font-mono tracking-wider"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-on-primary rounded-md text-sm font-semibold transition flex-shrink-0 shadow-sm"
              >
                Track
              </button>
            </form>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/submit"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-md bg-primary hover:bg-primary-hover text-on-primary font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-5 h-5" aria-hidden="true" />
              <span>File a Complaint</span>
            </Link>
            <Link
              to="/public"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-md bg-surface hover:bg-surface-alt/30 text-text border border-border font-semibold shadow-sm transition"
            >
              <span>Explore Public Board</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Feature Value Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-text">
            Why Students & Faculty Trust Our System
          </h2>
          <p className="mt-2 text-sm text-muted">
            Built from the ground up for privacy, transparency, and administrative responsiveness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-md bg-surface-alt text-text flex items-center justify-center mb-4">
              <EyeOff className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-base text-text mb-2">100% Anonymous Option</h3>
            <p className="text-xs text-muted leading-relaxed">
              Submit complaints without leaving any identifiable record. Receive a unique tracking code to follow
              up safely.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-md bg-surface-alt text-text flex items-center justify-center mb-4">
              <GitBranch className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-base text-text mb-2">Public Status Timeline</h3>
            <p className="text-xs text-muted leading-relaxed">
              Track live progress as campus offices review, assign, inspect, and complete your reported issues with
              time-stamped notes.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-md bg-accent text-on-accent flex items-center justify-center mb-4">
              <ThumbsUp className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-base text-text mb-2">Community Upvoting</h3>
            <p className="text-xs text-muted leading-relaxed">
              Students can upvote campus-wide issues so administrators can prioritize high-impact complaints first.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-md bg-status-overdue-bg text-status-overdue-fg flex items-center justify-center mb-4">
              <ClockAlert className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-base text-text mb-2">Overdue Accountability</h3>
            <p className="text-xs text-muted leading-relaxed">
              Complaints inactive for more than 3 days are highlighted on administrative consoles to prevent
              delays.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Public Complaints Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text">Recent Campus Reports</h2>
            <p className="text-xs text-muted mt-0.5">Live updates from the public board</p>
          </div>
          <Link
            to="/public"
            className="text-sm font-semibold text-primary hover:underline inline-flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-surface p-6 rounded-lg border border-border animate-pulse h-44"></div>
            ))}
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="bg-surface p-8 rounded-lg border border-border text-center text-muted text-sm">
            No public complaints reported yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentComplaints.map((item) => (
              <div
                key={item._id}
                className="bg-surface rounded-lg border border-border p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <CategoryBadge category={item.category} />
                    <StatusBadge status={item.status} />
                  </div>

                  <h3 className="font-bold text-text text-base line-clamp-1 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted text-xs line-clamp-2 mb-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                  <span className="inline-flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-muted flex-shrink-0" aria-hidden="true" />
                    <span className="truncate max-w-[130px]">{item.location}</span>
                  </span>
                  <Link
                    to={`/track?code=${item.trackingCode}`}
                    className="font-semibold text-primary hover:underline font-mono"
                  >
                    {item.trackingCode}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
