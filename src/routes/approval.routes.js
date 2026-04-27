const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approval.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');

router.use(authenticate, authorize('principal'));

router.get('/pending', approvalController.getPendingContent);
router.patch('/:id/approve', approvalController.approveContent);
router.patch('/:id/reject', approvalController.rejectContent);

module.exports = router;
