import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = Constants.expoConfig.extra.SUPABASE_URL
const supabaseAnonKey = Constants.expoConfig.extra.SUPABASE_SERVICE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: {
            getItem: (key) => AsyncStorage.getItem(key),
            setItem: (key, value) => AsyncStorage.setItem(key, value),
            removeItem: (key) => AsyncStorage.removeItem(key),
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        realtime: { enabled: false },
    },
})