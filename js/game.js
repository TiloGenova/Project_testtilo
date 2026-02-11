/**
 * Game class - Orchestrates all game components and manages game state
 */
class Game {
    constructor(canvas, ctx, width, height) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = width;
        this.height = height;

        // Game state
        this.state = 'PLAYING'; // PLAYING, GAME_OVER
        this.playerScore = 0;
        this.aiScore = 0;
        this.targetScore = 10;

        // Game components
        this.inputHandler = null;
        this.playerPaddle = null;
        this.aiPaddle = null;
        this.ball = null;
        this.audioManager = null;

        // Game loop timing
        this.lastTime = 0;
        this.animationId = null;

        // Constants
        this.PADDLE_OFFSET = 20;
        this.PADDLE_WIDTH = 8;
        this.PADDLE_HEIGHT = 80;

        this.init();
    }

    /**
     * Initialize all game components
     */
    init() {
        // Initialize audio manager
        this.audioManager = new AudioManager();

        // Initialize input handler
        this.inputHandler = new InputHandler(this.canvas);

        // Create player paddle (left side)
        this.playerPaddle = new Paddle(
            this.PADDLE_OFFSET,
            this.height / 2 - this.PADDLE_HEIGHT / 2,
            this.PADDLE_WIDTH,
            this.PADDLE_HEIGHT,
            this.height,
            false // Not AI
        );

        // Create AI paddle (right side)
        this.aiPaddle = new Paddle(
            this.width - this.PADDLE_OFFSET - this.PADDLE_WIDTH,
            this.height / 2 - this.PADDLE_HEIGHT / 2,
            this.PADDLE_WIDTH,
            this.PADDLE_HEIGHT,
            this.height,
            true // Is AI
        );

        // Create ball
        this.ball = new Ball(
            this.width / 2,
            this.height / 2,
            this.width,
            this.height
        );
    }

    /**
     * Start the game loop
     */
    start() {
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    /**
     * Main game loop - runs at ~60 FPS
     */
    gameLoop(currentTime) {
        // Calculate deltaTime in seconds for frame-independent movement
        const deltaTime = (currentTime - this.lastTime) / 1000;
        const cappedDt = Math.min(deltaTime, 0.1); // Cap at 100ms to prevent spiral of death
        this.lastTime = currentTime;

        // Update game state
        this.update(cappedDt);

        // Render everything
        this.render();

        // Schedule next frame
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Update all game objects
     */
    update(deltaTime) {
        if (this.state === 'PLAYING') {
            // Update player paddle based on input
            this.playerPaddle.update(deltaTime, this.inputHandler);

            // Update AI paddle
            this.aiPaddle.updateAI(this.ball, deltaTime);

            // Update ball position
            this.ball.update(deltaTime);

            // Check collisions
            this.checkCollisions();

            // Check for scoring
            this.checkScoring();
        }

        // Check for restart input (Space key or touch)
        if (this.state === 'GAME_OVER') {
            if (this.inputHandler.isKeyPressed('Space') || this.inputHandler.isTouchActive()) {
                this.reset();
            }
        }
    }

    /**
     * Check all collision scenarios
     */
    checkCollisions() {
        // Check ball collision with walls
        if (this.ball.checkWallCollision()) {
            this.audioManager.playWallHit();
        }

        // Check ball collision with player paddle
        const playerHitPoint = this.ball.checkPaddleCollision(this.playerPaddle);
        if (playerHitPoint !== null) {
            this.ball.applyPaddleHit(playerHitPoint);
            this.audioManager.playPaddleHit();
        }

        // Check ball collision with AI paddle
        const aiHitPoint = this.ball.checkPaddleCollision(this.aiPaddle);
        if (aiHitPoint !== null) {
            this.ball.applyPaddleHit(aiHitPoint);
            this.audioManager.playPaddleHit();
        }
    }

    /**
     * Check if ball exited screen bounds (scoring)
     */
    checkScoring() {
        const ballX = this.ball.x;
        const ballRadius = this.ball.radius;

        // Ball exited left side - AI scores
        if (ballX + ballRadius < 0) {
            this.aiScore++;
            this.audioManager.playScore();
            this.ball.reset(this.width / 2, this.height / 2);
            this.checkWinCondition();
        }

        // Ball exited right side - Player scores
        if (ballX - ballRadius > this.width) {
            this.playerScore++;
            this.audioManager.playScore();
            this.ball.reset(this.width / 2, this.height / 2);
            this.checkWinCondition();
        }
    }

    /**
     * Check if either player has won
     */
    checkWinCondition() {
        if (this.playerScore >= this.targetScore || this.aiScore >= this.targetScore) {
            this.state = 'GAME_OVER';
            this.audioManager.playGameOver();
        }
    }

    /**
     * Render all game elements
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw center dashed line
        this.drawCenterLine();

        // Draw paddles
        this.playerPaddle.render(this.ctx);
        this.aiPaddle.render(this.ctx);

        // Draw ball
        this.ball.render(this.ctx);

        // Draw scores
        this.drawScores();

        // Draw game over message if applicable
        if (this.state === 'GAME_OVER') {
            this.drawGameOver();
        }
    }

    /**
     * Draw dashed center line
     */
    drawCenterLine() {
        const centerX = this.width / 2;
        const dashHeight = 10;
        const dashGap = 15;

        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([dashHeight, dashGap]);

        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 0);
        this.ctx.lineTo(centerX, this.height);
        this.ctx.stroke();

        // Reset line dash for other drawings
        this.ctx.setLineDash([]);
    }

    /**
     * Draw player and AI scores
     */
    drawScores() {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${Math.floor(this.width / 15)}px Courier New`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';

        // Player score (left)
        const leftScoreX = this.width / 4;
        this.ctx.fillText(this.playerScore, leftScoreX, 20);

        // AI score (right)
        const rightScoreX = (this.width * 3) / 4;
        this.ctx.fillText(this.aiScore, rightScoreX, 20);
    }

    /**
     * Draw game over message
     */
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${Math.floor(this.width / 20)}px Courier New`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const winner = this.playerScore >= this.targetScore ? 'Player' : 'AI';
        this.ctx.fillText(`Game Over - ${winner} Wins!`, this.width / 2, this.height / 2 - 30);

        this.ctx.font = `${Math.floor(this.width / 30)}px Courier New`;
        this.ctx.fillText('Press SPACE or Touch to Restart', this.width / 2, this.height / 2 + 30);
    }

    /**
     * Reset game to initial state
     */
    reset() {
        this.state = 'PLAYING';
        this.playerScore = 0;
        this.aiScore = 0;

        // Reset paddle positions
        this.playerPaddle.reset(
            this.PADDLE_OFFSET,
            this.height / 2 - this.PADDLE_HEIGHT / 2
        );
        this.aiPaddle.reset(
            this.width - this.PADDLE_OFFSET - this.PADDLE_WIDTH,
            this.height / 2 - this.PADDLE_HEIGHT / 2
        );

        // Reset ball
        this.ball.reset(this.width / 2, this.height / 2);
    }

    /**
     * Handle window resize (update game dimensions)
     */
    handleResize(newWidth, newHeight) {
        this.width = newWidth;
        this.height = newHeight;

        // Update component boundaries
        this.playerPaddle.canvasHeight = newHeight;
        this.aiPaddle.canvasHeight = newHeight;
        this.ball.canvasWidth = newWidth;
        this.ball.canvasHeight = newHeight;

        // Reposition paddles
        this.playerPaddle.x = this.PADDLE_OFFSET;
        this.aiPaddle.x = newWidth - this.PADDLE_OFFSET - this.PADDLE_WIDTH;
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.inputHandler) {
            this.inputHandler.cleanup();
        }
    }
}
