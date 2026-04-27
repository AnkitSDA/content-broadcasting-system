const contentService = require('../services/content.service');
const { sendSuccess, sendError, sendCreated } = require('../utils/response');

const uploadContent = async (req, res) => {
  try {
    const { title, description, subject, start_time, end_time, rotation_duration } = req.body;
    if (!title) return sendError(res, 'Title is required.', 400);
    if (!subject) return sendError(res, 'Subject is required.', 400);
    if (!req.file) return sendError(res, 'File is required.', 400);

    const content = await contentService.uploadContent({
      title, description, subject, file: req.file,
      teacherId: req.user.id, start_time, end_time, rotation_duration,
    });
    return sendCreated(res, content, 'Content uploaded. Awaiting principal approval.');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getMyContent = async (req, res) => {
  try {
    const { status, subject } = req.query;
    const content = await contentService.getMyContent(req.user.id, { status, subject });
    return sendSuccess(res, content, 'Content fetched.');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getAllContent = async (req, res) => {
  try {
    const { status, subject, teacher_id } = req.query;
    const content = await contentService.getAllContent({ status, subject, teacherId: teacher_id });
    return sendSuccess(res, content, 'All content fetched.');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

module.exports = { uploadContent, getMyContent, getAllContent };
