const express = require('express');
const router = express.Router();

const SavePodcastController = require('../../controllers/ClientControllers/SavePodcastController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post(
    '/save/:candidate_id/:podcast_id',
    SavePodcastController.savePodcast,
);
router.delete(
    '/unsave/:candidate_id/:podcast_id',
    SavePodcastController.unSavePodcast,
);
router.get(
    '/getSavedPodcasts/:candidate_id',
    SavePodcastController.getSavedPodcasts,
);
module.exports = router;
