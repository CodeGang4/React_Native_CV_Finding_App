const express = require('express');
const router = express.Router();

const PodcastController = require('../../controllers/ClientControllers/PodcastController');

// Search podcasts (must be before /:id route)
router.get('/search', PodcastController.searchPodcasts);

// Get podcast by ID
router.get('/:id', PodcastController.getPodcastById);

// Get all podcasts
router.get('/', PodcastController.getAllPodcasts);

// Create new podcast
router.post('/', PodcastController.createPodcast);

// Update podcast
router.put('/:id', PodcastController.updatePodcast);

// Delete podcast
router.delete('/:id', PodcastController.deletePodcast);

module.exports = router;
