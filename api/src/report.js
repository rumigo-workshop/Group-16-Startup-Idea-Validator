function scoreFor(idea) {
  let hash = 0;
  for (const char of idea) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return 40 + (hash % 56);
}

export function buildReport(idea) {
  const score = scoreFor(idea);
  const short = idea.length > 80 ? `${idea.slice(0, 77)}...` : idea;

  return {
    idea,
    competitors: [
      `Established tools already serving people who want ${short}`,
      "A general-purpose incumbent that could add this as a feature",
      "A smaller specialist with a similar buyer",
    ],
    market: {
      tam: `People who would pay to solve the problem behind "${short}"`,
      sam: "Teams that already budget for this kind of tool",
      som: "Early adopters reachable in the first year",
    },
    complaints: [
      "Current options are too generic",
      "Setup takes too long",
      "Pricing is unclear",
    ],
    trends: [
      "Buyers compare more options before they commit",
      "Narrow tools beat broad platforms for a first version",
    ],
    risks: [
      "The idea may be a feature, not a company",
      "Reaching the first customers may cost more than the score suggests",
    ],
    score,
    reasons: [
      `Score ${score} is derived only from the idea text, so the same text always returns the same score.`,
      score >= 70
        ? "The wording is specific enough to name a buyer and a problem."
        : "The wording is still broad, so the score stays moderate.",
    ],
  };
}
