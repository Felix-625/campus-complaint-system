import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ThumbsUp,
  Search,
  Filter,
  MapPin,
  Calendar,
  Building,
  ArrowRight,
  MessageSquare,
  Image as ImageIcon,
  ZoomIn,
} from 'lucide-react';
import { StatusBadge, CategoryBadge } from '../components/Badges';
import { ImageLightbox } from '../components/ImageLightbox';

const CATEGORIES = ['All', 'Facilities', 'Academic', 'Security', 'Canteen', 'Other'];
const STATUSES = ['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved'];

export const PublicBoard = () => {
  const { isAuthenticated, isStudent } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [upvoteActionLoading, setUpvoteActionLoading] = useState({});

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState(null);

  // Track image load errors by complaint ID
  const [imageErrors, setImageErrors] = useState({});

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await api.get('/complaints/public', { params });
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      setError('Failed to fetch complaints. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedCategory, selectedStatus]);

  const handleUpvote = async (complaintId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isStudent) {
      alert('Upvoting is reserved for registered students.');
      return;
    }

    setUpvoteActionLoading((prev) => ({ ...prev, [complaintId]: true }));

    try {
      const res = await api.post(`/complaints/${complaintId}/upvote`);
      if (res.data.success) {
        setComplaints((prev) =>
          prev.map((c) =>
            c._id === complaintId
              ? {
                  ...c,
                  upvoteCount: res.data.upvoteCount,
                  hasUpvoted: res.data.upvoted,
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to upvote', err);
    } finally {
      setUpvoteActionLoading((prev) => ({ ...prev, [complaintId]: false }));
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.title.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term) ||
      c.location.toLowerCase().includes(term) ||
      c.trackingCode.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Lightbox Modal */}
      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          title={lightboxImage.title}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-text tracking-tight">Public Complaint Board</h1>
          <p className="mt-1 text-sm text-muted">
            Transparently track and upvote campus issues reported across all departments.
          </p>
        </div>
        <Link
          to="/submit"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-on-primary text-sm font-semibold shadow-sm transition self-start md:self-auto min-h-[44px]"
        >
          Submit a Complaint
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-5 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-3" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search complaints, codes, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 min-h-[44px] rounded-md border border-border text-sm placeholder:text-muted text-text bg-surface focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-muted flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Category:</span>
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 py-2 min-h-[44px] rounded-md border border-border text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-muted">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 px-3 py-2 min-h-[44px] rounded-md border border-border text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Complaints Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-surface rounded-lg border border-border p-6 animate-pulse h-72"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-status-rejected-bg/15 border border-danger rounded-lg p-6 text-danger text-center">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchComplaints}
            className="mt-3 px-4 py-2 bg-danger text-on-dark rounded-md text-xs font-semibold shadow-sm min-h-[44px]"
          >
            Retry
          </button>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted mx-auto mb-3" aria-hidden="true" />
          <h3 className="font-bold text-text text-lg">No complaints found</h3>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            Try adjusting your category or status filters, or search for a different keyword.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((item) => {
            const hasValidImage = item.imageUrl && !imageErrors[item._id];
            const fullImageUrl = hasValidImage ? getImageUrl(item.imageUrl) : null;

            return (
              <div
                key={item._id}
                className="bg-surface rounded-lg border border-border shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Image on top with fixed 16:9 aspect ratio */}
                  {hasValidImage ? (
                    <div
                      className="relative aspect-video w-full bg-surface-alt/20 border-b border-border overflow-hidden group cursor-pointer"
                      onClick={() =>
                        setLightboxImage({
                          src: fullImageUrl,
                          alt: `Photo attached to complaint: ${item.title}`,
                          title: item.title,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setLightboxImage({
                            src: fullImageUrl,
                            alt: `Photo attached to complaint: ${item.title}`,
                            title: item.title,
                          });
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View photo for ${item.title}`}
                    >
                      <img
                        src={fullImageUrl}
                        alt={`Photo attached to complaint: ${item.title}`}
                        loading="lazy"
                        onError={() =>
                          setImageErrors((prev) => ({ ...prev, [item._id]: true }))
                        }
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-sidebar-bg/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-on-dark">
                        <ZoomIn className="w-6 h-6" aria-hidden="true" />
                      </div>
                    </div>
                  ) : (
                    /* Neutral placeholder block using tokens */
                    <div
                      className="aspect-video w-full bg-surface-alt/20 border-b border-border flex flex-col items-center justify-center text-muted select-none"
                      aria-hidden="true"
                    >
                      <ImageIcon className="w-8 h-8 mb-1.5 opacity-60" aria-hidden="true" />
                      <span className="text-[11px] font-medium tracking-wide">
                        No photo attached
                      </span>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Header: Category & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <CategoryBadge category={item.category} />
                      <StatusBadge status={item.status} />
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-text line-clamp-2 mb-2 leading-snug">
                      {item.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center space-x-1.5 text-xs text-muted mb-2">
                      <MapPin className="w-3.5 h-3.5 text-muted flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center space-x-1.5 text-xs text-muted">
                      <Calendar className="w-3.5 h-3.5 text-muted flex-shrink-0" aria-hidden="true" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Upvote Button & Tracking Link */}
                <div className="bg-surface-alt/15 px-5 py-3.5 border-t border-border flex items-center justify-between">
                  <button
                    onClick={() => handleUpvote(item._id)}
                    disabled={upvoteActionLoading[item._id]}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 min-h-[44px] rounded-md text-xs font-bold transition shadow-sm ${
                      item.hasUpvoted
                        ? 'bg-accent text-on-accent border border-border-strong'
                        : 'bg-surface hover:bg-surface-alt/40 text-text border border-border'
                    }`}
                    title={
                      isAuthenticated
                        ? item.hasUpvoted
                          ? 'Remove upvote'
                          : 'Upvote this issue'
                        : 'Log in as a student to upvote'
                    }
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${item.hasUpvoted ? 'fill-current' : ''}`}
                      aria-hidden="true"
                    />
                    <span>{item.upvoteCount}</span>
                  </button>

                  <Link
                    to={`/track?code=${item.trackingCode}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-primary hover:underline min-h-[44px]"
                  >
                    <span className="font-mono">{item.trackingCode}</span>
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
