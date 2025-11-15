const supabase = require('../../supabase/config');

class AuthRepository {
    /**
     * Create user in Auth and users table
     */
    async createUser(email, password, username, role) {
        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        return data?.user;
    }

    /**
     * Upsert user data in users table
     */
    async upsertUserData(userId, email, username, role) {
        const { data, error } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email: email,
                username: username,
                role: role,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Create candidate record
     */
    async createCandidate(userId, fullName) {
        const { data, error } = await supabase
            .from('candidates')
            .insert({
                user_id: userId,
                full_name: fullName,
            })
            .select()
            .single();

        if (error && error.code !== '23505') { // Ignore duplicate key error
            throw error;
        }

        return data;
    }

    /**
     * Create employer record
     */
    async createEmployer(userId, companyName, contactPerson) {
        const { data, error } = await supabase
            .from('employers')
            .insert({
                user_id: userId,
                company_name: companyName,
                contact_person: contactPerson,
            })
            .select()
            .single();

        if (error && error.code !== '23505') { // Ignore duplicate key error
            throw error;
        }

        return data;
    }

    /**
     * Check if candidate exists
     */
    async checkCandidateExists(userId) {
        const { data, error } = await supabase
            .from('candidates')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    }

    /**
     * Check if employer exists
     */
    async checkEmployerExists(userId) {
        const { data, error } = await supabase
            .from('employers')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    }

    /**
     * Login user
     */
    async loginUser(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data;
    }

    /**
     * Logout user
     */
    async logoutUser() {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            throw error;
        }
    }

    /**
     * Get user from token
     */
    async getUserFromToken(token) {
        supabase.auth.setAuth(token);
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            throw error;
        }

        return user;
    }

    /**
     * Get all candidates (debug)
     */
    async getAllCandidates() {
        const { data, error } = await supabase
            .from('candidates')
            .select('*');
        
        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Get all users (debug)
     */
    async getAllUsers() {
        const { data, error } = await supabase
            .from('users')
            .select('*');
        
        if (error) {
            throw error;
        }

        return data;
    }
}

module.exports = new AuthRepository();
