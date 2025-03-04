Here's the structured todo list following your requirements:

**Frame Structure**
- [x] Create base HTML frame with viewport meta tags (`index.html`)
- [x] Initialize Canvas element with 20x20 grid coordinate system (`game.js`)
- [x] Set up `requestAnimationFrame` game loop structure (`game.js`)
- [x] Implement Farcaster Frame v2 meta tags for compatibility (`index.html`)

**UI Components & Interactions**
- [x] Create CRT screen effect using CSS radial gradients (`styles.css`)
- [x] Build animated score display with DOM text node (`ui.js`)
- [x] Implement directional control buttons with hover states (`controls.css`)
- [x] Create victory/defeat modals with CSS transitions (`modals.css`)
- [x] Add touch event listeners for mobile controls (`input.js`)

**Client-Side State Management**
- [x] Build game state machine (playing/victory/defeat) (`state.js`)
- [x] Implement collision detection system (`physics.ts`)
- [ ] Create food spawning algorithm with position validation (`food.js`)
- [ ] Set up directional input queue system (`input.js`)

**Mobile Optimization**
- [ ] Implement viewport resize handler with debouncing (`responsive.js`)
- [ ] Add `touch-action: manipulation` CSS property (`mobile.css`)
- [ ] Create mobile control visibility toggle (`mobile.js`)
- [ ] Set minimum 60px touch target sizes (`controls.css`)
- [ ] Implement hardware-accelerated CSS transforms (`animations.css`)

Dependency Order:
1. Frame Structure → All other categories
2. Client-Side State Management → UI Components & API Integration
3. User Experience → Mobile Optimization
4. UI Components ↔ User Experience (visual coordination)

Key Frames v2 Features Utilized:
- Client-side image generation for OG assets
- Post message composition with game state
- Metadata for social sharing
- Mobile-optimized interaction model
- State persistence through frame navigation

Mobile-specific implementations are integrated at each layer with:
- Dedicated touch handlers
- Viewport unit calculations
- Dynamic control layouts
- Performance-conscious animations

No external APIs or persistent storage required - all functionality remains client-side within Frame capabilities.
