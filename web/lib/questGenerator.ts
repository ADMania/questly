import {
  fragments,
  questCategories,
  questDifficulties,
  type QuestCategory,
  type QuestDifficulty,
  type SlotFragment,
  type SlotKey,
} from "@/data/generator";

type WeightedItem = { weight?: number };

const slots: SlotKey[] = ["action", "place", "object", "manner"];

function pickFromArray<T>(values: readonly T[], rng: () => number): T {
  if (values.length === 0) throw new Error("Cannot pick from empty array");
  return values[Math.floor(rng() * values.length)];
}

function pickWeighted<T extends WeightedItem>(items: T[], rng: () => number): T {
  if (items.length === 0) throw new Error("Cannot pick from empty collection");
  const total = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  let threshold = rng() * total;
  for (const item of items) {
    threshold -= item.weight ?? 1;
    if (threshold <= 0) return item;
  }
  return items[items.length - 1];
}

function filterFragments(
  slot: SlotKey,
  category: QuestCategory,
  difficulty: QuestDifficulty
): SlotFragment[] {
  const list = fragments[slot];
  const strict = list.filter(
    (fragment) =>
      fragment.categories.includes(category) && fragment.difficulties.includes(difficulty)
  );
  if (strict.length > 0) return strict;

  const categoryOnly = list.filter((fragment) => fragment.categories.includes(category));
  if (categoryOnly.length > 0) return categoryOnly;

  return list;
}

export interface GenerateQuestOptions {
  category?: QuestCategory;
  difficulty?: QuestDifficulty;
  rng?: () => number;
}

export interface GeneratedQuest {
  quest: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  templateId: string;
  fragments: string[];
}

export function generateQuest({
  category,
  difficulty,
  rng = Math.random,
}: GenerateQuestOptions = {}): GeneratedQuest {
  const targetCategory =
    category && questCategories.includes(category)
      ? category
      : pickFromArray(questCategories, rng);

  const targetDifficulty =
    difficulty && questDifficulties.includes(difficulty)
      ? difficulty
      : pickFromArray(questDifficulties, rng);

  const selectedIds: string[] = [];
  const parts = slots.map((slot) => {
    const pool = filterFragments(slot, targetCategory, targetDifficulty);
    const fragment = pickWeighted(pool, rng);
    selectedIds.push(fragment.id);
    return fragment.text.trim();
  });

  const sentence = parts.join(" ").replace(/\s+/g, " ").trim();
  const quest = sentence.endsWith(".") ? sentence : `${sentence}.`;

  return {
    quest,
    category: targetCategory,
    difficulty: targetDifficulty,
    templateId: "single-line-v1",
    fragments: selectedIds,
  };
}

export { questCategories, questDifficulties };
