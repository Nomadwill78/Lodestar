/**
 * Meta renders the headline differently per placement, and each one has its
 * own effective length before truncation or before it's crowded out by the
 * creative. These are Meta's commonly published/cited guidelines, not hard
 * API limits — they're a target to write to, not a validation rule to
 * enforce.
 */

export type PlacementId = "feed" | "stories_reels" | "right_column";

export interface PlacementSpec {
  id: PlacementId;
  label: string;
  maxLength: number;
  helper: string;
}

export const PLACEMENTS: PlacementSpec[] = [
  {
    id: "feed",
    label: "Feed",
    maxLength: 40,
    helper: "Facebook & Instagram feed — headline truncates around 40 characters.",
  },
  {
    id: "stories_reels",
    label: "Stories / Reels",
    maxLength: 25,
    helper: "Full-screen, competing with the creative — keep it a glance, not a sentence.",
  },
  {
    id: "right_column",
    label: "Right column",
    maxLength: 27,
    helper: "Desktop-only, small thumbnail — the tightest space of the three.",
  },
];

export function placementSpec(id: PlacementId): PlacementSpec {
  return PLACEMENTS.find((p) => p.id === id) ?? PLACEMENTS[0];
}
