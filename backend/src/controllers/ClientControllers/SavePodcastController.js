const SavePodcastService = require('../../services/ClientServices/SavePodcast.service');
const { asyncHandler } = require('../../utils/errorHandler');
const { sendData } = require('../../utils/response');

class SavePodcastController {
    savePodcast = asyncHandler(async (req, res) => {
        const { candidate_id, podcast_id } = req.params;
        const savedPodcast = await SavePodcastService.savePodcast(candidate_id, podcast_id);
        return sendData(res, savedPodcast, 201);
    });

    unSavePodcast = asyncHandler(async (req, res) => {
        const { candidate_id, podcast_id } = req.params;
        const unsavedPodcast = await SavePodcastService.unsavePodcast(candidate_id, podcast_id);
        return sendData(res, unsavedPodcast);
    });

    getSavedPodcasts = asyncHandler(async (req, res) => {
        const { candidate_id } = req.params;
        const savedPodcasts = await SavePodcastService.getSavedPodcasts(candidate_id);
        return sendData(res, savedPodcasts);
    });
}

module.exports = new SavePodcastController();
