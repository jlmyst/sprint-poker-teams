import { useEffect, useState } from "react";
import { app, FrameContexts, meeting } from "@microsoft/teams-js";
import { appUrl } from "./appUrl";
import { isLocal } from "./live";

/** In the meeting side panel, offers to put the board on the shared stage for everyone. */
export function ShareToStage() {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (isLocal) return;
    app.getContext().then((ctx) => {
      if (ctx.page.frameContext !== FrameContexts.sidePanel) return;
      meeting.getAppContentStageSharingCapabilities((err, caps) => {
        if (!err && caps?.doesAppHaveSharePermission) setCanShare(true);
      });
    });
  }, []);

  if (!canShare) return null;

  return (
    <button
      className="secondary"
      onClick={() =>
        meeting.shareAppContentToStage((err) => err && console.error(err), appUrl)
      }
    >
      Share to stage
    </button>
  );
}
