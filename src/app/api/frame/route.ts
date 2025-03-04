import { NextResponse } from 'next/server';
import { PROJECT_TITLE } from '~/lib/constants';

export async function POST(request: Request) {
  const body = await request.json();
  const state = JSON.parse(body.untrustedData.state || "{}");
  
  // Update game state based on button index
  const buttonIndex = body.untrustedData.buttonIndex;
  let newState = { ...state };
  
  if (buttonIndex === 1) {
    // Handle Play button
    newState.gameState = "playing";
  } else if (buttonIndex === 2) {
    // Handle Restart button
    newState = {
      score: 0,
      highScore: state.highScore,
      gameState: "playing",
      snakeLength: 1
    };
  }

  return new NextResponse(
    `<html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_URL}/opengraph-image?state=${encodeURIComponent(JSON.stringify(newState))}" />
        <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_URL}/api/frame" />
        <meta property="fc:frame:button:1" content="Play" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:2" content="Restart" />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:state" content="${encodeURIComponent(JSON.stringify(newState))}" />
      </head>
    </html>`,
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}
