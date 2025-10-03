const express = require('express');
const router = express.Router();

const PodcastController = require('../../controllers/ClientControllers/PodcastController');

// Get podcast by ID
router.get('/:id', PodcastController.getPodcastById);
// Default route to get all podcasts
router.get('/', PodcastController.getAllPodcasts);

module.exports = router;
