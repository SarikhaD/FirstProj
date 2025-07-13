// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const playerNameInput = document.getElementById('playerName');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const finalScoreElement = document.getElementById('finalScore');
const finalLevelElement = document.getElementById('finalLevel');
const gameOverScreen = document.getElementById('gameOver');
const leaderboardButton = document.getElementById('leaderboardButton');
const viewLeaderboardButton = document.getElementById('viewLeaderboardButton');
const leaderboardScreen = document.getElementById('leaderboard');
const leaderboardBody = document.getElementById('leaderboardBody');
const clearLeaderboardButton = document.getElementById('clearLeaderboardButton');
const closeLeaderboardButton = document.getElementById('closeLeaderboardButton');

// Game state
let gameRunning = false;
let gameSpeed = 2;
let score = 0;
let level = 1;
let lives = 3;
let playerName = '';
let gameObjects = [];
let particles = [];
let levelUpText = { show: false, timer: 0 };

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent page scrolling
    }
    if (e.code === 'Escape') {
        // Close leaderboard on escape
        if (!leaderboardScreen.classList.contains('hidden')) {
            hideLeaderboard();
        }
    }
    if (gameRunning && document.activeElement !== playerNameInput) {
        keys[e.code] = true;
    }
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent page scrolling
    }
    if (gameRunning && document.activeElement !== playerNameInput) {
        keys[e.code] = false;
    }
});

// Close leaderboard when clicking outside
leaderboardScreen.addEventListener('click', (e) => {
    if (e.target === leaderboardScreen) {
        hideLeaderboard();
    }
});

// Player class (Wizard Owl)
class Player {
    constructor() {
        this.x = 100;
        this.y = 280;
        this.width = 40;
        this.height = 40;
        this.velocityY = 0;
        this.jumpPower = 15;
        this.longJumpPower = 22;
        this.gravity = 0.8;
        this.onGround = false;
        this.animFrame = 0;
        this.animSpeed = 0.1;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.isLongJumping = false;
    }

    update() {
        // Handle invincibility
        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        // Handle jumping
        if (keys['Space'] && this.onGround) {
            if (keys['KeyR']) {
                // Long jump (R + Space)
                this.velocityY = -this.longJumpPower;
                this.isLongJumping = true;
                createParticles(this.x + this.width/2, this.y + this.height, '#FFD700', 8);
                // Add boost particles
                for (let i = 0; i < 5; i++) {
                    const boostParticle = new Particle(
                        this.x + this.width/2 + (Math.random() - 0.5) * 20,
                        this.y + this.height + Math.random() * 10,
                        '#FFA500'
                    );
                    boostParticle.vy = Math.random() * 2 + 1;
                    particles.push(boostParticle);
                }
            } else {
                // Regular jump
                this.velocityY = -this.jumpPower;
                this.isLongJumping = false;
            }
            this.onGround = false;
        }
        
        // Reset long jump when landing
        if (this.onGround) {
            this.isLongJumping = false;
        }

        // Handle left/right movement
        if (keys['ArrowLeft'] && this.x > 0) {
            this.x -= 3;
        }
        if (keys['ArrowRight'] && this.x < canvas.width - this.width) {
            this.x += 3;
        }

        // Apply gravity
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Ground collision
        if (this.y >= 280) {
            this.y = 280;
            this.velocityY = 0;
            this.onGround = true;
        }
        
        // Check if falling off platforms
        if (this.onGround && this.y < 280) {
            let onPlatform = false;
            for (const obj of gameObjects) {
                if ((obj instanceof Book || obj instanceof Table || obj instanceof Fireplace) && obj.isPlatform) {
                    const playerCenterX = this.x + this.width/2;
                    const objLeft = obj.x;
                    const objRight = obj.x + obj.width;
                    const objTop = obj.getTopY();
                    
                    if (playerCenterX >= objLeft && playerCenterX <= objRight && 
                        Math.abs(this.y + this.height - objTop) < 10) {
                        onPlatform = true;
                        break;
                    }
                }
            }
            
            if (!onPlatform) {
                this.onGround = false; // Start falling
            }
        }

        // Animation
        this.animFrame += this.animSpeed;
        if (this.animFrame >= 4) this.animFrame = 0;
    }

    draw() {
        ctx.save();
        
        // Flash when invincible
        if (this.invincible && Math.floor(this.invincibleTimer / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw pixelated wizard owl
        ctx.fillStyle = '#2c2c2c'; // Black robe
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Owl face
        ctx.fillStyle = '#8B4513'; // Brown face
        ctx.fillRect(this.x + 8, this.y + 5, 24, 20);
        
        // Eyes
        ctx.fillStyle = '#FFD700'; // Golden eyes
        ctx.fillRect(this.x + 12, this.y + 8, 6, 6);
        ctx.fillRect(this.x + 22, this.y + 8, 6, 6);
        
        // Pupils
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 14, this.y + 10, 2, 2);
        ctx.fillRect(this.x + 24, this.y + 10, 2, 2);
        
        // Beak
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(this.x + 18, this.y + 16, 4, 3);
        
        // Wizard hat
        ctx.fillStyle = '#4B0082'; // Purple hat
        ctx.fillRect(this.x + 10, this.y - 5, 20, 8);
        ctx.fillRect(this.x + 15, this.y - 15, 10, 12);
        
        // Hat star
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x + 18, this.y - 10, 4, 2);
        ctx.fillRect(this.x + 19, this.y - 12, 2, 4);
        
        // Wings (animated) - enhanced during long jump
        const wingOffset = Math.sin(this.animFrame) * 2;
        const wingSize = this.isLongJumping ? 14 : 12;
        ctx.fillStyle = this.isLongJumping ? '#8B6F00' : '#654321';
        ctx.fillRect(this.x + 5, this.y + 15 + wingOffset, 8, wingSize);
        ctx.fillRect(this.x + 27, this.y + 15 - wingOffset, 8, wingSize);
        
        // Long jump aura effect
        if (this.isLongJumping) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        }
        
        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    takeDamage() {
        if (!this.invincible) {
            this.invincible = true;
            this.invincibleTimer = 60; // 1 second at 60 FPS
            return true;
        }
        return false;
    }
}

// Obstacle classes
class Book {
    constructor(x, stackHeight = 1, isFloating = false, floatY = null) {
        this.x = x;
        this.stackHeight = stackHeight;
        this.isFloating = isFloating;
        this.width = 30;
        this.height = 20 * stackHeight;
        
        if (isFloating && floatY !== null) {
            this.y = floatY;
        } else if (isFloating) {
            this.y = 150 + Math.random() * 100; // Random floating height
        } else {
            this.y = 320 - this.height; // Stack from ground
        }
        
        this.isPlatform = true;
        this.platformTimer = 0; // Timer for temporary platform use
    }

    update() {
        this.x -= gameSpeed;
        
        // Reduce platform timer if player was on it
        if (this.platformTimer > 0) {
            this.platformTimer--;
        }
    }

    draw() {
        // Draw each book in the stack
        for (let i = 0; i < this.stackHeight; i++) {
            const bookY = this.y + (this.stackHeight - 1 - i) * 20;
            
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, bookY, this.width, 20);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.x + 2, bookY + 2, this.width - 4, 3);
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 5, bookY + 8, this.width - 10, 2);
            
            // Add floating glow effect for floating books
            if (this.isFloating) {
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 5;
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x - 1, bookY - 1, this.width + 2, 22);
                ctx.shadowBlur = 0;
            }
        }
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
    
    getTopY() {
        return this.y;
    }
}

class Table {
    constructor(x) {
        this.x = x;
        this.y = 270;
        this.width = 60;
        this.height = 50;
        this.isPlatform = true;
        this.platformTimer = 0;
    }

    update() {
        this.x -= gameSpeed;
        
        if (this.platformTimer > 0) {
            this.platformTimer--;
        }
    }

    draw() {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, 10);
        ctx.fillRect(this.x + 5, this.y + 10, 8, 40);
        ctx.fillRect(this.x + this.width - 13, this.y + 10, 8, 40);
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
    
    getTopY() {
        return this.y;
    }
}

class Fireplace {
    constructor(x) {
        this.x = x;
        this.y = 250;
        this.width = 40;
        this.height = 70;
        this.fireFrame = 0;
        this.isPlatform = true;
        this.platformTimer = 0;
    }

    update() {
        this.x -= gameSpeed;
        this.fireFrame += 0.2;
        
        if (this.platformTimer > 0) {
            this.platformTimer--;
        }
    }

    draw() {
        // Stone base
        ctx.fillStyle = '#696969';
        ctx.fillRect(this.x, this.y + 50, this.width, 20);
        
        // Fire (animated)
        const fireHeight = 20 + Math.sin(this.fireFrame) * 5;
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(this.x + 8, this.y + 30, 24, fireHeight);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x + 12, this.y + 35, 16, fireHeight - 10);
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
    
    getTopY() {
        return this.y;
    }
}

// Enemy class (Armoured Tiger)
class ArmouredTiger {
    constructor(x) {
        this.x = x;
        this.y = 260;
        this.width = 50;
        this.height = 60;
        this.animFrame = 0;
    }

    update() {
        this.x -= gameSpeed + 1;
        this.animFrame += 0.15;
    }

    draw() {
        ctx.save();
        
        // Body
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(this.x, this.y + 20, this.width, 30);
        
        // Stripes
        ctx.fillStyle = '#000';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(this.x + 10 + i * 10, this.y + 20, 3, 30);
        }
        
        // Head
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(this.x + 30, this.y, 20, 25);
        
        // Armor
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(this.x + 5, this.y + 15, 40, 10);
        ctx.fillRect(this.x + 32, this.y - 5, 16, 8);
        
        // Eyes
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x + 35, this.y + 5, 3, 3);
        ctx.fillRect(this.x + 42, this.y + 5, 3, 3);
        
        // Legs (animated)
        const legOffset = Math.sin(this.animFrame) * 2;
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(this.x + 8, this.y + 50 + legOffset, 8, 10);
        ctx.fillRect(this.x + 34, this.y + 50 - legOffset, 8, 10);
        
        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// Collectible class (Potato Chip)
class PotatoChip {
    constructor(x) {
        this.x = x;
        this.y = 200 + Math.random() * 80;
        this.width = 20;
        this.height = 15;
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.x -= gameSpeed;
        this.bobOffset += 0.1;
        this.y += Math.sin(this.bobOffset) * 0.5;
    }

    draw() {
        ctx.save();
        
        // Chip shape
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Chip texture
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(this.x + 2, this.y + 2, 4, 3);
        ctx.fillRect(this.x + 10, this.y + 6, 3, 2);
        ctx.fillRect(this.x + 14, this.y + 10, 4, 3);
        
        // Sparkle effect
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.x + 8, this.y + 1, 1, 1);
        ctx.fillRect(this.x + 16, this.y + 5, 1, 1);
        
        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// Tarot Card class (Special collectible)
class TarotCard {
    constructor(x) {
        this.x = x;
        this.y = 180 + Math.random() * 100;
        this.width = 25;
        this.height = 35;
        this.rotationSpeed = 0.02;
        this.rotation = 0;
        this.glowPulse = 0;
        this.cardType = Math.floor(Math.random() * 4); // 4 different card designs
    }

    update() {
        this.x -= gameSpeed;
        this.rotation += this.rotationSpeed;
        this.glowPulse += 0.1;
    }

    draw() {
        ctx.save();
        
        // Move to center of card for rotation
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        // Mystical glow effect
        const glowIntensity = 0.3 + Math.sin(this.glowPulse) * 0.2;
        ctx.shadowColor = '#9D4EDD';
        ctx.shadowBlur = 10 + Math.sin(this.glowPulse) * 5;
        
        // Card back (dark purple)
        ctx.fillStyle = '#2D1B69';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Card border
        ctx.strokeStyle = '#9D4EDD';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Mystical symbols based on card type
        ctx.fillStyle = '#F0C3FF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        
        switch(this.cardType) {
            case 0: // Moon
                ctx.fillText('☾', 0, 0);
                break;
            case 1: // Star
                ctx.fillText('★', 0, 0);
                break;
            case 2: // Sun
                ctx.fillText('☀', 0, 0);
                break;
            case 3: // Eye
                ctx.fillText('👁', 0, 0);
                break;
        }
        
        // Sparkle particles around the card
        for (let i = 0; i < 3; i++) {
            const sparkleX = (Math.random() - 0.5) * 40;
            const sparkleY = (Math.random() - 0.5) * 50;
            const sparkleSize = Math.random() * 2 + 1;
            const sparkleAlpha = Math.sin(this.glowPulse + i) * 0.5 + 0.5;
            
            ctx.globalAlpha = sparkleAlpha;
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(sparkleX, sparkleY, sparkleSize, sparkleSize);
        }
        
        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// Particle system for effects
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.color = color;
        this.life = 30;
        this.maxLife = 30;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        this.life--;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 2, 2);
        ctx.restore();
    }
}

// Game functions
function spawnGameObject() {
    const spawnX = canvas.width + 50;
    const rand = Math.random();
    
    // Adjust tiger spawn rate based on level
    const tigerRate = Math.min(0.05 + (level - 1) * 0.05, 0.3);
    const tarotRate = 0.1;
    const obstacleRate = 0.4; // Reduced to make room for platforming books
    const chipRate = 0.2;
    const platformRate = 0.15; // New category for platforming books
    
    if (rand < obstacleRate / 3) {
        // Single ground book
        gameObjects.push(new Book(spawnX, 1, false));
    } else if (rand < (obstacleRate / 3) * 2) {
        gameObjects.push(new Table(spawnX));
    } else if (rand < obstacleRate) {
        gameObjects.push(new Fireplace(spawnX));
    } else if (rand < obstacleRate + platformRate) {
        // Platforming books - stacked or floating
        const platformType = Math.random();
        if (platformType < 0.4) {
            // Stacked books (2-4 high)
            const stackHeight = 2 + Math.floor(Math.random() * 3);
            gameObjects.push(new Book(spawnX, stackHeight, false));
        } else if (platformType < 0.7) {
            // Single floating book
            const floatY = 180 + Math.random() * 80;
            gameObjects.push(new Book(spawnX, 1, true, floatY));
        } else {
            // Multiple floating books for platforming sequence
            spawnFloatingBookSequence(spawnX);
        }
    } else if (rand < obstacleRate + platformRate + chipRate) {
        gameObjects.push(new PotatoChip(spawnX));
    } else if (rand < obstacleRate + platformRate + chipRate + tarotRate) {
        gameObjects.push(new TarotCard(spawnX));
    } else if (rand < obstacleRate + platformRate + chipRate + tarotRate + tigerRate) {
        gameObjects.push(new ArmouredTiger(spawnX));
    } else {
        gameObjects.push(new PotatoChip(spawnX));
    }
}

function spawnFloatingBookSequence(startX) {
    // Create a sequence of 2-3 floating books for platforming
    const sequenceLength = 2 + Math.floor(Math.random() * 2);
    const startY = 200;
    const heightIncrement = 40;
    
    for (let i = 0; i < sequenceLength; i++) {
        const bookX = startX + i * 80;
        const bookY = startY - i * heightIncrement;
        gameObjects.push(new Book(bookX, 1, true, bookY));
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function createParticles(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function drawBackground() {
    // Dark castle background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Castle walls
    ctx.fillStyle = '#2c2c54';
    ctx.fillRect(0, 0, canvas.width, 100);
    
    // Castle bricks pattern
    ctx.fillStyle = '#40407a';
    for (let x = 0; x < canvas.width; x += 20) {
        for (let y = 0; y < 100; y += 10) {
            if ((x / 20 + y / 10) % 2 === 0) {
                ctx.fillRect(x, y, 18, 8);
            }
        }
    }
    
    // Ground
    ctx.fillStyle = '#2c2c54';
    ctx.fillRect(0, 320, canvas.width, 80);
    
    // Ground texture
    ctx.fillStyle = '#40407a';
    for (let x = 0; x < canvas.width; x += 10) {
        ctx.fillRect(x, 320, 8, 80);
    }
}

function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
}

function checkLevelUp() {
    const newLevel = Math.floor(score / 200) + 1;
    if (newLevel > level) {
        level = newLevel;
        lives = Math.min(lives + 1, 5); // Gain a life on level up (max 5)
        createParticles(player.x + player.width/2, player.y + player.height/2, '#FFD700', 15);
        // Show level up effect
        showLevelUpEffect();
    }
}

function showLevelUpEffect() {
    // Create a special particle burst for level up
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const speed = 3 + Math.random() * 2;
        const particle = new Particle(
            player.x + player.width/2 + Math.cos(angle) * 20,
            player.y + player.height/2 + Math.sin(angle) * 20,
            '#9D4EDD'
        );
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        particles.push(particle);
    }
    
    // Show level up text
    levelUpText.show = true;
    levelUpText.timer = 120; // 2 seconds at 60 FPS
}

function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Update and draw player
    player.update();
    player.draw();
    
    // Spawn new objects
    if (Math.random() < 0.015 && gameObjects.length < 10) {
        spawnGameObject();
    }
    
    // Update and draw game objects
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const obj = gameObjects[i];
        obj.update();
        obj.draw();
        
        // Remove objects that are off-screen
        if (obj.x + obj.width < 0) {
            gameObjects.splice(i, 1);
            continue;
        }
        
        // Check collisions
        if (checkCollision(player.getBounds(), obj.getBounds())) {
            if (obj instanceof PotatoChip) {
                score += 10;
                createParticles(obj.x + obj.width/2, obj.y + obj.height/2, '#FFD700');
                gameObjects.splice(i, 1);
                checkLevelUp();
            } else if (obj instanceof TarotCard) {
                score += 50;
                createParticles(obj.x + obj.width/2, obj.y + obj.height/2, '#9D4EDD', 10);
                // Extra sparkle effect for tarot cards
                for (let j = 0; j < 5; j++) {
                    const sparkle = new Particle(
                        obj.x + obj.width/2 + (Math.random() - 0.5) * 30,
                        obj.y + obj.height/2 + (Math.random() - 0.5) * 30,
                        '#F0C3FF'
                    );
                    sparkle.life = 60;
                    sparkle.maxLife = 60;
                    particles.push(sparkle);
                }
                gameObjects.splice(i, 1);
                checkLevelUp();
            } else if (obj instanceof ArmouredTiger) {
                // Tigers must be jumped OVER with long jump
                const playerCenterX = player.x + player.width/2;
                const tigerCenterX = obj.x + obj.width/2;
                const playerBottom = player.y + player.height;
                const tigerTop = obj.y;
                
                if (player.isLongJumping && player.velocityY <= 0 && 
                    playerBottom < tigerTop + 5 && 
                    Math.abs(playerCenterX - tigerCenterX) < 30) {
                    // Successfully jumping over tiger with long jump
                    score += 25;
                    createParticles(obj.x + obj.width/2, obj.y + obj.height/2, '#FFD700', 12);
                    
                    // Victory effect
                    for (let j = 0; j < 8; j++) {
                        const explosion = new Particle(
                            obj.x + obj.width/2 + (Math.random() - 0.5) * 40,
                            obj.y + obj.height/2 + (Math.random() - 0.5) * 40,
                            '#FFA500'
                        );
                        explosion.vx = (Math.random() - 0.5) * 6;
                        explosion.vy = (Math.random() - 0.5) * 6;
                        particles.push(explosion);
                    }
                    gameObjects.splice(i, 1);
                    checkLevelUp();
                } else {
                    // Any other contact with tiger = damage (failed jump, side collision, etc.)
                    if (player.takeDamage()) {
                        lives--;
                        createParticles(player.x + player.width/2, player.y + player.height/2, '#FF0000');
                        // Push player back to prevent continuous damage
                        player.x = obj.x - player.width - 10;
                        if (lives <= 0) {
                            gameOver();
                        }
                    }
                }
            } else if (obj instanceof Book || obj instanceof Table || obj instanceof Fireplace) {
                // Platform obstacles
                const playerBottom = player.y + player.height;
                const playerTop = player.y;
                const playerLeft = player.x;
                const playerRight = player.x + player.width;
                const objTop = obj.getTopY();
                const objBottom = obj.y + obj.height;
                const objLeft = obj.x;
                const objRight = obj.x + obj.width;
                
                // Check if landing on top of platform
                if (player.velocityY > 0 && playerTop < objTop && playerBottom > objTop - 5) {
                    // Landing on platform
                    player.y = objTop - player.height;
                    player.velocityY = 0;
                    player.onGround = true;
                    obj.platformTimer = 300; // 5 seconds to get down
                    
                    // Start countdown to force player down
                    if (!obj.forceDownTimer) {
                        obj.forceDownTimer = 300;
                    }
                } else {
                    // Side collision or getting stuck - damage or block
                    if (playerRight > objLeft && playerLeft < objRight && 
                        playerBottom > objTop && playerTop < objBottom) {
                        
                        // Player is stuck in obstacle
                        if (player.takeDamage()) {
                            lives--;
                            createParticles(player.x + player.width/2, player.y + player.height/2, '#FF0000');
                            // Push player back
                            player.x = objLeft - player.width - 5;
                            if (lives <= 0) {
                                gameOver();
                            }
                        }
                    }
                }
            }
        }
        
        // Handle platform timer for forcing player down
        if ((obj instanceof Book || obj instanceof Table || obj instanceof Fireplace) && obj.forceDownTimer) {
            obj.forceDownTimer--;
            
            const playerOnPlatform = player.onGround && 
                Math.abs(player.y + player.height - obj.getTopY()) < 5 &&
                player.x + player.width > obj.x && player.x < obj.x + obj.width;
            
            if (playerOnPlatform) {
                // Visual warning when time is running out
                if (obj.forceDownTimer < 120) { // Last 2 seconds
                    if (obj.forceDownTimer % 20 === 0) {
                        createParticles(obj.x + obj.width/2, obj.getTopY() - 5, '#FF6347', 3);
                    }
                    
                    // Flash the platform
                    ctx.save();
                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = '#FF0000';
                    ctx.fillRect(obj.x, obj.getTopY(), obj.width, 5);
                    ctx.restore();
                }
                
                if (obj.forceDownTimer <= 0) {
                    // Force player off the platform
                    if (player.x + player.width/2 < obj.x + obj.width/2) {
                        player.x -= 3; // Push left faster
                    } else {
                        player.x += 3; // Push right faster
                    }
                    player.onGround = false;
                    player.velocityY = 2; // Start falling
                }
            } else {
                // Reset timer if player gets off platform naturally
                obj.forceDownTimer = null;
            }
        }
    }
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw();
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Increase difficulty based on level
    gameSpeed = 2 + (level - 1) * 0.3;
    
    // Update level up text
    if (levelUpText.show) {
        levelUpText.timer--;
        if (levelUpText.timer <= 0) {
            levelUpText.show = false;
        }
    }
    
    // Draw level up text
    if (levelUpText.show) {
        ctx.save();
        ctx.font = '24px Press Start 2P';
        ctx.fillStyle = '#9D4EDD';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        const alpha = levelUpText.timer > 60 ? 1 : levelUpText.timer / 60;
        ctx.globalAlpha = alpha;
        
        ctx.strokeText(`LEVEL ${level}!`, canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillText(`LEVEL ${level}!`, canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.font = '12px Press Start 2P';
        ctx.strokeText('+1 LIFE!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText('+1 LIFE!', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.restore();
    }
    
    // Update UI
    updateUI();
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    playerName = playerNameInput.value.trim() || 'Anonymous';
    gameRunning = true;
    score = 0;
    level = 1;
    lives = 3;
    gameSpeed = 2;
    gameObjects = [];
    particles = [];
    levelUpText = { show: false, timer: 0 };
    
    // Clear all key states
    Object.keys(keys).forEach(key => keys[key] = false);
    
    player = new Player();
    
    gameOverScreen.classList.add('hidden');
    gameLoop();
}

function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    finalLevelElement.textContent = level;
    
    // Check if it's a new record before saving
    const isNewRecord = checkNewRecord(score, level);
    
    // Save score to leaderboard
    saveScore(playerName, score, level);
    
    if (isNewRecord) {
        // Show new record celebration
        showNewRecordEffect();
    }
    
    gameOverScreen.classList.remove('hidden');
}

function showNewRecordEffect() {
    // Create spectacular particle burst for new record
    for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI * 2;
        const speed = 4 + Math.random() * 3;
        const distance = 30 + Math.random() * 50;
        
        const particle = new Particle(
            canvas.width / 2 + Math.cos(angle) * distance,
            canvas.height / 2 + Math.sin(angle) * distance,
            i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FFA500' : '#FF6347'
        );
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        particle.life = 120;
        particle.maxLife = 120;
        particles.push(particle);
    }
    
    // Add "NEW RECORD!" text effect
    setTimeout(() => {
        const recordText = document.createElement('div');
        recordText.innerHTML = '🏆 NEW RECORD! 🏆';
        recordText.style.cssText = `
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Press Start 2P', cursive;
            font-size: 16px;
            color: #FFD700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            z-index: 1000;
            animation: pulse 1s infinite;
            pointer-events: none;
        `;
        
        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(recordText);
        
        // Remove after 3 seconds
        setTimeout(() => {
            recordText.remove();
            style.remove();
        }, 3000);
    }, 500);
}

function resetGame() {
    gameRunning = false;
    score = 0;
    level = 1;
    lives = 3;
    gameSpeed = 2;
    gameObjects = [];
    particles = [];
    levelUpText = { show: false, timer: 0 };
    updateUI();
}

// Leaderboard functions
function saveScore(playerName, score, level) {
    const scoreData = {
        name: playerName || 'Anonymous',
        score: score,
        level: level,
        date: new Date().toLocaleDateString()
    };
    
    let scores = getLeaderboard();
    scores.push(scoreData);
    
    // Sort by score (highest first), then by level
    scores.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return b.level - a.level;
    });
    
    // Keep only top 10 scores
    scores = scores.slice(0, 10);
    
    localStorage.setItem('wizardOwlLeaderboard', JSON.stringify(scores));
}

function getLeaderboard() {
    const stored = localStorage.getItem('wizardOwlLeaderboard');
    return stored ? JSON.parse(stored) : [];
}

function displayLeaderboard() {
    const scores = getLeaderboard();
    leaderboardBody.innerHTML = '';
    
    if (scores.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" style="text-align: center; padding: 20px;">No records yet! Be the first!</td>';
        leaderboardBody.appendChild(row);
        return;
    }
    
    scores.forEach((scoreData, index) => {
        const row = document.createElement('tr');
        
        let rankDisplay = index + 1;
        if (index === 0) rankDisplay = '🥇';
        else if (index === 1) rankDisplay = '🥈';
        else if (index === 2) rankDisplay = '🥉';
        
        row.innerHTML = `
            <td class="rank-medal">${rankDisplay}</td>
            <td>${scoreData.name}</td>
            <td>${scoreData.score.toLocaleString()}</td>
            <td>${scoreData.level}</td>
            <td>${scoreData.date}</td>
        `;
        
        leaderboardBody.appendChild(row);
    });
}

function showLeaderboard() {
    displayLeaderboard();
    leaderboardScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
}

function hideLeaderboard() {
    leaderboardScreen.classList.add('hidden');
}

function clearLeaderboard() {
    if (confirm('Are you sure you want to clear all leaderboard records?')) {
        localStorage.removeItem('wizardOwlLeaderboard');
        displayLeaderboard();
    }
}

function checkNewRecord(score, level) {
    const scores = getLeaderboard();
    if (scores.length < 10) return true; // Less than 10 scores, always a record
    
    const lowestScore = scores[scores.length - 1];
    return score > lowestScore.score || (score === lowestScore.score && level > lowestScore.level);
}

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
leaderboardButton.addEventListener('click', showLeaderboard);
viewLeaderboardButton.addEventListener('click', showLeaderboard);
closeLeaderboardButton.addEventListener('click', hideLeaderboard);
clearLeaderboardButton.addEventListener('click', clearLeaderboard);

// Initialize player
let player = new Player();

// Initial UI update
updateUI();

// Draw initial screen
drawBackground();
player.draw();