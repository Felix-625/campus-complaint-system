import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Upload,
  Copy,
  Check,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  X,
} from 'lucide-react';

const CATEGORIES = ['Facilities', 'Academic', 'Security', 'Canteen', 'Other'];

export const SubmitComplaint = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: 'Facilities',
    title: '',
    location: '',
    description: '',
    isAnonymous: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Success state
  const [submittedCode, setSubmittedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype || file.type)) {
      setError('Only JPG and PNG images are supported.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image file must be smaller than 2MB.');
      return;
    }

    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.location.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('category', formData.category);
      data.append('title', formData.title.trim());
      data.append('location', formData.location.trim());
      data.append('description', formData.description.trim());
      data.append('isAnonymous', formData.isAnonymous);

      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await api.post('/complaints', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setSubmittedCode(res.data.trackingCode);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to submit complaint. Please check your network connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyTrackingCode = () => {
    if (submittedCode) {
      navigator.clipboard.writeText(submittedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // If successfully submitted, show prominent code receipt card
  if (submittedCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-surface rounded-lg border border-border shadow-md p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-status-resolved-bg text-status-resolved-fg flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Check className="w-8 h-8" aria-hidden="true" />
          </div>

          <h2 className="text-2xl font-bold text-text">Complaint Submitted Successfully!</h2>
          <p className="mt-2 text-sm text-muted">
            Your complaint has been registered in the system. Use the unique tracking code below to monitor updates.
          </p>

          {/* Prominent Code Card */}
          <div className="mt-6 bg-surface-alt/30 border-2 border-dashed border-primary rounded-lg p-6">
            <span className="text-xs font-semibold text-muted uppercase tracking-widest block mb-1">
              Your Unique Tracking Code
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-primary tracking-widest my-2 select-all">
              {submittedCode}
            </div>

            <button
              onClick={copyTrackingCode}
              className="mt-3 inline-flex items-center space-x-2 px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-on-primary text-sm font-semibold shadow-sm transition"
            >
              {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Tracking Code'}</span>
            </button>
          </div>

          {/* Important Warning Alert */}
          <div className="mt-6 bg-accent/40 border border-border rounded-lg p-4 text-left flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-text flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-text leading-relaxed">
              <strong className="font-semibold block text-text">Important: Save this tracking code!</strong>
              {formData.isAnonymous ? (
                <span>
                  Since this complaint was submitted <strong>anonymously</strong>, this code is the{' '}
                  <em>only</em> way you can track its review progress and resolution. It will not be linked to
                  any account.
                </span>
              ) : (
                <span>
                  You can also find this complaint in your <Link to="/my-complaints" className="underline font-semibold">My Complaints</Link> page,
                  or share this tracking code with fellow students.
                </span>
              )}
            </div>
          </div>

          {/* Action Navigation */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/track?code=${submittedCode}`}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-on-primary text-sm font-semibold shadow-sm transition"
            >
              <span>Track Complaint Now</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <button
              onClick={() => {
                setSubmittedCode(null);
                setFormData({
                  category: 'Facilities',
                  title: '',
                  location: '',
                  description: '',
                  isAnonymous: false,
                });
                removeImage();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-border text-text text-sm font-semibold hover:bg-surface-alt/30 transition shadow-sm"
            >
              Submit Another Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-text tracking-tight">File a Campus Complaint</h1>
        <p className="mt-2 text-sm text-muted">
          Provide accurate details about the problem to help the assigned campus office resolve it quickly.
        </p>
      </div>

      {error && (
        <div
          id="submit-error"
          className="mb-6 p-4 rounded-lg bg-status-rejected-bg/15 border border-danger text-danger text-sm flex items-start space-x-2"
          role="alert"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface rounded-lg border border-border shadow-sm p-6 sm:p-8 space-y-6">
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-text mb-1">
            Category <span className="text-danger">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring transition min-h-[44px]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">
            The complaint will be routed automatically to the designated campus department.
          </p>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-text mb-1">
            Title / Summary <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            maxLength={150}
            placeholder="e.g., Broken AC in Lecture Hall 3, Slippery staircase on 2nd floor"
            value={formData.title}
            onChange={handleInputChange}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'submit-error' : undefined}
            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-text text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring transition min-h-[44px]"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-text mb-1">
            Exact Location <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            required
            maxLength={100}
            placeholder="e.g., Science Complex Level 2 Restroom, East Parking Lot"
            value={formData.location}
            onChange={handleInputChange}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'submit-error' : undefined}
            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-text text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring transition min-h-[44px]"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-text mb-1">
            Detailed Description <span className="text-danger">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            maxLength={2000}
            placeholder="Describe what is happening, when it started, and any hazards or context that could help staff resolve it..."
            value={formData.description}
            onChange={handleInputChange}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'submit-error' : undefined}
            className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-text text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
          />
        </div>

        {/* Optional Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-text mb-1">
            Attach Photo (Optional, Max 2MB, JPG/PNG)
          </label>

          {imagePreview ? (
            <div className="relative mt-2 inline-block border border-border rounded-lg overflow-hidden shadow-sm">
              <img src={imagePreview} alt="Preview" className="max-h-48 object-cover rounded-md" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-sidebar-bg text-on-dark rounded-full transition hover:opacity-80"
                title="Remove photo"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-lg hover:border-primary transition cursor-pointer relative">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted" aria-hidden="true" />
                <div className="flex text-xs text-text">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer font-semibold text-primary hover:underline focus-within:outline-none"
                  >
                    <span>Upload a photo</span>
                    <input
                      id="image-upload"
                      name="image"
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-[11px] text-muted">PNG, JPG up to 2MB</p>
              </div>
            </div>
          )}
          <p className="text-[11px] text-muted mt-1.5">
            Photos may be shown publicly. Avoid including faces, names, or ID numbers.
          </p>
        </div>

        {/* Anonymous Toggle */}
        <div className="bg-surface-alt/20 border border-border rounded-lg p-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-border text-primary focus:ring-focus-ring mt-1"
            />
            <div>
              <div className="text-sm font-bold text-text flex items-center space-x-1.5">
                <EyeOff className="w-4 h-4 text-muted" aria-hidden="true" />
                <span>Submit Anonymously</span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {isAuthenticated
                  ? "When checked, your name and account info are completely removed from this report. Neither administrators nor students will see who submitted it."
                  : "You are not logged in. This report will be anonymous by default."}
              </p>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-md bg-primary hover:bg-primary-hover text-on-primary font-semibold shadow-sm transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting Complaint...</span>
              </>
            ) : (
              <span>Submit Complaint</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
