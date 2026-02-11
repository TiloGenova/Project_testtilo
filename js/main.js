/**
 * Main entry point for Pong game
 * Handles responsive canvas setup and game initialization
 */

/**
 * Sets up responsive canvas that adapts to screen size while maintaining 3:2 aspect ratio
 * @returns {Object} Canvas configuration with canvas element, context, and display dimensions
 */
function setupCanvas() {
    const canvas = document.getElementById('pongCanvas');

    // Target aspect ratio 3:2 (width:height) for consistent gameplay
    const aspectRatio = 3 / 2;

    // Get available viewport space
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Leave some margin on mobile for better visibility
    const margin = (width < 768) ? 20 : 40;
    width -= margin;
    height -= margin;

    // Calculate canvas size maintaining aspect ratio
    if (width / height > aspectRatio) {
        // Height is the limiting factor
        height = Math.min(height, 600);
        width = height * aspectRatio;
    } else {
        // Width is the limiting factor
        width = Math.min(width, 900);
        height = width / aspectRatio;
    }

    // Handle high DPI displays (Retina, etc.) for sharp rendering
    const dpr = window.devicePixelRatio || 1;

    // Set display size (CSS pixels)
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    // Set actual canvas size (accounting for device pixel ratio)
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    // Scale context to match DPR for sharp rendering
    ctx.scale(dpr, dpr);

    return { canvas, ctx, width, height };
}

// Initialize game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Setup responsive canvas
    const { canvas, ctx, width, height } = setupCanvas();

    // Create and start game instance
    const game = new Game(canvas, ctx, width, height);
    game.start();

    // Handle window resize (optional - for device rotation support)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // Debounce resize events to avoid excessive recalculations
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const { canvas: newCanvas, ctx: newCtx, width: newWidth, height: newHeight } = setupCanvas();
            game.handleResize(newWidth, newHeight);
        }, 250);
    });
});
