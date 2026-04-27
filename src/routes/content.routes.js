const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { handleUpload } = require('../middlewares/upload.middleware');

router.post('/upload', authenticate, authorize('teacher'), handleUpload('file'), contentController.uploadContent);
router.get('/my', authenticate, authorize('teacher'), contentController.getMyContent);
router.get('/all', authenticate, authorize('principal'), contentController.getAllContent);

module.exports = router;
