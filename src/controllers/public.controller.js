const schedulingService = require('../services/scheduling.service');
const pool = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

const getLiveContent = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { subject } = req.query;

    const [teacherRows] = await pool.query(
      `SELECT id, name FROM users WHERE id = ? AND role = 'teacher'`,
      [teacherId]
    );

    if (teacherRows.length === 0) return sendSuccess(res, null, 'No content available.');

    const teacher = teacherRows[0];
    const activeContent = await schedulingService.getLiveContentForTeacher(teacherId);

    if (!activeContent) return sendSuccess(res, null, 'No content available.');

    if (subject) {
      const subjectContent = activeContent[subject.toLowerCase().trim()];
      if (!subjectContent) return sendSuccess(res, null, 'No content available.');
      return sendSuccess(res, {
        teacher: { id: teacher.id, name: teacher.name },
        subject: subject.toLowerCase().trim(),
        active_content: subjectContent,
      }, 'Live content fetched.');
    }

    return sendSuccess(res, {
      teacher: { id: teacher.id, name: teacher.name },
      active_content_by_subject: activeContent,
      subjects_live: Object.keys(activeContent),
    }, 'Live content fetched.');
  } catch (err) {
    console.error('Public API error:', err);
    return sendError(res, 'Unable to fetch live content.', 500);
  }
};

const getSchedulePreview = async (req, res) => {
  try {
    const { teacherId, subject } = req.params;
    const preview = await schedulingService.getSchedulePreview(teacherId, subject);
    return sendSuccess(res, preview, 'Schedule preview fetched.');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

module.exports = { getLiveContent, getSchedulePreview };
