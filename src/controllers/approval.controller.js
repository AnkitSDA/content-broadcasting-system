const approvalService = require('../services/approval.service');
const { sendSuccess, sendError } = require('../utils/response');

const approveContent = async (req, res) => {
  try {
    const content = await approvalService.approveContent(req.params.id, req.user.id);
    return sendSuccess(res, content, 'Content approved successfully.');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const rejectContent = async (req, res) => {
  try {
    const { rejection_reason } = req.body;
    const content = await approvalService.rejectContent(req.params.id, req.user.id, rejection_reason);
    return sendSuccess(res, content, 'Content rejected.');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getPendingContent = async (req, res) => {
  try {
    const content = await approvalService.getPendingContent();
    return sendSuccess(res, content, 'Pending content fetched.');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

module.exports = { approveContent, rejectContent, getPendingContent };
