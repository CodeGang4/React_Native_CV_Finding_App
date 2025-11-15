const QuestionCache = require('../Cache/AdminCache/Question.cache');

/**
 * Cleanup script to remove old Redis keys
 * Run this once to clean up old question keys
 */
async function cleanupRedis() {
    try {
        console.log(' Starting Redis cleanup...');
        
        const deletedCount = await QuestionCache.cleanupOldKeys();
        
        console.log(`✅ Cleanup completed! Deleted ${deletedCount} old keys`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
}

cleanupRedis();
