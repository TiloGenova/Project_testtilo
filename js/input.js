/**
 * InputHandler class - Manages both keyboard and touch input
 * Provides unified interface for desktop and mobile controls
 */
class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {}; // Track keyboard state
        this.touchDirection = 0; // -1 (up), 0 (none), 1 (down)
        this.isTouching = false;

        this.init();
    }

    /**
     * Initialize event listeners for keyboard and touch input
     */
    init() {
        // Keyboard event listeners
        this.keyDownHandler = (e) => this.handleKeyDown(e);
        this.keyUpHandler = (e) => this.handleKeyUp(e);
        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);

        // Touch event listeners (mobile)
        this.touchStartHandler = (e) => this.handleTouchStart(e);
        this.touchMoveHandler = (e) => this.handleTouchMove(e);
        this.touchEndHandler = (e) => this.handleTouchEnd(e);

        this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: false });
        this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        this.canvas.addEventListener('touchend', this.touchEndHandler, { passive: false });
        this.canvas.addEventListener('touchcancel', this.touchEndHandler, { passive: false });

        // Mouse events (for desktop click testing)
        this.mouseDownHandler = (e) => this.handleMouseDown(e);
        this.mouseUpHandler = (e) => this.handleMouseUp(e);
        this.canvas.addEventListener('mousedown', this.mouseDownHandler);
        this.canvas.addEventListener('mouseup', this.mouseUpHandler);
    }

    /**
     * Handle keyboard key down
     */
    handleKeyDown(e) {
        this.keys[e.code] = true;
    }

    /**
     * Handle keyboard key up
     */
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    /**
     * Handle touch start - determine if touch is in upper or lower control zone
     */
    handleTouchStart(event) {
        event.preventDefault(); // Prevent scrolling and zooming

        const touch = event.touches[0];
        this.processTouchPosition(touch.clientX, touch.clientY);
        this.isTouching = true;
    }

    /**
     * Handle touch move - update control zone as finger moves
     */
    handleTouchMove(event) {
        event.preventDefault();

        if (event.touches.length > 0) {
            const touch = event.touches[0];
            this.processTouchPosition(touch.clientX, touch.clientY);
        }
    }

    /**
     * Handle touch end - stop paddle movement
     */
    handleTouchEnd(event) {
        event.preventDefault();
        this.touchDirection = 0;
        this.isTouching = false;
    }

    /**
     * Handle mouse down (for desktop testing of touch controls)
     */
    handleMouseDown(event) {
        event.preventDefault();
        this.processTouchPosition(event.clientX, event.clientY);
        this.isTouching = true;
    }

    /**
     * Handle mouse up
     */
    handleMouseUp(event) {
        event.preventDefault();
        this.touchDirection = 0;
        this.isTouching = false;
    }

    /**
     * Process touch/click position and determine control direction
     */
    processTouchPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();

        // Convert to canvas coordinates
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Only handle touches on left half (player paddle control area)
        if (x < rect.width / 2) {
            const middleY = rect.height / 2;

            // Upper half = move up, lower half = move down
            if (y < middleY) {
                this.touchDirection = -1; // Up
            } else {
                this.touchDirection = 1; // Down
            }
        } else {
            // Touch on right side (AI paddle area) - ignore or handle restart
            // For now, treat as neutral
            this.touchDirection = 0;
        }
    }

    /**
     * Get unified input direction from keyboard or touch
     * @returns {number} -1 (up), 0 (none), or 1 (down)
     */
    getInputDirection() {
        // Check keyboard input first
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            return -1; // Move up
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            return 1; // Move down
        }

        // Then check touch input
        return this.touchDirection;
    }

    /**
     * Check if a specific key is pressed
     */
    isKeyPressed(keyCode) {
        return this.keys[keyCode] === true;
    }

    /**
     * Check if touch input is active
     */
    isTouchActive() {
        return this.isTouching;
    }

    /**
     * Clean up event listeners
     */
    cleanup() {
        // Remove keyboard listeners
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);

        // Remove touch listeners
        this.canvas.removeEventListener('touchstart', this.touchStartHandler);
        this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
        this.canvas.removeEventListener('touchend', this.touchEndHandler);
        this.canvas.removeEventListener('touchcancel', this.touchEndHandler);

        // Remove mouse listeners
        this.canvas.removeEventListener('mousedown', this.mouseDownHandler);
        this.canvas.removeEventListener('mouseup', this.mouseUpHandler);
    }
}
