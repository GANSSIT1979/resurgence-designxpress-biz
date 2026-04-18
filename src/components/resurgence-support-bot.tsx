'use client';

import { SupportChatWidget } from "@/components/support-chat-widget";

export function ResurgenceSupportBot() {
  return <SupportChatWidget />;
  /*
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const response = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: getOrCreateVisitorId() }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to start support chat.');
        }

        return data.client_secret;
      },
    },
    options: {
      theme: {
        colorScheme: 'dark',
        color: {
          accent: {
            primary: '#4dc0ff',
            level: 2,
          },
        },
        radius: 'round',
        density: 'compact',
        typography: {
          fontFamily: 'Arial, Helvetica, sans-serif',
        },
      },
      composer: {
        placeholder: 'Ask about sponsorships, events, uniforms, or partnerships…',
      },
      startScreen: {
        greeting: 'Welcome to RESURGENCE support.',
      },
    },
  });

  return (
    <>
      <Script
        src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
        strategy="afterInteractive"
      />

      <div className="card" style={{ padding: 16 }}>
        <div className="section-kicker">AI Customer Service</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Talk to the RESURGENCE assistant.</h2>
        <p className="helper" style={{ marginTop: 0, marginBottom: 18 }}>
          Get quick answers about sponsor packages, creator partnerships, event support, and custom apparel.
        </p>

        <ChatKit control={control} className="resurgence-chatkit" />
      </div>
    </>
  );
  */
}
