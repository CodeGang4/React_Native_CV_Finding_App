/**
 * Quota Monitor - Theo dõi và quản lý quota sử dụng Gemini API
 */
export class QuotaMonitor {
  constructor() {
    this.resetCounters();
    this.startDailyReset();
  }

  resetCounters() {
    this.dailyUsage = 0;
    this.minuteUsage = 0;
    this.lastMinuteReset = Date.now();
    this.dailyResetTime = this.getNextDailyReset();

    console.log("🔄 Quota counters reset");
  }

  // Daily reset at 0:00 UTC (7:00 AM Vietnam time)
  getNextDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(now.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  startDailyReset() {
    const resetInterval = () => {
      const now = Date.now();
      if (now >= this.dailyResetTime) {
        this.resetCounters();
      }

      // Reset minute counter every minute
      if (now - this.lastMinuteReset >= 60000) {
        this.minuteUsage = 0;
        this.lastMinuteReset = now;
      }
    };

    // Check every 10 seconds
    setInterval(resetInterval, 10000);
  }

  // Check if we can make a request
  canMakeRequest() {
    const now = Date.now();

    // Reset minute counter if needed
    if (now - this.lastMinuteReset >= 60000) {
      this.minuteUsage = 0;
      this.lastMinuteReset = now;
    }

    // Check daily limit (gemini-2.0-flash-lite: 200 RPD)
    if (this.dailyUsage >= 200) {
      return {
        allowed: false,
        reason: "daily_quota_exceeded",
        resetTime: this.dailyResetTime,
        message: `Daily quota exceeded (${
          this.dailyUsage
        }/200). Resets at ${new Date(this.dailyResetTime).toLocaleString()}`,
      };
    }

    // Check minute limit (gemini-2.0-flash-lite: 30 RPM)
    if (this.minuteUsage >= 30) {
      const nextReset = this.lastMinuteReset + 60000;
      return {
        allowed: false,
        reason: "minute_quota_exceeded",
        resetTime: nextReset,
        message: `Minute quota exceeded (${
          this.minuteUsage
        }/30). Resets in ${Math.ceil((nextReset - now) / 1000)}s`,
      };
    }

    return {
      allowed: true,
      dailyRemaining: 200 - this.dailyUsage,
      minuteRemaining: 30 - this.minuteUsage,
    };
  }

  // Record a successful request
  recordRequest() {
    this.dailyUsage++;
    this.minuteUsage++;

    console.log(
      `📊 Quota usage: Daily ${this.dailyUsage}/200, Minute ${this.minuteUsage}/30`
    );
  }

  // Get current usage stats
  getUsageStats() {
    const now = Date.now();
    const timeToNextDayReset = this.dailyResetTime - now;
    const timeToNextMinuteReset = this.lastMinuteReset + 60000 - now;

    return {
      daily: {
        used: this.dailyUsage,
        limit: 200,
        remaining: 200 - this.dailyUsage,
        resetIn: timeToNextDayReset,
        resetTime: new Date(this.dailyResetTime).toLocaleString(),
      },
      minute: {
        used: this.minuteUsage,
        limit: 30,
        remaining: 30 - this.minuteUsage,
        resetIn: Math.max(0, timeToNextMinuteReset),
        resetTime: new Date(this.lastMinuteReset + 60000).toLocaleString(),
      },
      model: "gemini-2.0-flash-lite",
    };
  }

  // Get delay needed before next request
  getRequiredDelay() {
    const check = this.canMakeRequest();
    if (check.allowed) {
      return 0;
    }

    const now = Date.now();
    const delayMs = check.resetTime - now;

    return Math.max(0, delayMs);
  }

  // Pretty print usage stats
  logUsageStats() {
    const stats = this.getUsageStats();
    console.log(`
📊 Gemini API Quota Status (${stats.model}):
   📅 Daily: ${stats.daily.used}/${stats.daily.limit} (${
      stats.daily.remaining
    } remaining)
   ⏱️  Minute: ${stats.minute.used}/${stats.minute.limit} (${
      stats.minute.remaining
    } remaining)
   🔄 Next daily reset: ${stats.daily.resetTime}
   ⏰ Next minute reset: ${Math.ceil(stats.minute.resetIn / 1000)}s
    `);
  }

  // Estimate processing capacity
  estimateCapacity(totalCVs) {
    const stats = this.getUsageStats();
    const remainingDaily = stats.daily.remaining;

    if (totalCVs <= remainingDaily) {
      const timeEstimate = Math.ceil((totalCVs / 30) * 60); // seconds, assuming 30 RPM
      return {
        canProcess: true,
        estimatedTime: timeEstimate,
        message: `Can process ${totalCVs} CVs in ~${Math.ceil(
          timeEstimate / 60
        )} minutes`,
      };
    } else {
      return {
        canProcess: false,
        maxToday: remainingDaily,
        needTomorrow: totalCVs - remainingDaily,
        message: `Can only process ${remainingDaily} CVs today. Need to wait for quota reset for remaining ${
          totalCVs - remainingDaily
        } CVs.`,
      };
    }
  }
}

// Singleton instance
export const quotaMonitor = new QuotaMonitor();
