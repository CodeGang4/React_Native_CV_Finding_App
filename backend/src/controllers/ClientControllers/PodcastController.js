const PodcastService = require('../../services/ClientServices/Podcast.service');
const { asyncHandler } = require('../../utils/errorHandler');
const { sendData, sendError } = require('../../utils/response');


class PodcastController {
    /**
     * Get all podcasts
     * @route GET /api/podcasts
     */
    getAllPodcasts = asyncHandler(async (req, res) => {
        const podcasts = await PodcastService.getAllPodcasts();
        return sendData(res, podcasts);
    });

    /**
     * Get a single podcast by ID
     * @route GET /api/podcasts/:id
     */
    getPodcastById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const podcast = await PodcastService.getPodcastById(id);
        return sendData(res, podcast);
    });

    /**
     * Create a new podcast
     * @route POST /api/podcasts
     */
    createPodcast = asyncHandler(async (req, res) => {
        const podcastData = req.body;
        const newPodcast = await PodcastService.createPodcast(podcastData);
        return sendData(res, newPodcast);
    });

    /**
     * Update a podcast by ID
     * @route PUT /api/podcasts/:id
     */
    updatePodcast = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;
        const updatedPodcast = await PodcastService.updatePodcast(id, updateData);
        return sendData(res, updatedPodcast);
    });

    /**
     * Delete a podcast by ID
     * @route DELETE /api/podcasts/:id
     */
    deletePodcast = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const deletedPodcast = await PodcastService.deletePodcast(id);
        return sendData(res, deletedPodcast);
    });

    /**
     * Search podcasts
     * @route GET /api/podcasts/search?q=searchTerm
     */
    searchPodcasts = asyncHandler(async (req, res) => {
        const { q } = req.query;
        const podcasts = await PodcastService.searchPodcasts(q);
        return sendData(res, podcasts);
    });
}

module.exports = new PodcastController();