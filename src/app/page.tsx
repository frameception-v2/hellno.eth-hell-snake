import { Metadata } from "next";
import App from "./app";
import { PROJECT_TITLE, PROJECT_DESCRIPTION } from "~/lib/constants";

const appUrl =
  process.env.NEXT_PUBLIC_URL ||
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

const frame = {
  version: "vNext",
  image: `${appUrl}/opengraph-image`,
  postUrl: `${appUrl}/api/frame`,
  buttons: [
    {
      label: "Play",
      action: "post",
    },
    {
      label: "Restart",
      action: "post",
    }
  ],
  state: {
    score: 0,
    highScore: 0,
    gameState: "playing",
    snakeLength: 1,
  },
  inputText: "Move with buttons or swipe!",
  refreshPeriod: 60,
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: PROJECT_TITLE,
    openGraph: {
      title: PROJECT_TITLE,
      description: PROJECT_DESCRIPTION,
    },
    other: {
      "fc:frame": frame.version,
      "fc:frame:image": frame.image,
      "fc:frame:post_url": frame.postUrl,
      "fc:frame:button:1": frame.buttons[0].label,
      "fc:frame:button:1:action": frame.buttons[0].action,
      "fc:frame:button:2": frame.buttons[1].label,
      "fc:frame:button:2:action": frame.buttons[1].action,
      "fc:frame:state": JSON.stringify(frame.state),
      "fc:frame:input:text": frame.inputText,
      "fc:frame:refresh_period": frame.refreshPeriod.toString(),
    },
  };
}

export default function Home() {
  return <App />;
}
