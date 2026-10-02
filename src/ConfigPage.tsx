import { useEffect, useState } from "react";
import { app, pages } from "@microsoft/teams-js";
import { appUrl } from "./appUrl";

/** Shown once when the app is added to a meeting; Teams requires it for meeting tabs. */
export function ConfigPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    app.initialize().then(() => {
      pages.config.registerOnSaveHandler((saveEvent) => {
        pages.config
          .setConfig({
            contentUrl: appUrl,
            suggestedDisplayName: "Sprint Poker",
          })
          .then(() => saveEvent.notifySuccess(), (e) => saveEvent.notifyFailure(String(e)));
      });
      pages.config.setValidityState(true);
      setReady(true);
    });
  }, []);

  return (
    <main className="config">
      <h1>Sprint Poker</h1>
      <p>{ready ? "Click Save to add Sprint Poker to this meeting." : "Loading…"}</p>
    </main>
  );
}
