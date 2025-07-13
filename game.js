// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const playerNameInput = document.getElementById('playerName');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const finalScoreElement = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOver');

// Game state
let gameRunning = false;
let gameSpeed = 2;
let score = 0;
let lives = 3;
let playerName = '';
let gameObjects = [];
let particles = [];

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent page scrolling
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

// Player class (Wizard Owl)
class Player {
    constructor() {
        this.x = 100;
        this.y = 280;
        this.width = 40;
        this.height = 40;
        this.velocityY = 0;
        this.jumpPower = 15;
        this.gravity = 0.8;
        this.onGround = false;
        this.animFrame = 0;
        this.animSpeed = 0.1;
        this.invincible = false;
        this.invincibleTimer = 0;
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
            this.velocityY = -this.jumpPower;
            this.onGround = false;
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
        
        // Wings (animated)
        const wingOffset = Math.sin(this.animFrame) * 2;
        ctx.fillStyle = '#654321';
        ctx.fillRect(this.x + 5, this.y + 15 + wingOffset, 8, 12);
        ctx.fillRect(this.x + 27, this.y + 15 - wingOffset, 8, 12);
        
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
    constructor(x) {
        this.x = x;
        this.y = 300;
        this.width = 30;
        this.height = 20;
    }

    update() {
        this.x -= gameSpeed;
    }

    draw() {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 3);
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 5, this.y + 8, this.width - 10, 2);
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

class Table {
    constructor(x) {
        this.x = x;
        this.y = 270;
        this.width = 60;
        this.height = 50;
    }

    update() {
        this.x -= gameSpeed;
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
}

class Fireplace {
    constructor(x) {
        this.x = x;
        this.y = 250;
        this.width = 40;
        this.height = 70;
        this.fireFrame = 0;
    }

    update() {
        this.x -= gameSpeed;
        this.fireFrame += 0.2;
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
    
    if (rand < 0.2) {
        gameObjects.push(new Book(spawnX));
    } else if (rand < 0.4) {
        gameObjects.push(new Table(spawnX));
    } else if (rand < 0.6) {
        gameObjects.push(new Fireplace(spawnX));
    } else if (rand < 0.8) {
        gameObjects.push(new PotatoChip(spawnX));
    } else {
        gameObjects.push(new ArmouredTiger(spawnX));
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
            } else if (obj instanceof ArmouredTiger) {
                if (player.takeDamage()) {
                    lives--;
                    createParticles(player.x + player.width/2, player.y + player.height/2, '#FF0000');
                    gameObjects.splice(i, 1);
                    if (lives <= 0) {
                        gameOver();
                    }
                }
            } else if (obj instanceof Book || obj instanceof Table || obj instanceof Fireplace) {
                if (player.velocityY > 0 && player.y < obj.y) {
                    // Landing on obstacle
                    player.y = obj.y - player.height;
                    player.velocityY = 0;
                    player.onGround = true;
                } else {
                    // Hit obstacle
                    if (player.takeDamage()) {
                        lives--;
                        createParticles(player.x + player.width/2, player.y + player.height/2, '#FF0000');
                        gameObjects.splice(i, 1);
                        if (lives <= 0) {
                            gameOver();
                        }
                    }
                }
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
    
    // Increase difficulty over time
    if (score > 0 && Math.floor(score / 100) * 100 === score) {
        gameSpeed = 2 + Math.floor(score / 100) * 0.5;
    }
    
    // Update UI
    updateUI();
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    playerName = playerNameInput.value.trim() || 'Anonymous';
    gameRunning = true;
    score = 0;
    lives = 3;
    gameSpeed = 2;
    gameObjects = [];
    particles = [];
    
    // Clear all key states
    Object.keys(keys).forEach(key => keys[key] = false);
    
    player = new Player();
    
    gameOverScreen.classList.add('hidden');
    gameLoop();
}

function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function resetGame() {
    gameRunning = false;
    score = 0;
    lives = 3;
    gameSpeed = 2;
    gameObjects = [];
    particles = [];
    updateUI();
}

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Initialize player
let player = new Player();

// Initial UI update
updateUI();

// Draw initial screen
drawBackground();
player.draw();