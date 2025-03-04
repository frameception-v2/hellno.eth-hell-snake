```markdown
# hell-snake Farcaster Frame v2 Technical Specification

## 1. OVERVIEW

### Core Functionality
- Mobile-first Snake game implementation with winning condition at length 10
- Retro-styled visual theme with green snake and CRT screen effects
- Real-time score display (current length) and game instructions
- Collision detection (walls/self) and food spawning mechanics
- Victory/defeat states with restart capability

### UX Flow
1. Initial load: Display title "HELL-SNAKE" with animated subtitle "Use arrows to move • Reach length 10"
2. Gameplay: Snake automatically moves at fixed interval (200ms)
3. Continuous updates: Score counter animates on growth
4. End states:
   - Victory: Display "DEMONIC VICTORY" with share prompt
   - Defeat: Display "SOUL LOST" with restart option
5. Persistent controls: Always visible mobile touch inputs

## 2. TECHNICAL REQUIREMENTS

### Frontend Components
```html
<!-- Core structure -->
<div class="crt-screen">
  <div class="score-display">SOULS COLLECTED: <span id="score">1</span></div>
  <canvas id="gameCanvas"></canvas>
  <div class="mobile-controls">
    <button class="arrow up">↑</button>
    <button class="arrow left">←</button>
    <button class="arrow right">→</button>
    <button class="arrow down">↓</button>
  </div>
</div>
```

### API Integrations
- None required (pure client-side implementation)

### Client-Side State Management
- Snake position: Array of grid coordinates
- Food position: Single {x,y} object
- Movement direction: Current vector (N/S/E/W)
- Game state: Enum (playing/victory/defeat)
- All state stored in memory using JavaScript variables

### Mobile Responsiveness Strategy
- Viewport-relative sizing: `calc(100vh - 120px)` for canvas
- CSS Grid for control layout reorganization:
  ```css
  .mobile-controls {
    grid-template-areas:
      ". up ."
      "left down right";
  }
  ```
- Touch controls scale from 40px (desktop) to 60px (mobile)

## 3. FRAMES v2 IMPLEMENTATION

### Interactive Canvas
- 20x20 grid system with 1px spacing between cells
- Custom rendering pipeline:
  ```javascript
  function draw() {
    ctx.fillStyle = '#0f0'; // Retro green
    snake.forEach(segment => {
      ctx.fillRect(segment.x*20, segment.y*20, 18, 18);
    });
  }
  ```

### Animation Effects
- CRT scanlines using CSS linear gradient overlay:
  ```css
  .crt-screen::after {
    background: repeating-linear-gradient(
      transparent 0px,
      rgba(0,255,0,0.1) 2px
    );
  }
  ```
- Score counter pulse animation on snake growth

### Input Handling
- Keyboard events (Arrow keys)
- Touch events for mobile controls
- Direction queue system prevents 180° turns

### Sharing Capabilities
- Victory state generates OG image with score:
  `POST /api/shared-score?score=10`
- Social sharing text: "I conquered HELL-SNAKE 🔥🕹️"

## 4. MOBILE CONSIDERATIONS

### Touch Interaction
- 200ms touch delay prevention: `touch-action: manipulation`
- Visual feedback on control presses:
  ```css
  .arrow:active {
    transform: scale(0.8);
  }
  ```

### Responsive Layout
- Aspect ratio locking (1:1) for game canvas
- Dynamic font sizing:
  ```css
  .score-display {
    font-size: min(4vw, 20px);
  }
  ```

### Performance Optimization
- Canvas buffer technique: Render to offscreen canvas
- Debounced resize handler
- Hardware-accelerated transforms for mobile controls

## 5. CONSTRAINTS COMPLIANCE

### Confirmed Implementation Details
- 🟢 No database requirements - All state in memory
- 🟢 No smart contracts - Pure frontend logic
- 🟢 State through redirects - Game reset via frame reload
- 🟢 Frame actions limited to share functionality

### Prohibited Elements
- 🔴 No persistent storage
- 🔴 No blockchain interactions
- 🔴 No server-side processing
```

This specification implements all requested features while maintaining full Frame v2 compliance. The solution leverages modern CSS Grid and Canvas APIs while maintaining backward compatibility through progressive enhancement.