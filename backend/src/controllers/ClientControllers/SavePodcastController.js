const supabase = require('../../supabase/config');

class SavePodcastController {
    async savePodcast(req, res) {
        const { candidate_id, podcast_id } = req.params;
        const existingPodcast = await supabase
            .from('save_podcast')
            .select('*')
            .eq('candidate_id', candidate_id)
            .eq('podcast_id', podcast_id)
            .single();
        if (existingPodcast.data) {
            return res.status(400).json({ error: 'Podcast already saved' });
        }
        try {
            const { data, error } = await supabase
                .from('save_podcast')
                .insert([
                    {
                        candidate_id,
                        podcast_id,
                        saved_at: new Date().toISOString(),
                    },
                ])
                .select();
            if (error) {
                throw error;
            }
            res.status(201).json(data);
        } catch (error) {
            console.error('Error saving podcast:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async unSavePodcast(req, res) {
        const { candidate_id, podcast_id } = req.params;
        try {
            const { data, error } = await supabase
                .from('save_podcast')
                .delete()
                .eq('candidate_id', candidate_id)
                .eq('podcast_id', podcast_id)
                .select();
            if (error) {
                throw error;
            }
            res.status(200).json(data);
        } catch (error) {
            console.error('Error unsaving podcast:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async getSavedPodcasts(req, res) {
        const { candidate_id } = req.params;
        try {
            const { data, error } = await supabase
                .from('save_podcast')
                .select('podcast(*)')
                .eq('candidate_id', candidate_id)
                .order('saved_at', { ascending: false });
            if (error) {
                throw error;
            }
            res.status(200).json(data);
        } catch (error) {
            console.error('Error fetching saved podcasts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new SavePodcastController();
