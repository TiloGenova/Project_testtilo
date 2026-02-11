/**
 * Paddle class - Handles player and AI paddle movement and rendering
 */
class Paddle {
    constructor(x, y, width, height, canvasHeight, isAI = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.canvasHeight = canvasHeight;
        this.isAI = isAI;

        // Movement
        this.speed = 300; // pixels per second
        this.velocity = 0; // -1 (up), 0 (none), 1 (down)

        // AI settings
        this.aiTolerance = 15; // Dead zone for smoother AI movement
        this.aiReturnSpeed = 0.6; // Speed multiplier when returning to center

        // Visual
        this.color = '#fff';
    }

    /**
     * Update player paddle based on input
     */
    update(deltaTime, inputHandler) {
        if (this.isAI) return; // AI paddles use updateAI instead

        // Get input direction from input handler
        const direction = inputHandler.getInputDirection();
        this.velocity = direction;

        // Update position
        this.y += this.velocity * this.speed * deltaTime;

        // Enforce screen bounds
        this.y = Math.max(0, Math.min(this.canvasHeight - this.height, this.y));
    }

    /**
     * Update AI paddle with ball-tracking logic
     */
    updateAI(ball, deltaTime) {
        if (!this.isAI) return;

        const paddleCenter = this.y + this.height / 2;
        const canvasCenter = this.canvasHeight / 2;

        // Determine if ball is moving toward AI paddle
        // AI is on right side, so check if ball is moving right (positive X velocity)
        const ballMovingTowardAI = ball.velocityX > 0;

        if (ballMovingTowardAI) {
            // Track ball with tolerance (dead zone)
            const ballY = ball.y;

            if (ballY < paddleCenter - this.aiTolerance) {
                this.velocity = -1; // Move up
            } else if (ballY > paddleCenter + this.aiTolerance) {
                this.velocity = 1; // Move down
            } else {
                this.velocity = 0; // Stay in position
            }

            // Apply normal speed when tracking
            this.y += this.velocity * this.speed * deltaTime;
        } else {
            // Ball moving away - return to center
            if (paddleCenter < canvasCenter - 10) {
                this.velocity = 1;
                this.y += this.velocity * this.speed * this.aiReturnSpeed * deltaTime;
            } else if (paddleCenter > canvasCenter + 10) {
                this.velocity = -1;
                this.y += this.velocity * this.speed * this.aiReturnSpeed * deltaTime;
            } else {
                this.velocity = 0;
            }
        }

        // Enforce screen bounds
        this.y = Math.max(0, Math.min(this.canvasHeight - this.height, this.y));
    }

    /**
     * Render paddle
     */
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    /**
     * Get paddle bounds for collision detection
     */
    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    /**
     * Reset paddle to specified position
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
    }
}
