/**
 * Ball class - Handles ball physics, movement, and collision detection
 */
class Ball {
    constructor(x, y, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = y;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Visual properties
        this.radius = 10;
        this.color = '#fff';

        // Physics properties
        this.initialSpeed = 300; // pixels per second
        this.speed = this.initialSpeed;
        this.maxSpeed = 600;
        this.speedIncrement = 1.05; // 5% increase per paddle hit
        this.maxBounceAngle = Math.PI / 3; // 60 degrees

        // Velocity
        this.velocityX = 0;
        this.velocityY = 0;

        // Initialize with random direction
        this.setRandomVelocity();
    }

    /**
     * Set random diagonal velocity for ball
     */
    setRandomVelocity() {
        // Random angle between 30 and 60 degrees (or 120-150, 210-240, 300-330)
        const angle = (Math.random() * Math.PI / 6) + Math.PI / 6; // 30-60 degrees
        const quadrant = Math.floor(Math.random() * 4); // 0-3

        let finalAngle;
        switch (quadrant) {
            case 0: finalAngle = angle; break; // Top-right
            case 1: finalAngle = Math.PI - angle; break; // Top-left
            case 2: finalAngle = Math.PI + angle; break; // Bottom-left
            case 3: finalAngle = 2 * Math.PI - angle; break; // Bottom-right
        }

        this.velocityX = Math.cos(finalAngle) * this.speed;
        this.velocityY = Math.sin(finalAngle) * this.speed;
    }

    /**
     * Update ball position based on velocity
     */
    update(deltaTime) {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

    /**
     * Check collision with top/bottom walls
     * @returns {boolean} True if wall hit occurred
     */
    checkWallCollision() {
        let hit = false;

        // Top wall
        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.velocityY = Math.abs(this.velocityY); // Bounce down
            hit = true;
        }

        // Bottom wall
        if (this.y + this.radius >= this.canvasHeight) {
            this.y = this.canvasHeight - this.radius;
            this.velocityY = -Math.abs(this.velocityY); // Bounce up
            hit = true;
        }

        return hit;
    }

    /**
     * Check collision with paddle
     * @param {Paddle} paddle - The paddle to check collision with
     * @returns {number|null} Hit point (-1 to 1) if collision occurred, null otherwise
     */
    checkPaddleCollision(paddle) {
        const ballBounds = this.getBounds();
        const paddleBounds = paddle.getBounds();

        // Check for overlap
        const xOverlap = (ballBounds.right >= paddleBounds.left &&
                         ballBounds.left <= paddleBounds.right);
        const yOverlap = (ballBounds.bottom >= paddleBounds.top &&
                         ballBounds.top <= paddleBounds.bottom);

        if (xOverlap && yOverlap) {
            // Calculate hit point: -1 (top of paddle) to 1 (bottom of paddle)
            const paddleCenter = paddle.y + paddle.height / 2;
            const hitPoint = (this.y - paddleCenter) / (paddle.height / 2);

            // Clamp hitPoint to [-1, 1] range
            return Math.max(-1, Math.min(1, hitPoint));
        }

        return null;
    }

    /**
     * Apply paddle hit effect: reverse X direction and adjust angle based on hit point
     * @param {number} hitPoint - Where ball hit paddle (-1 to 1, top to bottom)
     */
    applyPaddleHit(hitPoint) {
        // Reverse X direction
        this.velocityX *= -1;

        // Apply angle variation based on hit point
        const angle = hitPoint * this.maxBounceAngle;

        // Calculate new velocity maintaining current speed
        const currentSpeed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);

        // Preserve X direction sign
        const xSign = Math.sign(this.velocityX);

        // Calculate new velocities with angle variation
        this.velocityX = xSign * currentSpeed * Math.cos(angle);
        this.velocityY = currentSpeed * Math.sin(angle);

        // Increase speed slightly
        this.increaseSpeed();

        // Add small separation to prevent ball from getting stuck in paddle
        const separation = 2;
        this.x += xSign * separation;
    }

    /**
     * Increase ball speed by increment (capped at max speed)
     */
    increaseSpeed() {
        this.speed = Math.min(this.speed * this.speedIncrement, this.maxSpeed);

        // Update velocities to match new speed
        const currentAngle = Math.atan2(this.velocityY, this.velocityX);
        this.velocityX = Math.cos(currentAngle) * this.speed;
        this.velocityY = Math.sin(currentAngle) * this.speed;
    }

    /**
     * Get ball bounds for collision detection
     */
    getBounds() {
        return {
            left: this.x - this.radius,
            right: this.x + this.radius,
            top: this.y - this.radius,
            bottom: this.y + this.radius
        };
    }

    /**
     * Render ball
     */
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Reset ball to center with random velocity
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.speed = this.initialSpeed;
        this.setRandomVelocity();
    }
}
