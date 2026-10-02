import { usePoker } from "./live";
import { ShareToStage } from "./ShareToStage";
import { CARDS, computeStats, formatNumber, type Card } from "./stats";

export function App() {
  const { poker, error } = usePoker();

  if (error) return <main className="status">Couldn't join the session: {error}</main>;
  if (!poker) return <main className="status">Joining…</main>;

  const { round, participants, myVote } = poker;
  const voted = participants.filter((p) => p.vote !== null);
  const stats = round.revealed ? computeStats(voted.map((p) => p.vote!)) : null;

  return (
    <main className="app">
      <header>
        <h1>Sprint Poker</h1>
        <span className="muted">
          Round {round.round} · {voted.length}/{participants.length} voted
        </span>
      </header>

      <section className="cards" aria-label="Your vote">
        {CARDS.map((card) => (
          <button
            key={card}
            className={card === myVote ? "card selected" : "card"}
            aria-pressed={card === myVote}
            onClick={() => poker.vote(card === myVote ? null : card)}
          >
            {card}
          </button>
        ))}
      </section>

      <section className="actions">
        {round.revealed ? (
          <button onClick={poker.newRound}>New round</button>
        ) : (
          <button onClick={poker.reveal} disabled={voted.length === 0}>
            Show votes
          </button>
        )}
        <ShareToStage />
      </section>

      {round.revealed && (
        <section className="stats" aria-label="Results">
          {stats ? (
            <>
              <Stat label="Mean" value={formatNumber(stats.mean)} />
              <Stat label="Mode" value={stats.modes.join(", ")} />
            </>
          ) : (
            <p className="muted">No numeric votes.</p>
          )}
        </section>
      )}

      <ul className="people">
        {participants.map((p) => (
          <li key={p.userId}>
            <span>
              {p.name}
              {p.isMe && <span className="muted"> (you)</span>}
            </span>
            <VoteChip vote={p.vote} revealed={round.revealed} />
          </li>
        ))}
      </ul>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function VoteChip({ vote, revealed }: { vote: Card | null; revealed: boolean }) {
  if (vote === null) return <span className="chip empty">–</span>;
  if (!revealed) return <span className="chip hidden" aria-label="Voted">✓</span>;
  return <span className="chip">{vote}</span>;
}
