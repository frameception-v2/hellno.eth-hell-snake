"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import sdk, {
  AddFrame,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import "./modals.css";

import { config } from "~/components/providers/WagmiProvider";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, optimism } from "wagmi/chains";
import { useSession } from "next-auth/react";
import { createStore } from "mipd";
import { Label } from "~/components/ui/label";
import { PROJECT_TITLE } from "~/lib/constants";
import { checkCollision } from "~/lib/physics";
import { getNewFoodPosition } from "~/lib/food";

const CANVAS_SIZE = 300; // 300px for 20x20 grid (15px per cell)

function GameCanvas({ canvasRef, canvasSize }: { canvasRef: React.RefObject<HTMLCanvasElement>, canvasSize: number }) {
  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      style={{
        touchAction: "manipulation",
        imageRendering: "crisp-edges",
        border: "2px solid #c026d3",
        borderRadius: "8px",
        backgroundColor: "#1f1f1f",
      }}
    />
  );
}

export default function Frame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const inputQueueRef = useRef<Array<{x: number, y: number}>>([]);
  const [directionState, setDirectionState] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState(300); // Dynamic canvas size
  const [isMobile, setIsMobile] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Mobile detection
  useEffect(() => {
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));
  }, []);

  // Viewport resize handler with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newSize = Math.min(300, window.innerWidth - 32); // 32px padding
        setCanvasSize(newSize);
      }, 250);
    };

    // Initial call to set size
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [canvasSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Direction control handler with queueing
  const handleDirectionChange = (x: number, y: number) => {
    const lastInput = inputQueueRef.current[inputQueueRef.current.length - 1] || {x: 0, y: 0};
    
    // Prevent 180-degree turns and duplicate inputs
    if ((x !== 0 && x === -lastInput.x) || (y !== 0 && y === -lastInput.y)) return;
    if (lastInput.x === x && lastInput.y === y) return;
    
    inputQueueRef.current.push({x, y});
    setDirectionState({x, y});
  };

  const [added, setAdded] = useState(false);

  const [addFrameResult, setAddFrameResult] = useState("");

  const addFrame = useCallback(async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (!context) {
        return;
      }

      setContext(context);
      setAdded(context.client.added);

      // If frame isn't already added, prompt user to add it
      if (!context.client.added) {
        addFrame();
      }

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setAdded(true);
      });

      sdk.on("frameAddRejected", ({ reason }) => {
        console.log("frameAddRejected", reason);
      });

      sdk.on("frameRemoved", () => {
        console.log("frameRemoved");
        setAdded(false);
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        console.log("notificationsEnabled", notificationDetails);
      });
      sdk.on("notificationsDisabled", () => {
        console.log("notificationsDisabled");
      });

      sdk.on("primaryButtonClicked", () => {
        console.log("primaryButtonClicked");
      });

      console.log("Calling ready");
      sdk.actions.ready({});

      // Set up a MIPD Store, and request Providers.
      const store = createStore();

      // Subscribe to the MIPD Store.
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails);
        // => [EIP6963ProviderDetail, EIP6963ProviderDetail, ...]
      });
    };
    if (sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded, addFrame]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'victory' | 'defeat'>('playing');
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [score, setScore] = useState(0);

  const resetGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    // Generate valid initial food position
    setFood(getNewFoodPosition([{x: 10, y: 10}], {x: -1, y: -1}));
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;
    let animationFrameId: number;
    const cellSize = canvasSize / 20;
    let snake = [{x: 10, y: 10}];
    let food = { x: 15, y: 15 };

    // Game loop
    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      
      // Update at 10fps for classic snake feel
      if (deltaTime > 100) {
        lastTime = timestamp;
        
        // Only update if playing
        if (gameState === 'playing') {
          // Process input queue
          const nextDirection = inputQueueRef.current.shift() || {x: 0, y: 0};
          
          // Update snake position
          const newHead = {
            x: snake[0].x + nextDirection.x,
            y: snake[0].y + nextDirection.y
          };

          // Collision detection
          if (checkCollision([newHead, ...snake], 20)) {
            setGameState('defeat');
          }

          // Food consumption
          if (newHead.x === food.x && newHead.y === food.y) {
            // Grow snake and spawn new food
            snake = [newHead, ...snake];
            setScore(prev => prev + 1);
            food = getNewFoodPosition(snake, food);
            setFood(food);
            
            if (score >= 9) { // Win condition
              setGameState('victory');
            }
          } else {
            snake = [newHead, ...snake.slice(0, -1)];
          }
        }
      }

      // Clear canvas
      ctx.fillStyle = '#1f1f1f';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw grid
      ctx.strokeStyle = '#333';
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize + 0.5, 0);
        ctx.lineTo(i * cellSize + 0.5, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize + 0.5);
        ctx.lineTo(CANVAS_SIZE, i * cellSize + 0.5);
        ctx.stroke();
      }

      // Draw snake
      ctx.fillStyle = '#c026d3';
      snake.forEach(segment => {
        ctx.fillRect(
          segment.x * cellSize + 1,
          segment.y * cellSize + 1,
          cellSize - 2,
          cellSize - 2
        );
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Touch controls
    let touchStartX = 0;
    let touchStartY = 0;
    
    const MIN_SWIPE_DISTANCE = 0.05 * canvasSize; // 5% of canvas size
    let isTouchActive = false;

    const handleTouchStart = (e: TouchEvent) => {
      isTouchActive = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      
      if (gameState !== 'playing') {
        resetGame();
        inputQueueRef.current = []; // Clear input queue on restart
      }
      
      canvas.style.borderColor = '#ef4444'; // Visual feedback
      e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouchActive) return;
      
      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      // Only register swipes that exceed minimum distance
      if (Math.abs(dx) > MIN_SWIPE_DISTANCE || Math.abs(dy) > MIN_SWIPE_DISTANCE) {
        if (Math.abs(dx) > Math.abs(dy)) {
          inputQueueRef.current.push({x: Math.sign(dx), y: 0});
        } else {
          inputQueueRef.current.push({x: 0, y: Math.sign(dy)});
        }
        // Reset start position after valid swipe
        touchStartX = touchEndX;
        touchStartY = touchEndY;
      }
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      isTouchActive = false;
      canvas.style.borderColor = '#c026d3'; // Reset visual feedback
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);
    
    // Start game loop
    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameState, resetGame, score]); // Added missing dependencies
  
  // Score animation effect
  useEffect(() => {
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
      scoreElement.classList.add('score-bounce');
      setTimeout(() => scoreElement.classList.remove('score-bounce'), 200);
    }
  }, [score]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      {/* Animated score display */}
      <div 
        id="score-display"
        className="absolute top-4 right-4 text-2xl font-bold 
                 text-purple-500 transition-transform duration-200"
      >
        Score: {score}
      </div>
      
      {gameState !== 'playing' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-message">
              {gameState === 'victory' ? '🎉 You Won!' : '💥 Game Over!'}
            </p>
            <p className="modal-instruction">Swipe to restart</p>
          </div>
        </div>
      )}
      {/* Farcaster Frame v2 Meta Tags */}
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/api/opengraph-image`} />
      <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/api/opengraph-image`} />
      <meta property="fc:frame:post_url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/api/frame`} />
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-700 dark:text-gray-300">
          {PROJECT_TITLE}
        </h1>
        <div className="crt-effect">
          <GameCanvas canvasRef={canvasRef} canvasSize={canvasSize} />
          {/* Mobile controls toggle */}
          {isMobile && (
            <button
              className="w-full py-3 mb-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-lg transition-colors touch-manipulation"
              onClick={() => setShowControls(!showControls)}
              onTouchStart={(e) => {
                e.preventDefault();
                setShowControls(!showControls);
              }}
            >
              {showControls ? 'Hide Controls' : 'Show Controls'}
            </button>
          )}

          {/* Directional controls */}
          {(showControls || !isMobile) && (
            <div className="mt-4 grid grid-cols-3 gap-2 select-none touch-manipulation">
              <button
                className="control-btn bg-purple-500 hover:bg-purple-600 active:bg-purple-700 h-16 text-2xl"
                onClick={() => handleDirectionChange(0, -1)}
                onTouchStart={() => handleDirectionChange(0, -1)}
              >
                ↑
              </button>
            <button
              className="control-btn bg-purple-500 hover:bg-purple-600 active:bg-purple-700"
              onClick={() => handleDirectionChange(-1, 0)}
              onTouchStart={() => handleDirectionChange(-1, 0)}
            >
              ←
            </button>
            <button
              className="control-btn bg-purple-500 hover:bg-purple-600 active:bg-purple-700"
              onClick={() => handleDirectionChange(1, 0)}
              onTouchStart={() => handleDirectionChange(1, 0)}
            >
              →
            </button>
            <button
              className="control-btn bg-purple-500 hover:bg-purple-600 active:bg-purple-700 col-start-2"
              onClick={() => handleDirectionChange(0, 1)}
              onTouchStart={() => handleDirectionChange(0, 1)}
            >
              ↓
            </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
