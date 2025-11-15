const PodcastRepository = require("../../repositories/ClientRepositories/Podcast.repository");
const PodcastCache = require("../../Cache/ClientCache/Podcast.cache");
const { AppError } = require("../../utils/errorHandler");


class PodcastService {
    /**
     * Get all podcasts with caching
     * @returns {Promise<Array>}
     */
    async getAllPodcasts() {
        try {
            // Try to get from cache first
            let podcasts = await PodcastCache.getAllPodcastsCache();
            if (podcasts && podcasts.length > 0) {
                console.log("Podcasts retrieved from cache");
                return podcasts;
            }

            // Cache miss: Fetch from database
            const { data, error } = await PodcastRepository.findAll();
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to fetch podcasts from database", 500);
            }

            if (!data || data.length === 0) {
                return [];
            }

            // Cache the podcasts
            await PodcastCache.setAllPodcastsCache(data);
            console.log("Podcasts cached successfully");

            return data;
        } catch (error) {
            console.error("PodcastService.getAllPodcasts error:", error);
            throw error;
        }
    }

    /**
     * Get a single podcast by ID with caching
     * @param {string} podcastId
     * @returns {Promise<Object>}
     */
    async getPodcastById(podcastId) {
        try {
            if (!podcastId) {
                throw new AppError("Podcast ID is required", 400);
            }

            // Try to get from cache first
            let podcast = await PodcastCache.getPodcastCache(podcastId);
            if (podcast) {
                console.log(" Podcast retrieved from cache");
                return podcast;
            }

            // Cache miss: Fetch from database
            const { data, error } = await PodcastRepository.findById(podcastId);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to fetch podcast from database", 500);
            }

            if (!data) {
                throw new AppError("Podcast not found", 404);
            }

            // Cache the podcast
            await PodcastCache.setPodcastCache(podcastId, data);
            console.log(" Podcast cached successfully");

            return data;
        } catch (error) {
            console.error("PodcastService.getPodcastById error:", error);
            throw error;
        }
    }

    /**
     * Create a new podcast
     * @param {Object} podcastData
     * @returns {Promise<Object>}
     */
    async createPodcast(podcastData) {
        try {
            // Validate required fields
            if (!podcastData.title) {
                throw new AppError("Podcast title is required", 400);
            }

            const { data, error } = await PodcastRepository.create(podcastData);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to create podcast", 500);
            }

            // Cache the new podcast
            if (data) {
                await PodcastCache.setPodcastCache(data.id, data);
                console.log("New podcast cached successfully");
            }

            return data;
        } catch (error) {
            console.error("PodcastService.createPodcast error:", error);
            throw error;
        }
    }

    /**
     * Update a podcast by ID
     * @param {string} podcastId
     * @param {Object} updateData
     * @returns {Promise<Object>}
     */
    async updatePodcast(podcastId, updateData) {
        try {
            if (!podcastId) {
                throw new AppError("Podcast ID is required", 400);
            }

            const { data, error } = await PodcastRepository.update(podcastId, updateData);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to update podcast", 500);
            }

            if (!data) {
                throw new AppError("Podcast not found", 404);
            }

            // Update cache
            await PodcastCache.setPodcastCache(podcastId, data);
            console.log("Podcast cache updated successfully");

            return data;
        } catch (error) {
            console.error("PodcastService.updatePodcast error:", error);
            throw error;
        }
    }

    /**
     * Delete a podcast by ID
     * @param {string} podcastId
     * @returns {Promise<Object>}
     */
    async deletePodcast(podcastId) {
        try {
            if (!podcastId) {
                throw new AppError("Podcast ID is required", 400);
            }

            const { data, error } = await PodcastRepository.delete(podcastId);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to delete podcast", 500);
            }

            if (!data) {
                throw new AppError("Podcast not found", 404);
            }

            // Invalidate cache (optional: implement cache deletion)
            console.log("Podcast deleted successfully");

            return data;
        } catch (error) {
            console.error("PodcastService.deletePodcast error:", error);
            throw error;
        }
    }

    /**
     * Search podcasts by term
     * @param {string} searchTerm
     * @returns {Promise<Array>}
     */
    async searchPodcasts(searchTerm) {
        try {
            if (!searchTerm || searchTerm.trim() === "") {
                throw new AppError("Search term is required", 400);
            }

            const { data, error } = await PodcastRepository.search(searchTerm);
            if (error) {
                console.error("Database error:", error);
                throw new AppError("Failed to search podcasts", 500);
            }

            return data || [];
        } catch (error) {
            console.error("PodcastService.searchPodcasts error:", error);
            throw error;
        }
    }
}

module.exports = new PodcastService();
