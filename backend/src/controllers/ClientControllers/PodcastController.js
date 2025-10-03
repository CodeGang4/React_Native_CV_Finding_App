const supabase = require('../../supabase/config');

class PodcastController {
    async getAllPodcasts(req, res) {
        try {
            const { data, error } = await supabase
                .from('podcast')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                throw error;
            }
            res.status(200).json(data);
        } catch (error) {
            console.error('Error fetching podcasts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getPodcastById(req, res) {
        const podcastId = req.params.id;
        try {
            const { data, error } = await supabase
                .from('podcast')
                .select('*')
                .eq('id', podcastId)
                .single();
            if (error) {
                throw error;
            }
            res.status(200).json(data);
        } catch (error) {
            console.error('Error fetching podcast by ID:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new PodcastController();