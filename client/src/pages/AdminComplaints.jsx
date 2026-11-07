import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getImageUrl } from '../api/axios';
import {
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  EyeOff,
  Send,
  ZoomIn,
} from 'lucide-react';
import { StatusBadge, CategoryBadge } from '../components/Badges';
import { ImageLightbox } from '../components/ImageLightbox';

const CATEGORIES = ['All', 'Facilities', 'Academic', 'Security', 'Canteen', 'Other'];
const STATUSES = ['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];

export const AdminComplaints = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [overdueOnly, setOverdueOnly] = useState(searchParams.get('overdueOnly') === 'true');
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ complaints: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
      };

      if (category !== 'All') params.category = category;
      if (status !== 'All') params.status = status;
      if (search.trim()) params.search = search.trim();
      if (overdueOnly) params.overdueOnly = true;

      const res = await api.get('/admin/complaints', { params });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [category, status, overdueOnly, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const openStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setStatusNote('');
    setModalError(null);
  };

  const closeStatusModal = () => {
    setSelectedComplaint(null);
    setModalError(null);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusNote.trim()) {
      setModalError('Please provide a note explaining this update.');
      return;
    }

    setUpdating(true);
    setModalError(null);

    try {
      const res = await api.patch(`/admin/complaints/${selectedComplaint._id}/status`, {
        status: newStatus,
        note: statusNote.trim(),
      });

      if (res.data.success) {
        setSuccessToast(`Complaint ${selectedComplaint.trackingCode} updated to "${newStatus}"!`);
        setTimeout(() => setSuccessToast(null), 3000);
        closeStatusModal();
        fetchComplaints();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-overlay bg-primary text-on-primary px-5 py-3 rounded-md shadow-md flex items-center space-x-2 text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          title={lightboxImage.title}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text tracking-tight">Manage Complaints</h1>
          <p className="mt-1 text-sm text-muted">
            Review incoming complaints, dispatch service personnel, and record timeline updates.
          </p>
        </div>
        <div className="text-xs text-muted bg-surface px-3 py-2 rounded-md border border-border self-start sm:self-auto font-medium shadow-sm">
          Total: <span className="font-bold text-text">{data.total}</span> records
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-3" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search code, title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-border text-sm placeholder:text-muted text-text bg-surface focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-md border border-border text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-md border border-border text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
          </div>

          {/* Overdue Checkbox */}
          <div className="flex items-center space-x-2 px-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-danger cursor-pointer select-none">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => {
                  setOverdueOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-border text-danger focus:ring-focus-ring"
              />
              <span className="flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-danger" aria-hidden="true" />
                <span>Overdue Only (&gt; 3 days)</span>
              </span>
            </label>
          </div>
        </form>
      </div>

      {/* Complaints Table */}
      <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-muted">Loading complaints list...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-danger font-medium text-sm">{error}</div>
        ) : data.complaints.length === 0 ? (
          <div className="p-12 text-center text-muted text-sm">
            No complaints match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-left text-sm">
              <thead className="bg-surface-alt/20 text-muted text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Tracking Code</th>
                  <th className="px-6 py-3.5">Category & Title</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Location & Office</th>
                  <th className="px-6 py-3.5">Submitter</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text">
                {data.complaints.map((item) => (
                  <tr
                    key={item._id}
                    className={`transition hover:bg-surface-alt/15 ${
                      item.isOverdue ? 'bg-status-overdue-bg/40 border-l-4 border-l-danger' : ''
                    }`}
                  >
                    {/* Tracking Code */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-text bg-surface-alt/30 px-2 py-1 rounded-sm border border-border">
                        {item.trackingCode}
                      </span>
                    </td>

                    {/* Category & Title */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <CategoryBadge category={item.category} />
                      </div>
                      <div className="font-semibold text-text line-clamp-1">{item.title}</div>
                      <div className="text-xs text-muted line-clamp-1">{item.description}</div>
                    </td>

                    {/* Status with Overdue Warning */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} isOverdue={item.isOverdue} />
                    </td>

                    {/* Location & Assigned Office */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted">
                      <div className="font-medium text-text">{item.location}</div>
                      <div className="text-muted text-[11px]">{item.assignedOffice}</div>
                    </td>

                    {/* Submitter */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted">
                      {item.isAnonymous || !item.submittedBy ? (
                        <span className="inline-flex items-center space-x-1 text-muted">
                          <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Anonymous</span>
                        </span>
                      ) : (
                        <div>
                          <div className="font-semibold text-text">{item.submittedBy.name}</div>
                          <div className="text-muted text-[11px]">{item.submittedBy.email}</div>
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => openStatusModal(item)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md bg-surface hover:bg-surface-alt/40 text-text border border-border text-xs font-semibold transition shadow-sm"
                      >
                        <span>Update Status</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {data.totalPages > 1 && (
          <div className="bg-surface-alt/10 px-6 py-3 border-t border-border flex items-center justify-between text-xs text-muted">
            <span>
              Showing Page <strong className="text-text">{data.page}</strong> of{' '}
              <strong className="text-text">{data.totalPages}</strong>
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-md border border-border bg-surface hover:bg-surface-alt/30 text-text disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                className="p-1.5 rounded-md border border-border bg-surface hover:bg-surface-alt/30 text-text disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STATUS UPDATE MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-overlay flex items-center justify-center p-4 bg-sidebar-bg/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface rounded-lg max-w-2xl w-full shadow-md border border-border overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-alt/20">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-text bg-surface-alt px-2 py-0.5 rounded-sm border border-border">
                  {selectedComplaint.trackingCode}
                </span>
                <span className="font-bold text-base text-text">Update Complaint Status</span>
              </div>
              <button
                onClick={closeStatusModal}
                className="p-1 rounded-md text-muted hover:text-text hover:bg-surface-alt/40 transition"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {modalError && (
                <div
                  id="modal-error"
                  className="p-3.5 rounded-md bg-status-rejected-bg/15 border border-danger text-danger text-xs font-semibold flex items-center space-x-2"
                  role="alert"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Complaint Overview */}
              <div className="bg-surface-alt/15 rounded-md p-4 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <CategoryBadge category={selectedComplaint.category} />
                  <StatusBadge
                    status={selectedComplaint.status}
                    isOverdue={selectedComplaint.isOverdue}
                  />
                </div>
                <h4 className="font-bold text-text text-base">{selectedComplaint.title}</h4>
                <p className="text-xs text-text whitespace-pre-line">{selectedComplaint.description}</p>
                <div className="text-xs text-muted pt-1">
                  Location: <strong className="text-text">{selectedComplaint.location}</strong> • Office:{' '}
                  <strong className="text-text">{selectedComplaint.assignedOffice}</strong>
                </div>

                {/* Attached Photo if present */}
                {selectedComplaint.imageUrl && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-xs font-semibold text-text block mb-1.5">Attached Photo:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxImage({
                          src: getImageUrl(selectedComplaint.imageUrl),
                          alt: `Photo attached to complaint ${selectedComplaint.trackingCode}`,
                          title: selectedComplaint.title,
                        })
                      }
                      className="group relative inline-block border border-border rounded-md overflow-hidden hover:opacity-95 transition focus:outline-none focus:ring-2 focus:ring-focus-ring"
                      aria-label="View photo in lightbox"
                    >
                      <img
                        src={getImageUrl(selectedComplaint.imageUrl)}
                        alt={`Attached to ${selectedComplaint.title}`}
                        className="max-h-48 rounded-md object-contain bg-surface-alt/10"
                      />
                      <div className="absolute inset-0 bg-sidebar-bg/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-on-dark">
                        <ZoomIn className="w-5 h-5" aria-hidden="true" />
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Existing Timeline */}
              <div>
                <h5 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  Existing Timeline History ({selectedComplaint.timeline?.length || 0})
                </h5>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedComplaint.timeline?.map((t, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-surface border border-border rounded-md p-2.5 flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-text">{t.status}:</span>{' '}
                        <span className="text-text">{t.note}</span>
                        <div className="text-[10px] text-muted mt-0.5">By: {t.by}</div>
                      </div>
                      <span className="text-[10px] text-muted whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleStatusUpdate} id="status-update-form" className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
                    Select New Status <span className="text-danger">*</span>
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm font-semibold bg-surface text-text focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
                    Action Taken / Status Note <span className="text-danger">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide details on the action taken, contractor dispatch, or resolution summary..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    aria-invalid={modalError ? 'true' : 'false'}
                    aria-describedby={modalError ? 'modal-error' : undefined}
                    className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-sm placeholder:text-muted text-text focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
                  />
                  <p className="text-[11px] text-muted mt-1">
                    This note will be permanently added to the public timeline under your admin name.
                  </p>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-end space-x-3 bg-surface-alt/20">
              <button
                type="button"
                onClick={closeStatusModal}
                className="px-4 py-2 rounded-md border border-border bg-surface text-text text-xs font-semibold hover:bg-surface-alt/30 transition shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="status-update-form"
                disabled={updating}
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-md bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {updating ? (
                  <span>Updating...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Apply & Append Timeline</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
