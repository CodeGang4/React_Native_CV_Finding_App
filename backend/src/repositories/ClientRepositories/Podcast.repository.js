const supabase = require("../../supabase/config");

/**
 * Repository Layer - Handles direct database operations for Podcasts
 * Responsibility: Data access and persistence
 */
class PodcastRepository {
    /**
     * Fetch all podcasts from database
     * @returns {Promise<{data: Array, error: Object|null}>}
     */
    async findAll() {
        try {
            const { data, error } = await supabase
                .from("podcast")
                .select("*")
                .order("created_at", { ascending: false });

            return { data, error };
        } catch (error) {
            console.error("PodcastRepository.findAll error:", error);
            return { data: null, error };
        }
    }

    /**
     * Fetch a single podcast by ID
     * @param {string} podcastId
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async findById(podcastId) {
        try {
            const { data, error } = await supabase
                .from("podcast")
                .select("*")
                .eq("id", podcastId)
                .single();

            return { data, error };
        } catch (error) {
            console.error("PodcastRepository.findById error:", error);
            return { data: null, error };
        }
    }

    /**
     * Create a new podcast
     * @param {Object} podcastData
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async create(podcastData) {
        try {
            const { data, error } = await supabase
                .from("podcast")
                .insert(podcastData)
                .select()
                .single();

            return { data, error };
        } catch (error) {
            console.error("PodcastRepository.create error:", error);
            return { data: null, error };
        }
    }

    /**
     * Update a podcast by ID
     * @param {string} podcastId
     * @param {Object} updateData
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async update(podcastId, updateData) {
        try {
            const { data, error } = await supabase
                .from("podcast")
                .update(updateData)
                .eq("id", podcastId)
                .select()
                .single();

            return { data, error };
        } catch (error) {
            console.error("PodcastRepository.update error:", error);
            return { data: null, error };
        }
    }

    /**
     * Delete a podcast by ID
     * @param {string} podcastId
     * @returns {Promise<{data: Object|null, error: Object|null}>}
     */
    async delete(podcastId) {
        try {
            const { data, error } = await supabase
                .from("podcast")
                .delete()
                .eq("id", podcastId)
                .select()
                .single();

            return { data, error };
        } catch (error) {
            console.error("PodcastRepository.delete error:", error);
            return { data: null, error };
        }
    }

    /**
     * Search podcasts by title or description
     * @param {string} searchTerm
     * @returns {Promise<{data: Array, error: Object|null}>}
     */
    async search(searchTerm) {
        try {
            const { data, error } = await supabase
                .from("podcast")
                .select("*")
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
                .order("created_at", { ascending: false });

            return { data, error };
        } catch (error) {
            console.error("PodcastRepository.search error:", error);
            return { data: null, error };
        }
    }
}

module.exports = new PodcastRepository();
