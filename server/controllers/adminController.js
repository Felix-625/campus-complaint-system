const Complaint = require('../models/Complaint');

// Helper to determine if a complaint is overdue
// Overdue definition: status is NOT Resolved or Rejected, and the last timeline update is more than 3 days old
const isComplaintOverdue = (complaint) => {
  if (complaint.status === 'Resolved' || complaint.status === 'Rejected') {
    return false;
  }

  const timeline = complaint.timeline || [];
  if (timeline.length === 0) {
    const ageMs = Date.now() - new Date(complaint.createdAt).getTime();
    return ageMs > 3 * 24 * 60 * 60 * 1000;
  }

  const lastEntry = timeline[timeline.length - 1];
  const lastUpdateMs = new Date(lastEntry.date).getTime();
  const diffMs = Date.now() - lastUpdateMs;
  return diffMs > 3 * 24 * 60 * 60 * 1000;
};

// @desc Get all complaints with filters and pagination
// @route GET /api/admin/complaints
// @access Private (Admin)
const getAdminComplaints = async (req, res, next) => {
  try {
    const {
      status,
      category,
      search,
      startDate,
      endDate,
      overdueOnly,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { trackingCode: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { assignedOffice: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Fetch complaints and populate submitter name/email if not anonymous
    let complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email department')
      .sort({ createdAt: -1 })
      .lean();

    // Attach isOverdue flag and filter if overdueOnly is true
    let formatted = complaints.map((c) => {
      const overdue = isComplaintOverdue(c);
      return {
        ...c,
        isOverdue: overdue,
        // Ensure privacy integrity: if isAnonymous is true, clear submittedBy
        submittedBy: c.isAnonymous ? null : c.submittedBy,
        upvoteCount: (c.upvotes || []).length,
      };
    });

    if (overdueOnly === 'true' || overdueOnly === true) {
      formatted = formatted.filter((c) => c.isOverdue);
    }

    const total = formatted.length;
    const paginatedComplaints = formatted.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      complaints: paginatedComplaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update complaint status and append timeline entry
// @route PATCH /api/admin/complaints/:id/status
// @access Private (Admin)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    if (!note || note.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A status note or resolution explanation is required.',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const previousStatus = complaint.status;
    complaint.status = status;

    // Push new entry to timeline
    complaint.timeline.push({
      status,
      note: note.trim(),
      date: new Date(),
      by: req.user.name || 'Campus Administrator',
    });

    await complaint.save();

    const formattedComplaint = complaint.toObject();
    formattedComplaint.isOverdue = isComplaintOverdue(formattedComplaint);
    if (formattedComplaint.isAnonymous) {
      formattedComplaint.submittedBy = null;
    }

    res.status(200).json({
      success: true,
      message: `Complaint status updated from "${previousStatus}" to "${status}".`,
      complaint: formattedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get statistics for admin dashboard
// @route GET /api/admin/stats
// @access Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({}).lean();

    // 1. Counts by status
    const statusCounts = {
      Submitted: 0,
      'Under Review': 0,
      'In Progress': 0,
      Resolved: 0,
      Rejected: 0,
    };

    // 2. Counts by category
    const categoryCounts = {
      Facilities: 0,
      Academic: 0,
      Security: 0,
      Canteen: 0,
      Other: 0,
    };

    let overdueCount = 0;
    let anonymousCount = 0;
    let identifiedCount = 0;

    complaints.forEach((c) => {
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status]++;
      }
      if (categoryCounts[c.category] !== undefined) {
        categoryCounts[c.category]++;
      }
      if (isComplaintOverdue(c)) {
        overdueCount++;
      }
      if (c.isAnonymous) {
        anonymousCount++;
      } else {
        identifiedCount++;
      }
    });

    // 3. Complaints per day for the last 14 days
    const dailyMap = {};
    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dailyMap[dateKey] = 0;
    }

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    complaints.forEach((c) => {
      const createdDate = new Date(c.createdAt);
      if (createdDate >= fourteenDaysAgo) {
        const dateKey = createdDate.toISOString().split('T')[0];
        if (dailyMap[dateKey] !== undefined) {
          dailyMap[dateKey]++;
        }
      }
    });

    const complaintsPerDay = Object.keys(dailyMap).map((date) => ({
      date,
      count: dailyMap[date],
    }));

    // List of currently overdue complaints for quick alert widget
    const overdueComplaints = complaints
      .filter((c) => isComplaintOverdue(c))
      .map((c) => ({
        _id: c._id,
        trackingCode: c.trackingCode,
        title: c.title,
        category: c.category,
        location: c.location,
        status: c.status,
        assignedOffice: c.assignedOffice,
        lastUpdated: (c.timeline && c.timeline.length > 0)
          ? c.timeline[c.timeline.length - 1].date
          : c.createdAt,
      }));

    res.status(200).json({
      success: true,
      stats: {
        total: complaints.length,
        statusCounts,
        categoryCounts,
        overdueCount,
        anonymousCount,
        identifiedCount,
        complaintsPerDay,
        overdueComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminComplaints,
  updateComplaintStatus,
  getAdminStats,
};
