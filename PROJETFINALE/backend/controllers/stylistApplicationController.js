const { StylistApplication, User } = require('../models');
const { sendNotification } = require('../utils/notifications');
const { validationResult } = require('express-validator');
const { sendToRole, sendNotificationToUser, sendToUser } = require('../utils/socketIO');

// Submit a new stylist application
exports.submitApplication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const {
      stylistInfo,
      motivation,
      availability
    } = req.body;

    // Check if user already has a pending application
    const existingApplication = await StylistApplication.findOne({
      applicant: req.user._id,
      status: { $in: ['pending', 'interview_requested'] }
    });

    if (existingApplication) {
      return res.status(400).json({
        error: 'Application already exists',
        code: 'DUPLICATE_APPLICATION',
        message: 'You already have a pending application. Please wait for a response.'
      });
    }

    // Create new application
    const application = new StylistApplication({
      applicant: req.user._id,
      stylistInfo,
      motivation,
      availability
    });

    await application.save();

    // Send notification to admin about new application
    try {
      await sendNotification({
        type: 'admin',
        title: 'New Stylist Application',
        message: `New stylist application received from ${req.user.firstName} ${req.user.lastName}`,
        channels: ['email'],
        metadata: {
          applicationId: application._id,
          applicantName: `${req.user.firstName} ${req.user.lastName}`,
          applicantEmail: req.user.email
        }
      });
    } catch (notificationError) {
      console.warn('Failed to send admin notification:', notificationError.message);
    }

    // Emit real-time to admins list
    try {
      sendToRole('admin', 'applications_changed', { action: 'created', application: { id: application._id } });
    } catch (e) {}

    res.status(201).json({
      message: 'Application submitted successfully',
      code: 'APPLICATION_SUBMITTED',
      application: {
        id: application._id,
        status: application.status,
        submittedAt: application.createdAt
      }
    });

  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({
      error: 'Failed to submit application',
      code: 'SUBMISSION_ERROR',
      message: 'An error occurred while submitting your application'
    });
  }
};

// Get user's own application
exports.getMyApplication = async (req, res) => {
  try {
    const application = await StylistApplication.findOne({
      applicant: req.user._id
    }).populate('applicant', 'firstName lastName email phone');

    if (!application) {
      return res.status(404).json({
        error: 'Application not found',
        code: 'APPLICATION_NOT_FOUND',
        message: 'No application found for this user'
      });
    }

    res.json({
      message: 'Application retrieved successfully',
      code: 'APPLICATION_RETRIEVED',
      application
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      error: 'Failed to retrieve application',
      code: 'RETRIEVAL_ERROR'
    });
  }
};

// Admin: Get all applications
exports.getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await StylistApplication.find(query)
      .populate('applicant', 'firstName lastName email phone')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StylistApplication.countDocuments(query);

    res.json({
      message: 'Applications retrieved successfully',
      code: 'APPLICATIONS_RETRIEVED',
      applications,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      error: 'Failed to retrieve applications',
      code: 'RETRIEVAL_ERROR'
    });
  }
};

// Admin: Get single application
exports.getApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await StylistApplication.findById(id)
      .populate('applicant', 'firstName lastName email phone')
      .populate('reviewedBy', 'firstName lastName')
      .populate('interview.requestedBy', 'firstName lastName');

    if (!application) {
      return res.status(404).json({
        error: 'Application not found',
        code: 'APPLICATION_NOT_FOUND'
      });
    }

    res.json({
      message: 'Application retrieved successfully',
      code: 'APPLICATION_RETRIEVED',
      application
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      error: 'Failed to retrieve application',
      code: 'RETRIEVAL_ERROR'
    });
  }
};

// Admin: Approve application
exports.approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;

    const application = await StylistApplication.findById(id)
      .populate('applicant');

    if (!application) {
      return res.status(404).json({
        error: 'Application not found',
        code: 'APPLICATION_NOT_FOUND'
      });
    }

    if (application.status !== 'pending' && application.status !== 'interview_requested') {
      return res.status(400).json({
        error: 'Invalid application status',
        code: 'INVALID_STATUS',
        message: 'Application cannot be approved in its current status'
      });
    }

    // Update application status
    application.status = 'approved';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    application.reviewNotes = reviewNotes;

    await application.save();

    // Update user role to stylist
    const user = await User.findById(application.applicant._id);
    user.role = 'stylist';
    user.stylistInfo = application.stylistInfo;
    await user.save();

    // Send approval notification to applicant
    try {
      await sendNotification({
        type: 'application',
        recipient: application.applicant._id,
        title: 'Application Approved!',
        message: 'Congratulations! Your stylist application has been approved. You can now access your stylist dashboard.',
        channels: ['email'],
        metadata: {
          applicationId: application._id,
          status: 'approved'
        }
      });
    } catch (notificationError) {
      console.warn('Failed to send approval notification:', notificationError.message);
    }

    try {
      sendNotificationToUser(application.applicant._id.toString(), { type: 'application', title: 'Approved', data: { id: application._id } });
      sendToRole('admin', 'applications_changed', { action: 'updated', id: application._id, status: 'approved' });
      // Inform the applicant's session to refresh user data
      sendToUser(application.applicant._id.toString(), 'user_updated', { user: user });
    } catch (e) {}

    res.json({
      message: 'Application approved successfully',
      code: 'APPLICATION_APPROVED',
      application: {
        id: application._id,
        status: application.status,
        reviewedAt: application.reviewedAt
      }
    });

  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({
      error: 'Failed to approve application',
      code: 'APPROVAL_ERROR'
    });
  }
};

// Admin: Reject application
exports.rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes, rejectionMessage } = req.body;

    const application = await StylistApplication.findById(id)
      .populate('applicant');

    if (!application) {
      return res.status(404).json({
        error: 'Application not found',
        code: 'APPLICATION_NOT_FOUND'
      });
    }

    if (application.status === 'approved' || application.status === 'rejected') {
      return res.status(400).json({
        error: 'Invalid application status',
        code: 'INVALID_STATUS',
        message: 'Application cannot be rejected in its current status'
      });
    }

    // Update application status
    application.status = 'rejected';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    application.reviewNotes = reviewNotes;

    await application.save();

    // Send rejection notification to applicant
    try {
      await sendNotification({
        type: 'application',
        recipient: application.applicant._id,
        title: 'Application Update',
        message: rejectionMessage || 'Thank you for your interest. Unfortunately, we cannot proceed with your application at this time.',
        channels: ['email'],
        metadata: {
          applicationId: application._id,
          status: 'rejected'
        }
      });
    } catch (notificationError) {
      console.warn('Failed to send rejection notification:', notificationError.message);
    }

    try {
      sendNotificationToUser(application.applicant._id.toString(), { type: 'application', title: 'Rejected', data: { id: application._id } });
      sendToRole('admin', 'applications_changed', { action: 'updated', id: application._id, status: 'rejected' });
    } catch (e) {}

    res.json({
      message: 'Application rejected successfully',
      code: 'APPLICATION_REJECTED',
      application: {
        id: application._id,
        status: application.status,
        reviewedAt: application.reviewedAt
      }
    });

  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({
      error: 'Failed to reject application',
      code: 'REJECTION_ERROR'
    });
  }
};

// Admin: Request interview
exports.requestInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewNotes, location } = req.body;

    const application = await StylistApplication.findById(id)
      .populate('applicant');

    if (!application) {
      return res.status(404).json({
        error: 'Application not found',
        code: 'APPLICATION_NOT_FOUND'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        error: 'Invalid application status',
        code: 'INVALID_STATUS',
        message: 'Interview can only be requested for pending applications'
      });
    }

    // Update application status and interview info
    application.status = 'interview_requested';
    application.interview.requestedAt = new Date();
    application.interview.requestedBy = req.user._id;
    application.interview.notes = interviewNotes;
    application.interview.location = location;

    await application.save();

    // Send interview request notification to applicant
    try {
      await sendNotification({
        type: 'application',
        recipient: application.applicant._id,
        title: 'Interview Request',
        message: 'We\'ve reviewed your application. When are you available for an interview? Please reply to this email with your availability.',
        channels: ['email'],
        metadata: {
          applicationId: application._id,
          status: 'interview_requested'
        }
      });
    } catch (notificationError) {
      console.warn('Failed to send interview notification:', notificationError.message);
    }

    try {
      sendNotificationToUser(application.applicant._id.toString(), { type: 'application', title: 'Interview requested', data: { id: application._id } });
      sendToRole('admin', 'applications_changed', { action: 'updated', id: application._id, status: 'interview_requested' });
    } catch (e) {}

    res.json({
      message: 'Interview requested successfully',
      code: 'INTERVIEW_REQUESTED',
      application: {
        id: application._id,
        status: application.status,
        interviewRequestedAt: application.interview.requestedAt
      }
    });

  } catch (error) {
    console.error('Request interview error:', error);
    res.status(500).json({
      error: 'Failed to request interview',
      code: 'INTERVIEW_REQUEST_ERROR'
    });
  }
};

// Admin: Update interview details
exports.updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt, location, notes, completed, feedback } = req.body;

    const application = await StylistApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        error: 'Application not found',
        code: 'APPLICATION_NOT_FOUND'
      });
    }

    if (application.status !== 'interview_requested') {
      return res.status(400).json({
        error: 'Invalid application status',
        code: 'INVALID_STATUS',
        message: 'Interview can only be updated for interview_requested applications'
      });
    }

    // Update interview details
    if (scheduledAt) application.interview.scheduledAt = scheduledAt;
    if (location) application.interview.location = location;
    if (notes) application.interview.notes = notes;
    if (completed !== undefined) {
      application.interview.completed = completed;
      if (completed) {
        application.interview.completedAt = new Date();
      }
    }
    if (feedback) application.interview.feedback = feedback;

    await application.save();

    res.json({
      message: 'Interview updated successfully',
      code: 'INTERVIEW_UPDATED',
      application: {
        id: application._id,
        interview: application.interview
      }
    });

  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({
      error: 'Failed to update interview',
      code: 'INTERVIEW_UPDATE_ERROR'
    });
  }
}; 