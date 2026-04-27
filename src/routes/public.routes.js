const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

router.get('/live/:teacherId', publicController.getLiveContent);
router.get('/schedule/:teacherId/:subject', publicController.getSchedulePreview);

module.exports = router;
