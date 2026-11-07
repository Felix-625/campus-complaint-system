const mongoose = require('mongoose');
const { getAssignedOffice } = require('../utils/officeMapping');

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'],
    },
    note: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    by: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    trackingCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Facilities', 'Academic', 'Security', 'Canteen', 'Other'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
      index: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Submitted',
      index: true,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    timeline: [timelineEntrySchema],
    assignedOffice: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to ensure assignedOffice matches category and anonymous privacy rules
complaintSchema.pre('validate', function (next) {
  if (this.category && !this.assignedOffice) {
    this.assignedOffice = getAssignedOffice(this.category);
  }

  // Strict privacy rule: if anonymous, submittedBy MUST be null
  if (this.isAnonymous) {
    this.submittedBy = null;
  }

  next();
});

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
