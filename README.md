# 🦉 Wizard Owl - Castle Runner

A retro-style HTML5 platformer game featuring a wizard owl navigating through a dark castle!

## Features

### Character
- **Wizard Owl**: A pixelated wizard owl character in a black robe with a purple wizard hat
- **Animations**: Wing flapping animation and smooth movement
- **90s Aesthetic**: Pixel art style reminiscent of classic 90s games

### Gameplay
- **Continuous Running**: The owl runs continuously through the castle
- **Obstacle Navigation**: MUST jump over obstacles (books, tables, fireplaces) or get stuck
- **Platform Mechanics**: Can land on obstacles briefly, but must get down within 5 seconds
- **Long Jump Combat**: Hold R + SPACEBAR to jump OVER tigers for 25 points
- **Vertical Platforming**: Use stacked books and floating platforms to reach higher levels
- **Movement**: Use LEFT/RIGHT arrow keys for horizontal movement
- **Lives System**: Start with 3 lives, lose one when hit by obstacles or enemies
- **Level System**: Level up every 200 points and gain an extra life (max 5 lives)
- **Progressive Difficulty**: Game speed increases with each level, more tigers spawn

### Castle Environment
- **Dark Castle Setting**: Atmospheric dark castle with brick walls and textured floors
- **Ground Obstacles** (must jump over or get stuck):
  - 📚 Single books on the ground
  - 🪑 Tables with legs  
  - 🔥 Animated fireplaces with flickering flames
- **Platforming Elements**:
  - 📚 Stacked books (2-4 high) for temporary platforms
  - 📚 Floating books with magical glow for vertical progression
  - 📚 Book sequences creating ascending platforms to higher levels

### Collectibles & Enemies
- **🥔 Potato Chips**: Collect these for points (10 points each)
- **🔮 Tarot Cards**: Special mystical collectibles worth 50 points each with magical effects
- **🐅 Armoured Tigers**: Must be jumped OVER with long jump (R+Space) for 25 points
- **Enemy Scaling**: Tiger spawn rate increases with level (5% at level 1, up to 30% max)
- **Platform Warnings**: Red particles and flashing when platform time is running out
- **Particle Effects**: Visual feedback when collecting items, taking damage, or defeating enemies

### UI & Scoring
- **Player Name Input**: Enter your name before starting
- **Score Display**: Real-time score tracking
- **Level Display**: Shows current level with visual level-up effects
- **Lives Counter**: Shows remaining lives
- **Leaderboard**: Hall of Fame showing top 10 high scores with medals
- **New Record Effects**: Spectacular celebration when achieving a new high score
- **Game Over Screen**: Final score display with restart and leaderboard options

## How to Play

1. **Setup**: Enter your name in the input field
2. **Start**: Click "Start Game" to begin
3. **Controls**:
   - `SPACEBAR`: Jump
   - `R + SPACEBAR`: Long jump (defeats tigers)
   - `LEFT ARROW`: Move left
   - `RIGHT ARROW`: Move right
   - `ESCAPE`: Close leaderboard
4. **Objectives**:
   - **MUST** jump over ground obstacles or you'll get stuck and take damage
   - Use platforms (stacked/floating books) strategically but get down within 5 seconds
   - Jump OVER tigers with long jump (R+Space) for 25 points - don't land on them!
   - Collect potato chips (10 points) and mystical tarot cards (50 points)
   - Use floating book sequences to access higher levels and collectibles
   - Level up every 200 points to gain extra lives
   - Achieve high scores to make it onto the Hall of Fame leaderboard
   - Master the platforming to survive as long as possible

## Leaderboard Features

- **Hall of Fame**: Top 10 high scores preserved locally
- **Medal System**: Gold 🥇, Silver 🥈, Bronze 🥉 medals for top 3 players
- **Detailed Records**: Player name, score, level reached, and date
- **New Record Celebration**: Spectacular particle effects and notification
- **Persistent Storage**: Scores saved between browser sessions
- **Easy Management**: Clear all records option available

## Technical Details

- **Pure HTML5**: No external dependencies
- **Canvas Graphics**: Pixel-perfect rendering
- **60 FPS Animation**: Smooth gameplay experience
- **Collision Detection**: Precise hit detection for all game objects
- **Particle System**: Visual effects for enhanced gameplay

## Files Structure

```
wizard-owl-game/
├── index.html      # Main game HTML structure
├── styles.css      # Retro styling and layout
├── game.js         # Complete game logic and mechanics
└── README.md       # This documentation
```

## Browser Compatibility

Works in all modern browsers that support HTML5 Canvas:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Getting Started

1. Clone or download the game files
2. Open `index.html` in your web browser
3. Enter your name and start playing!

---

*Created with pixel-perfect precision and 90s nostalgia* 🎮✨
