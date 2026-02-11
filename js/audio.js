/**
 * AudioManager class - Generates retro beep sounds using Web Audio API
 */
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3; // 30% volume to avoid harsh sounds
        this.initialized = false;

        // Initialize audio context (may be blocked by browser autoplay policy)
        this.init();
    }

    /**
     * Initialize Web Audio API context
     */
    init() {
        try {
            // Create AudioContext (with vendor prefix support)
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.initialized = true;
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.initialized = false;
        }
    }

    /**
     * Resume audio context if suspended (required by some browsers after user interaction)
     */
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (error) {
                console.warn('Failed to resume audio context:', error);
            }
        }
    }

    /**
     * Play a beep sound with specified frequency and duration
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in milliseconds
     */
    async playBeep(frequency, duration) {
        if (!this.initialized || !this.audioContext) return;

        // Resume context if suspended (mobile browsers may require this)
        await this.resumeContext();

        try {
            // Create oscillator (tone generator)
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            // Connect nodes: oscillator -> gain -> destination (speakers)
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Configure oscillator
            oscillator.frequency.value = frequency;
            oscillator.type = 'square'; // Square wave for retro 8-bit sound

            // Configure volume envelope (fade out)
            const now = this.audioContext.currentTime;
            const durationSeconds = duration / 1000;

            gainNode.gain.setValueAtTime(this.masterVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + durationSeconds);

            // Play the sound
            oscillator.start(now);
            oscillator.stop(now + durationSeconds);

            // Clean up after sound finishes
            oscillator.onended = () => {
                oscillator.disconnect();
                gainNode.disconnect();
            };
        } catch (error) {
            console.warn('Failed to play beep:', error);
        }
    }

    /**
     * Play sound when ball hits wall
     */
    playWallHit() {
        this.playBeep(220, 50); // Lower pitch, short duration
    }

    /**
     * Play sound when ball hits paddle
     */
    playPaddleHit() {
        this.playBeep(440, 50); // Higher pitch, short duration
    }

    /**
     * Play sound when someone scores
     */
    playScore() {
        this.playBeep(330, 100); // Mid pitch, longer duration
    }

    /**
     * Play sound when game ends
     */
    playGameOver() {
        this.playBeep(110, 200); // Low pitch, longest duration
    }

    /**
     * Set master volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Clean up audio resources
     */
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}
