import { useEffect, useState } from "react";
import { app, LiveShareHost } from "@microsoft/teams-js";
import {
  LivePresence,
  LiveShareClient,
  LiveState,
  PresenceState,
  TestLiveShareHost,
} from "@microsoft/live-share";
import type { Card } from "./stats";

/** Shared round state: bumping `round` invalidates every previous vote. */
export interface RoundState {
  round: number;
  revealed: boolean;
}

/** Each participant's own vote, published via presence (one entry per user). */
export interface VoteData {
  round: number;
  vote: Card | null;
}

export interface Participant {
  userId: string;
  name: string;
  isMe: boolean;
  vote: Card | null;
}

export interface Poker {
  round: RoundState;
  participants: Participant[];
  myVote: Card | null;
  vote: (card: Card | null) => void;
  reveal: () => void;
  newRound: () => void;
}

/** `?local=1` runs against a local Fluid service so it can be tested in browser tabs. */
export const isLocal = new URLSearchParams(location.search).has("local");

interface Session {
  roundState: LiveState<RoundState>;
  presence: LivePresence<VoteData>;
}

const schema = {
  initialObjects: {
    roundState: LiveState<RoundState>,
    presence: LivePresence<VoteData>,
  },
};

// Joined once per page load (React StrictMode mounts effects twice in dev).
let sessionPromise: Promise<Session> | undefined;

function joinSession(): Promise<Session> {
  sessionPromise ??= (async () => {
    let host;
    if (isLocal) {
      host = TestLiveShareHost.create();
    } else {
      await app.initialize();
      host = LiveShareHost.create();
    }
    const client = new LiveShareClient(host);
    const { container } = await client.joinContainer(schema);
    const roundState = container.initialObjects.roundState as LiveState<RoundState>;
    const presence = container.initialObjects.presence as LivePresence<VoteData>;
    await roundState.initialize({ round: 1, revealed: false });
    await presence.initialize({ round: 0, vote: null });
    return { roundState, presence };
  })();
  return sessionPromise;
}

function snapshot({ roundState, presence }: Session) {
  const round = roundState.state;
  const participants: Participant[] = presence
    .getUsers(PresenceState.online)
    .map((u) => ({
      userId: u.userId,
      name: u.displayName ?? "Unknown",
      isMe: u.isLocalUser,
      // A vote from an earlier round doesn't count.
      vote: u.data?.round === round.round ? u.data.vote : null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { round, participants };
}

export function usePoker(): { poker?: Poker; error?: string } {
  const [session, setSession] = useState<Session>();
  const [error, setError] = useState<string>();
  const [view, setView] = useState<ReturnType<typeof snapshot>>();

  useEffect(() => {
    let cancelled = false;
    joinSession().then(
      (s) => !cancelled && setSession(s),
      (e) => !cancelled && setError(String(e?.message ?? e)),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    const refresh = () => setView(snapshot(session));
    refresh();
    session.roundState.on("stateChanged", refresh);
    session.presence.on("presenceChanged", refresh);
    return () => {
      session.roundState.off("stateChanged", refresh);
      session.presence.off("presenceChanged", refresh);
    };
  }, [session]);

  if (error) return { error };
  if (!session || !view) return {};

  const { roundState, presence } = session;
  const { round, participants } = view;
  return {
    poker: {
      round,
      participants,
      myVote: participants.find((p) => p.isMe)?.vote ?? null,
      vote: (card) => void presence.update({ round: round.round, vote: card }),
      reveal: () => void roundState.set({ ...round, revealed: true }),
      newRound: () => void roundState.set({ round: round.round + 1, revealed: false }),
    },
  };
}
