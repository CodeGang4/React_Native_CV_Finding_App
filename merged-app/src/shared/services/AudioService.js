import { Audio } from "expo-av";

class AudioService {
  constructor() {
    this.sound = null;
    this.isPlaying = false;
    this.currentPodcast = null;
    this.playbackStatus = null;
    this.isInitialized = false;
    this.volume = 1.0; // Default volume
  }

  async initializeAudio() {
    if (this.isInitialized) {
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
      console.log("[AudioService] Audio mode set successfully");
    } catch (error) {
      console.error("[AudioService] Failed to set audio mode:", error);
      // Continue anyway, basic playback might still work
      this.isInitialized = true; // Mark as initialized even if failed
    }
  }

  async playPodcast(podcastUrl, podcastId) {
    try {
      // If same podcast is playing, just pause/resume
      if (this.currentPodcast === podcastId && this.sound) {
        if (this.isPlaying) {
          await this.pausePodcast();
        } else {
          await this.resumePodcast();
        }
        return;
      }

      // Stop current podcast if different one
      if (this.sound) {
        await this.stopPodcast();
      }

      console.log("[AudioService] Loading podcast:", podcastUrl);

      // Create new sound object
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: podcastUrl },
        { shouldPlay: true, isLooping: false },
        this.onPlaybackStatusUpdate.bind(this)
      );

      if (!status.isLoaded) {
        throw new Error("Failed to load audio file");
      }

      this.sound = sound;
      this.currentPodcast = podcastId;
      this.isPlaying = status.isPlaying || true;

      console.log("[AudioService] Podcast started playing, status:", {
        isLoaded: status.isLoaded,
        isPlaying: status.isPlaying,
      });
    } catch (error) {
      console.error("[AudioService] Error playing podcast:", error);
      throw new Error("Không thể phát podcast. Vui lòng thử lại.");
    }
  }

  async pausePodcast() {
    if (this.sound && this.isPlaying) {
      try {
        await this.sound.pauseAsync();
        this.isPlaying = false;
        console.log("[AudioService] Podcast paused");
      } catch (error) {
        console.error("[AudioService] Error pausing podcast:", error);
      }
    }
  }

  async resumePodcast() {
    if (this.sound && !this.isPlaying) {
      try {
        await this.sound.playAsync();
        this.isPlaying = true;
        console.log("[AudioService] Podcast resumed");
      } catch (error) {
        console.error("[AudioService] Error resuming podcast:", error);
      }
    }
  }

  async stopPodcast() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
        this.currentPodcast = null;
        console.log("[AudioService] Podcast stopped");
      } catch (error) {
        console.error("[AudioService] Error stopping podcast:", error);
      }
    }
  }

  onPlaybackStatusUpdate(status) {
    this.playbackStatus = status;
    if (status.didJustFinish) {
      this.isPlaying = false;
      this.currentPodcast = null;
      console.log("[AudioService] Podcast finished playing");
    }
  }

  async setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(this.volume);
        console.log("[AudioService] Volume set to:", this.volume);
      } catch (error) {
        console.error("[AudioService] Error setting volume:", error);
      }
    }
  }

  async seekTo(positionMillis) {
    if (this.sound) {
      try {
        await this.sound.setPositionAsync(positionMillis);
        console.log("[AudioService] Seeked to:", positionMillis);
      } catch (error) {
        console.error("[AudioService] Error seeking:", error);
      }
    }
  }

  getProgress() {
    if (!this.playbackStatus) {
      return {
        position: 0,
        duration: 0,
        progress: 0,
        positionFormatted: "0:00",
        durationFormatted: "0:00",
      };
    }

    const position = this.playbackStatus.positionMillis || 0;
    const duration = this.playbackStatus.durationMillis || 0;
    const progress = duration > 0 ? position / duration : 0;

    return {
      position,
      duration,
      progress,
      positionFormatted: this.formatTime(position),
      durationFormatted: this.formatTime(duration),
    };
  }

  formatTime(millis) {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  getCurrentPlaybackInfo() {
    return {
      isPlaying: this.isPlaying,
      currentPodcast: this.currentPodcast,
      playbackStatus: this.playbackStatus,
      volume: this.volume,
      progress: this.getProgress(),
    };
  }
}

// Singleton instance
const audioService = new AudioService();

export default audioService;
