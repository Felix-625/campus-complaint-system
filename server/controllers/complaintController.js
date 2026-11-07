const Complaint = require('../models/Complaint');
const { generateTrackingCode } = require('../utils/trackingCode');
const { getAssignedOffice } = require('../utils/officeMapping');

const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'campus-complaints' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
});

// @desc Submit a new complaint (anonymous or student)
// @route POST /api/complaints
// @access Public (with optional auth)
const submitComplaint = async (req, res, next) => {
  try {
    const { category, title, description, location } = req.body;
    let isAnonymous = req.body.isAnonymous === true || req.body.isAnonymous === 'true';

    // Validate inputs
    if (!category || !title || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, title, description, and location.',
      });
    }

    const validCategories = ['Facilities', 'Academic', 'Security', 'Canteen', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    // Determine submitter and anonymous privacy rules
    let submittedBy = null;
    let submitterName = 'Anonymous Student';

    if (!isAnonymous && req.user) {
      submittedBy = req.user._id;
      submitterName = req.user.name;
    } else {
      // If anonymous or user not logged in, enforce anonymous privacy
      isAnonymous = true;
      submittedBy = null;
      submitterName = 'Anonymous Student';
    }

    // Generate unique tracking code
    let trackingCode = generateTrackingCode();
    let codeExists = await Complaint.findOne({ trackingCode });
    while (codeExists) {
      trackingCode = generateTrackingCode();
      codeExists = await Complaint.findOne({ trackingCode });
    }

    // Check optional image
    let imageUrl = null;
   if (req.file) {
     const result = await uploadToCloudinary(req.file.buffer);
     imageUrl = result.secure_url;
   }

    const assignedOffice = getAssignedOffice(category);

    const initialTimeline = [
      {
        status: 'Submitted',
        note: 'Complaint successfully filed and logged in system.',
        date: new Date(),
        by: submitterName,
      },
    ];

    const complaint = await Complaint.create({
      trackingCode,
      category,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      imageUrl,
      isAnonymous,
      submittedBy,
      status: 'Submitted',
      upvotes: [],
      timeline: initialTimeline,
      assignedOffice,
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      trackingCode: complaint.trackingCode,
      complaint: {
        id: complaint._id,
        trackingCode: complaint.trackingCode,
        category: complaint.category,
        title: complaint.title,
        status: complaint.status,
        isAnonymous: complaint.isAnonymous,
        assignedOffice: complaint.assignedOffice,
        createdAt: complaint.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Track a complaint by tracking code (Public)
// @route GET /api/complaints/track/:code
// @access Public
const trackComplaint = async (req, res, next) => {
  try {
    const code = req.params.code ? req.params.code.trim().toUpperCase() : '';

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Tracking code is required.',
      });
    }

    // Strict privacy projection: Never return submittedBy or private metadata
    const complaint = await Complaint.findOne({ trackingCode: code }).select(
      'trackingCode category title description location status timeline assignedOffice imageUrl createdAt'
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `No complaint found with tracking code "${code}". Please verify and try again.`,
      });
    }

    res.status(200).json({
      success: true,
      complaint: {
        trackingCode: complaint.trackingCode,
        category: complaint.category,
        title: complaint.title,
        description: complaint.description,
        location: complaint.location,
        status: complaint.status,
        timeline: complaint.timeline,
        assignedOffice: complaint.assignedOffice,
        imageUrl: complaint.imageUrl,
        createdAt: complaint.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get public board of complaints
// @route GET /api/complaints/public
// @access Public (with optional auth to detect if current user upvoted)
const getPublicComplaints = async (req, res, next) => {
  try {
    const { category, status } = req.query;

    const query = {
      status: { $ne: 'Rejected' },
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const complaints = await Complaint.find(query)
      .select('trackingCode category title description location status upvotes imageUrl assignedOffice createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const currentUserId = req.user ? req.user._id.toString() : null;

    const formattedComplaints = complaints.map((c) => ({
      _id: c._id,
      trackingCode: c.trackingCode,
      category: c.category,
      title: c.title,
      description: c.description,
      location: c.location,
      status: c.status,
      assignedOffice: c.assignedOffice,
      imageUrl: c.imageUrl,
      createdAt: c.createdAt,
      upvoteCount: (c.upvotes || []).length,
      hasUpvoted: currentUserId ? (c.upvotes || []).some((id) => id.toString() === currentUserId) : false,
    }));

    res.status(200).json({
      success: true,
      count: formattedComplaints.length,
      complaints: formattedComplaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get logged-in student's complaints
// @route GET /api/complaints/mine
// @access Private (Student)
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ submittedBy: req.user._id })
      .select('trackingCode category title description location status upvotes timeline assignedOffice imageUrl createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const currentUserId = req.user._id.toString();

    const formattedComplaints = complaints.map((c) => ({
      _id: c._id,
      trackingCode: c.trackingCode,
      category: c.category,
      title: c.title,
      description: c.description,
      location: c.location,
      status: c.status,
      assignedOffice: c.assignedOffice,
      imageUrl: c.imageUrl,
      timeline: c.timeline,
      createdAt: c.createdAt,
      upvoteCount: (c.upvotes || []).length,
      hasUpvoted: (c.upvotes || []).some((id) => id.toString() === currentUserId),
    }));

    res.status(200).json({
      success: true,
      count: formattedComplaints.length,
      complaints: formattedComplaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Upvote or remove upvote from a complaint
// @route POST /api/complaints/:id/upvote
// @access Private (Student)
const toggleUpvote = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    if (complaint.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot upvote a rejected complaint.',
      });
    }

    const userId = req.user._id;
    const index = complaint.upvotes.findIndex((id) => id.toString() === userId.toString());

    let upvoted = false;
    if (index === -1) {
      complaint.upvotes.push(userId);
      upvoted = true;
    } else {
      complaint.upvotes.splice(index, 1);
      upvoted = false;
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      upvoted,
      upvoteCount: complaint.upvotes.length,
      message: upvoted ? 'Complaint upvoted' : 'Upvote removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitComplaint,
  trackComplaint,
  getPublicComplaints,
  getMyComplaints,
  toggleUpvote,
};
