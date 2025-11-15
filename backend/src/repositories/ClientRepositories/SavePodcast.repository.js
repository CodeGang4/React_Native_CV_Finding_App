const supabase = require('../../supabase/config');

class SavePodcastRepository {
    /**
     * Check if podcast is already saved
     */
    async checkPodcastSaved(candidate_id, podcast_id) {
        const { data, error } = await supabase
            .from('save_podcast')
            .select('*')
            .eq('candidate_id', candidate_id)
            .eq('podcast_id', podcast_id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    }

    /**
     * Save podcast
     */
    async savePodcast(candidate_id, podcast_id) {
        const { data, error } = await supabase
            .from('save_podcast')
            .insert([{
                candidate_id,
                podcast_id,
                saved_at: new Date().toISOString(),
            }])
            .select();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Unsave podcast
     */
    async unsavePodcast(candidate_id, podcast_id) {
        const { data, error } = await supabase
            .from('save_podcast')
            .delete()
            .eq('candidate_id', candidate_id)
            .eq('podcast_id', podcast_id)
            .select();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Get saved podcasts
     */
    async getSavedPodcasts(candidate_id) {
        const { data, error } = await supabase
            .from('save_podcast')
            .select('podcast(*)')
            .eq('candidate_id', candidate_id)
            .order('saved_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data;
    }
}

module.exports = new SavePodcastRepository();
