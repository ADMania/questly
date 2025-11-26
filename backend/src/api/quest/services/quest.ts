import crypto from "node:crypto";
import { factories } from "@strapi/strapi";

type SlotKey = "action" | "place" | "object";
type QuestCategory = string;
type QuestDifficulty = string;

interface CategoryAttributes {
  name?: string | null;
  slug?: string | null;
}

interface DifficultyAttributes {
  level?: string | null;
  slug?: string | null;
}

interface FragmentAttributes {
  code?: string | null;
  text?: string | null;
  slot?: SlotKey | null;
  weight?: number | null;
  categories?: unknown[];
  difficulties?: unknown[];
}

interface QuestSourceData {
  categories: QuestCategory[];
  difficulties: QuestDifficulty[];
  fragments: Record<SlotKey, NormalisedFragment[]>;
}

interface NormalisedFragment {
  id: string;
  text: string;
  categories: QuestCategory[];
  difficulties: QuestDifficulty[];
  weight: number;
}

interface GeneratedQuest {
  quest: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  fragments: string[];
  templateId: string;
  symbolSeed: string;
}

interface GenerateOptions {
  category?: string;
  difficulty?: string;
}

interface StrapiLike {
  entityService: {
    findMany: (uid: string, options: Record<string, unknown>) => Promise<unknown[]>;
  };
  log?: {
    error?: (message: string, error?: unknown) => void;
    warn?: (message: string) => void;
    info?: (message: string) => void;
  };
}

const SLOTS: SlotKey[] = ["action", "place", "object"];
const TEMPLATE_ID = "single-line-v1";
const PAGE_SIZE = 200;

function readValue(entry: unknown, key: string): unknown {
  if (!entry || typeof entry !== "object") return undefined;
  const record = entry as Record<string, unknown>;

  if (record[key] !== undefined) return record[key];

  const attributes = record.attributes;
  if (attributes && typeof attributes === "object") {
    const value = (attributes as Record<string, unknown>)[key];
    if (value !== undefined) return value;
  }

  const document = record.document;
  if (document && typeof document === "object") {
    const value = (document as Record<string, unknown>)[key];
    if (value !== undefined) return value;
  }

  return undefined;
}

function readRelationArray(entry: unknown, key: string): unknown[] {
  const relation = readValue(entry, key);
  if (Array.isArray(relation)) return relation;
  if (relation && typeof relation === "object") {
    const record = relation as Record<string, unknown>;
    if (Array.isArray(record.results)) return record.results as unknown[];
    if (Array.isArray(record.data)) return record.data as unknown[];
  }
  return [];
}

function extractList<T>(input: unknown): T[] {
  if (!input) return [];
  if (typeof input === "object" && "data" in (input as Record<string, unknown>)) {
    input = (input as { data: unknown[] }).data;
  }
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === "object") {
    const record = input as Record<string, unknown>;
    if (Array.isArray(record.results)) return record.results as T[];
    if (Array.isArray(record.data)) return record.data as T[];
  }
  return [];
}

function describeValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `array[len=${value.length}]`;
  }
  if (value && typeof value === "object") {
    return `object(keys=${Object.keys(value).join(",")})`;
  }
  return typeof value;
}

function typedLog(strapi: StrapiLike, message: string, payload: string) {
  strapi.log?.info?.(`${message}: ${payload}`);
}

function normaliseCategoryAttributes(entry: unknown): CategoryAttributes | undefined {
  const slug = readValue(entry, "slug");
  const name = readValue(entry, "name");
  if (typeof slug === "string" || typeof name === "string") {
    return {
      slug: typeof slug === "string" ? slug : undefined,
      name: typeof name === "string" ? name : undefined,
    };
  }
  return undefined;
}

function normaliseDifficultyAttributes(entry: unknown): DifficultyAttributes | undefined {
  const slug = readValue(entry, "slug");
  const level = readValue(entry, "level");
  if (typeof slug === "string" || typeof level === "string") {
    return {
      slug: typeof slug === "string" ? slug : undefined,
      level: typeof level === "string" ? level : undefined,
    };
  }
  return undefined;
}

function normaliseFragmentAttributes(entry: unknown): FragmentAttributes | undefined {
  const code = readValue(entry, "code");
  const text = readValue(entry, "text");
  const slot = readValue(entry, "slot");
  const weight = readValue(entry, "weight");
  const categories = readRelationArray(entry, "categories");
  const difficulties = readRelationArray(entry, "difficulties");

  return {
    code: typeof code === "string" ? code : undefined,
    text: typeof text === "string" ? text : undefined,
    slot: typeof slot === "string" && (SLOTS as readonly string[]).includes(slot) ? (slot as SlotKey) : undefined,
    weight: typeof weight === "number" ? weight : undefined,
    categories,
    difficulties,
  };
}

function normaliseCategory(attr: CategoryAttributes | undefined): QuestCategory | undefined {
  const value = attr?.slug ?? attr?.name ?? "";
  const normalised = value.trim().toLowerCase();
  return normalised || undefined;
}

function normaliseDifficulty(attr: DifficultyAttributes | undefined): QuestDifficulty | undefined {
  const value = attr?.slug ?? attr?.level ?? "";
  const normalised = value.trim().toLowerCase();
  return normalised || undefined;
}

function pickFromArray<T>(values: readonly T[]): T {
  if (values.length === 0) {
    throw new Error("Cannot select from an empty list.");
  }
  const index = Math.floor(Math.random() * values.length);
  return values[index];
}

function pickWeighted<T extends { weight: number }>(items: T[]): T {
  if (items.length === 0) {
    throw new Error("Cannot select from an empty collection.");
  }
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let threshold = Math.random() * total;
  for (const item of items) {
    threshold -= item.weight;
    if (threshold <= 0) {
      return item;
    }
  }
  return items[items.length - 1];
}

function generateSymbolSeed(fragments: string[]): string {
  if (fragments.length > 0) {
    const hash = crypto.createHash("sha256");
    hash.update(fragments.join("|"));
    hash.update(Date.now().toString(16));
    return hash.digest("hex").slice(0, 16);
  }
  return crypto.randomBytes(8).toString("hex");
}

function assembleSentence(parts: string[]): string {
  const sentence = parts.join(" ").replace(/\s+/g, " ").trim();
  if (!sentence) {
    throw new Error("Generated sentence is empty.");
  }
  return sentence.endsWith(".") ? sentence : `${sentence}.`;
}

function convertFragments(rawFragments: FragmentAttributes[]): Record<SlotKey, NormalisedFragment[]> {
  const fragments: Record<SlotKey, NormalisedFragment[]> = {
    action: [],
    place: [],
    object: [],
  };

  for (const fragment of rawFragments) {
    if (!fragment.code || !fragment.text || !fragment.slot) continue;

    const categories =
      fragment.categories
        ?.map((cat) => normaliseCategory(normaliseCategoryAttributes(cat)))
        .filter((value): value is QuestCategory => Boolean(value)) ?? [];

    const difficulties =
      fragment.difficulties
        ?.map((diff) => normaliseDifficulty(normaliseDifficultyAttributes(diff)))
        .filter((value): value is QuestDifficulty => Boolean(value)) ?? [];

    fragments[fragment.slot].push({
      id: fragment.code,
      text: fragment.text.trim(),
      categories,
      difficulties,
      weight: fragment.weight && fragment.weight > 0 ? fragment.weight : 1,
    });
  }

  return fragments;
}

function buildQuestData(
  strapi: StrapiLike,
  categories: CategoryAttributes[],
  difficulties: DifficultyAttributes[],
  fragments: FragmentAttributes[]
): QuestSourceData {
  const fragmentsBySlot = convertFragments(fragments);

  const categorySet = new Set<QuestCategory>(
    categories
      .map((category) => normaliseCategory(category))
      .filter((value): value is QuestCategory => Boolean(value))
  );

  const difficultySet = new Set<QuestDifficulty>(
    difficulties
      .map((difficulty) => normaliseDifficulty(difficulty))
      .filter((value): value is QuestDifficulty => Boolean(value))
  );

  for (const slot of SLOTS) {
    for (const fragment of fragmentsBySlot[slot]) {
      fragment.categories.forEach((category) => {
        if (!category) return;
        if (!categorySet.has(category)) {
          strapi.log?.warn?.(
            `[quests.generate] Category "${category}" used in fragment ${fragment.id} but missing in Category collection.`
          );
          categorySet.add(category);
        }
      });

      fragment.difficulties.forEach((difficulty) => {
        if (!difficulty) return;
        if (!difficultySet.has(difficulty)) {
          strapi.log?.warn?.(
            `[quests.generate] Difficulty "${difficulty}" used in fragment ${fragment.id} but missing in Difficulty collection.`
          );
          difficultySet.add(difficulty);
        }
      });
    }
  }

  if (categorySet.size === 0 || difficultySet.size === 0) {
    const counts = SLOTS.map((slot) => `${slot}:${fragmentsBySlot[slot].length}`).join(", ");
    strapi.log?.error?.(
      `[quests.generate] Validation failed: categories=${categorySet.size}, difficulties=${difficultySet.size}, ` +
      `inputCategories=${categories.length}, inputDifficulties=${difficulties.length}, fragments=${fragments.length}, perSlot={${counts}}`
    );
    throw new Error("Categories or difficulties collections are empty.");
  }

  return {
    categories: Array.from(categorySet),
    difficulties: Array.from(difficultySet),
    fragments: fragmentsBySlot,
  };
}

function ensureQuestData(data: QuestSourceData) {
  if (data.categories.length === 0 || data.difficulties.length === 0) {
    throw new Error("Content is missing categories or difficulties.");
  }

  for (const slot of SLOTS) {
    const fragments = data.fragments[slot];
    if (!fragments || fragments.length === 0) {
      throw new Error(`Content is missing fragments for slot "${slot}".`);
    }
  }
}

function generateQuest(data: QuestSourceData, options: GenerateOptions): GeneratedQuest {
  ensureQuestData(data);

  const selectedCategory =
    options.category && data.categories.includes(options.category)
      ? options.category
      : pickFromArray(data.categories);

  const selectedDifficulty =
    options.difficulty && data.difficulties.includes(options.difficulty)
      ? options.difficulty
      : pickFromArray(data.difficulties);

  const selectedFragments: string[] = [];
  const parts: string[] = [];

  // Determine which slots to use based on difficulty
  let activeSlots: SlotKey[] = ["action", "place", "object"];

  if (selectedDifficulty === "easy") {
    activeSlots = ["action"];
  } else if (selectedDifficulty === "medium") {
    // Medium: Action + (Place OR Object)
    activeSlots = Math.random() < 0.5 ? ["action", "place"] : ["action", "object"];
  }
  // Hard (or other): use all slots ["action", "place", "object"]

  for (const slot of activeSlots) {
    const candidates = data.fragments[slot].filter((fragment) => {
      const matchesCategory = fragment.categories.length === 0 || fragment.categories.includes(selectedCategory);
      const matchesDifficulty =
        fragment.difficulties.length === 0 || fragment.difficulties.includes(selectedDifficulty);
      return matchesCategory && matchesDifficulty;
    });

    const pool = candidates.length > 0 ? candidates : data.fragments[slot];
    if (pool.length === 0) {
      throw new Error(`No fragments available for slot "${slot}".`);
    }

    const fragment = pickWeighted(pool);
    selectedFragments.push(fragment.id);
    parts.push(fragment.text);
  }

  return {
    quest: assembleSentence(parts),
    category: selectedCategory,
    difficulty: selectedDifficulty,
    fragments: selectedFragments,
    templateId: TEMPLATE_ID,
    symbolSeed: generateSymbolSeed(selectedFragments),
  };
}

async function loadQuestData(strapi: StrapiLike): Promise<QuestSourceData> {
  const { entityService } = strapi;

  const [categories, difficulties, fragments] = await Promise.all([
    entityService.findMany("api::category.category", { populate: "*" }),
    entityService.findMany("api::difficulty.difficulty", { populate: "*" }),
    entityService.findMany("api::fragment.fragment", { populate: "*" }),
  ]);

  typedLog(strapi, "[quests.generate] categories response type", describeValue(categories));
  typedLog(strapi, "[quests.generate] difficulties response type", describeValue(difficulties));
  typedLog(strapi, "[quests.generate] fragments response type", describeValue(fragments));

  const rawCategories = extractList(categories);
  if (rawCategories.length === 0) {
    strapi.log?.warn?.("[quests.generate] entityService returned no categories.");
  }
  const normalisedCategories = rawCategories
    .map((entry) => normaliseCategoryAttributes(entry))
    .filter((value): value is CategoryAttributes => Boolean(value));

  const rawDifficulties = extractList(difficulties);
  if (rawDifficulties.length === 0) {
    strapi.log?.warn?.("[quests.generate] entityService returned no difficulties.");
  }
  const normalisedDifficulties = rawDifficulties
    .map((entry) => normaliseDifficultyAttributes(entry))
    .filter((value): value is DifficultyAttributes => Boolean(value));

  const rawFragments = extractList(fragments);
  if (rawFragments.length === 0) {
    strapi.log?.warn?.("[quests.generate] entityService returned no fragments.");
  }
  const normalisedFragments = rawFragments
    .map((entry) => normaliseFragmentAttributes(entry))
    .filter((value): value is FragmentAttributes => Boolean(value));

  return buildQuestData(strapi, normalisedCategories, normalisedDifficulties, normalisedFragments);
}

export default factories.createCoreService("api::quest.quest" as never, ({ strapi }) => {
  const typedStrapi = strapi as unknown as StrapiLike;

  return {
    async generate(options: GenerateOptions = {}): Promise<GeneratedQuest> {
      const data = await loadQuestData(typedStrapi);
      return generateQuest(data, options);
    },
  };
});
