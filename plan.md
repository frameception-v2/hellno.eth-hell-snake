```markdown
# Hell-Snake Development Plan

## Phase 1: Core Game Infrastructure
**Objective:** Implement basic snake movement and collision system

### Components:
- HTML5 Canvas rendering pipeline
- Grid coordinate system (20x20)
- Directional queue system (prevent 180° turns)
- Game loop using `requestAnimationFrame`

### Challenges:
- Synchronizing game ticks (200ms) with smooth animations
- Implementing collision detection without performance hits
- Coordinating directional input with game state updates

### Mobile Considerations:
- Initial viewport configuration for mobile aspect ratios
- Basic touch event scaffolding

### Acceptance Criteria:
1. Snake moves continuously at 200ms intervals
2. Collisions with walls/self trigger game over
3. Arrow keys change direction (with input queue)
4. Food spawns in random non-occupied positions

---

## Phase 2: User Interface Components
**Objective:** Build responsive game interface and controls

### Components:
- CRT screen effect with CSS gradients
- Animated score display with DOM transitions
- Mobile control grid with touch handlers
- Victory/defeat modal overlays

### Challenges:
- Maintaining aspect ratio across viewports
- Coordinating CSS animations with game state
- Implementing touch controls without input lag

### Mobile Considerations:
- Touch control layout reorganization (grid areas)
- `touch-action: manipulation` implementation
- Control size scaling based on viewport

### Acceptance Criteria:
1. Score updates with pulse animation on growth
2. Mobile controls visible only on touch devices
3. Endgame modals prevent further input
4. CRT effect persists across all states

---

## Phase 3: Game State Management
**Objective:** Implement game logic flow and state transitions

### Components:
- State machine (playing/victory/defeat)
- Game reset functionality
- Input validation system
- Victory condition checker (length >=10)

### Challenges:
- Managing state transitions during animation frames
- Preventing memory leaks in reset cycles
- Coordinating multiple concurrent state updates

### Mobile Considerations:
- Touch event preventDefault handling
- Viewport locking during gameplay

### Acceptance Criteria:
1. Game transitions to victory at length 10
2. Defeat modal appears on collision
3. Frame reload resets game state completely
4. No state persistence between sessions

---

## Phase 4: Visual Enhancements
**Objective:** Implement retro-styled visual effects

### Components:
- Canvas-based CRT scanlines
- Snake segment rendering effects
- Food particle animation
- Screen flicker effects on state changes

### Challenges:
- Balancing visual effects with performance
- Implementing retro effects without external assets
- Maintaining readability on mobile screens

### Mobile Considerations:
- GPU-accelerated animations
- Dynamic effect intensity based on device PPN

### Acceptance Criteria:
1. Visible scanlines with gradient overlay
2. Snake segments show "glow" effect
3. Food particle pulses at 1Hz frequency
4. Victory triggers screen flash effect

---

## Phase 5: Sharing and Social Features
**Objective:** Implement victory sharing capabilities

### Components:
- OG image generation canvas
- Frame post message composition
- Social share text formatting
- Victory state validation

### Challenges:
- Client-side image generation
- Encoding game state in share payload
- Frame action metadata compliance

### Mobile Considerations:
- Touch-friendly share triggers
- Mobile-optimized OG image dimensions

### Acceptance Criteria:
1. Victory generates shareable image with score
2. Share button triggers Frame message
3. No external API dependencies
4. Text matches "I conquered HELL-SNAKE 🔥🕹️"

---

## Phase 6: Mobile Optimization
**Objective:** Finalize mobile-specific behaviors

### Components:
- Viewport resize handlers
- Touch delay prevention system
- Performance benchmarking
- Cross-browser testing

### Challenges:
- Android vs iOS touch behavior differences
- Mobile browser rendering inconsistencies
- Battery efficiency considerations

### Mobile Considerations:
- `calc(100vh - 120px)` canvas sizing
- 60px minimum touch targets
- Hardware-accelerated transforms

### Acceptance Criteria:
1. Consistent 60FPS on mid-range devices
2. Touch controls show visual feedback
3. No unresponsive periods >100ms
4. Passes Lighthouse mobile audit

---

## Dependency Graph:
1. Phase 1 → Phase 2 → Phase 3 → Phase 5
2. Phase 1 → Phase 4
3. All Phases → Phase 6
4. Phase 2 ↔ Phase 4 (visual coordination)
```