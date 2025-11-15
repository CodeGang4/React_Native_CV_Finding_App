const SavePodcastRepository = require('../../repositories/ClientRepositories/SavePodcast.repository');
const SavePodcastCache = require('../../Cache/ClientCache/SavePodcast.cache');
const { AppError } = require('../../utils/errorHandler');

class SavePodcastService {
    /**
     * Save podcast
     */
    async savePodcast(candidate_id, podcast_id) {
        // Check if already saved
        const existingPodcast = await SavePodcastRepository.checkPodcastSaved(candidate_id, podcast_id);
        
        if (existingPodcast) {
            throw new AppError('Podcast already saved', 400);
        }

        // Save podcast
        const savedPodcast = await SavePodcastRepository.savePodcast(candidate_id, podcast_id);

        // Invalidate cache
        await SavePodcastCache.invalidateSavedPodcasts(candidate_id);

        return savedPodcast;
    }

    /**
     * Unsave podcast
     */
    async unsavePodcast(candidate_id, podcast_id) {
        const unsavedPodcast = await SavePodcastRepository.unsavePodcast(candidate_id, podcast_id);

        // Invalidate cache
        await SavePodcastCache.invalidateSavedPodcasts(candidate_id);

        return unsavedPodcast;
    }

    /**
     * Get saved podcasts
     */
    async getSavedPodcasts(candidate_id) {
        // Try cache first
        let savedPodcasts = await SavePodcastCache.getSavedPodcasts(candidate_id);

        if (!savedPodcasts) {
            // Fetch from database
            savedPodcasts = await SavePodcastRepository.getSavedPodcasts(candidate_id);

            // Cache the result
            await SavePodcastCache.cacheSavedPodcasts(candidate_id, savedPodcasts);
        }

        return savedPodcasts;
    }
}

module.exports = new SavePodcastService();
