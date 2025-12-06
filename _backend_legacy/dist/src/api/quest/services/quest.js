"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = __importDefault(require("node:crypto"));
const strapi_1 = require("@strapi/strapi");
const SLOTS = ["action", "place", "object"];
const TEMPLATE_ID = "single-line-v1";
const PAGE_SIZE = 200;
function readValue(entry, key) {
    if (!entry || typeof entry !== "object")
        return undefined;
    const record = entry;
    if (record[key] !== undefined)
        return record[key];
    const attributes = record.attributes;
    if (attributes && typeof attributes === "object") {
        const value = attributes[key];
        if (value !== undefined)
            return value;
    }
    const document = record.document;
    if (document && typeof document === "object") {
        const value = document[key];
        if (value !== undefined)
            return value;
    }
    return undefined;
}
function readRelationArray(entry, key) {
    const relation = readValue(entry, key);
    if (Array.isArray(relation))
        return relation;
    if (relation && typeof relation === "object") {
        const record = relation;
        if (Array.isArray(record.results))
            return record.results;
        if (Array.isArray(record.data))
            return record.data;
    }
    return [];
}
function extractList(input) {
    if (!input)
        return [];
    if (typeof input === "object" && "data" in input) {
        input = input.data;
    }
    if (Array.isArray(input))
        return input;
    if (input && typeof input === "object") {
        const record = input;
        if (Array.isArray(record.results))
            return record.results;
        if (Array.isArray(record.data))
            return record.data;
    }
    return [];
}
function describeValue(value) {
    if (Array.isArray(value)) {
        return `array[len=${value.length}]`;
    }
    if (value && typeof value === "object") {
        return `object(keys=${Object.keys(value).join(",")})`;
    }
    return typeof value;
}
function typedLog(strapi, message, payload) {
    var _a, _b;
    (_b = (_a = strapi.log) === null || _a === void 0 ? void 0 : _a.info) === null || _b === void 0 ? void 0 : _b.call(_a, `${message}: ${payload}`);
}
function normaliseCategoryAttributes(entry) {
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
function normaliseDifficultyAttributes(entry) {
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
function normaliseFragmentAttributes(entry) {
    const code = readValue(entry, "code");
    const text = readValue(entry, "text");
    const slot = readValue(entry, "slot");
    const weight = readValue(entry, "weight");
    const categories = readRelationArray(entry, "categories");
    const difficulties = readRelationArray(entry, "difficulties");
    return {
        code: typeof code === "string" ? code : undefined,
        text: typeof text === "string" ? text : undefined,
        slot: typeof slot === "string" && SLOTS.includes(slot) ? slot : undefined,
        weight: typeof weight === "number" ? weight : undefined,
        categories,
        difficulties,
    };
}
function normaliseCategory(attr) {
    var _a, _b;
    const value = (_b = (_a = attr === null || attr === void 0 ? void 0 : attr.slug) !== null && _a !== void 0 ? _a : attr === null || attr === void 0 ? void 0 : attr.name) !== null && _b !== void 0 ? _b : "";
    const normalised = value.trim().toLowerCase();
    return normalised || undefined;
}
function normaliseDifficulty(attr) {
    var _a, _b;
    const value = (_b = (_a = attr === null || attr === void 0 ? void 0 : attr.slug) !== null && _a !== void 0 ? _a : attr === null || attr === void 0 ? void 0 : attr.level) !== null && _b !== void 0 ? _b : "";
    const normalised = value.trim().toLowerCase();
    return normalised || undefined;
}
function pickFromArray(values) {
    if (values.length === 0) {
        throw new Error("Cannot select from an empty list.");
    }
    const index = Math.floor(Math.random() * values.length);
    return values[index];
}
function pickWeighted(items) {
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
function generateSymbolSeed(fragments) {
    if (fragments.length > 0) {
        const hash = node_crypto_1.default.createHash("sha256");
        hash.update(fragments.join("|"));
        hash.update(Date.now().toString(16));
        return hash.digest("hex").slice(0, 16);
    }
    return node_crypto_1.default.randomBytes(8).toString("hex");
}
function assembleSentence(parts) {
    const sentence = parts.join(" ").replace(/\s+/g, " ").trim();
    if (!sentence) {
        throw new Error("Generated sentence is empty.");
    }
    return sentence.endsWith(".") ? sentence : `${sentence}.`;
}
function convertFragments(rawFragments) {
    var _a, _b, _c, _d;
    const fragments = {
        action: [],
        place: [],
        object: [],
    };
    for (const fragment of rawFragments) {
        if (!fragment.code || !fragment.text || !fragment.slot)
            continue;
        const categories = (_b = (_a = fragment.categories) === null || _a === void 0 ? void 0 : _a.map((cat) => normaliseCategory(normaliseCategoryAttributes(cat))).filter((value) => Boolean(value))) !== null && _b !== void 0 ? _b : [];
        const difficulties = (_d = (_c = fragment.difficulties) === null || _c === void 0 ? void 0 : _c.map((diff) => normaliseDifficulty(normaliseDifficultyAttributes(diff))).filter((value) => Boolean(value))) !== null && _d !== void 0 ? _d : [];
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
function buildQuestData(strapi, categories, difficulties, fragments) {
    var _a, _b;
    const fragmentsBySlot = convertFragments(fragments);
    const categorySet = new Set(categories
        .map((category) => normaliseCategory(category))
        .filter((value) => Boolean(value)));
    const difficultySet = new Set(difficulties
        .map((difficulty) => normaliseDifficulty(difficulty))
        .filter((value) => Boolean(value)));
    for (const slot of SLOTS) {
        for (const fragment of fragmentsBySlot[slot]) {
            fragment.categories.forEach((category) => {
                var _a, _b;
                if (!category)
                    return;
                if (!categorySet.has(category)) {
                    (_b = (_a = strapi.log) === null || _a === void 0 ? void 0 : _a.warn) === null || _b === void 0 ? void 0 : _b.call(_a, `[quests.generate] Category "${category}" used in fragment ${fragment.id} but missing in Category collection.`);
                    categorySet.add(category);
                }
            });
            fragment.difficulties.forEach((difficulty) => {
                var _a, _b;
                if (!difficulty)
                    return;
                if (!difficultySet.has(difficulty)) {
                    (_b = (_a = strapi.log) === null || _a === void 0 ? void 0 : _a.warn) === null || _b === void 0 ? void 0 : _b.call(_a, `[quests.generate] Difficulty "${difficulty}" used in fragment ${fragment.id} but missing in Difficulty collection.`);
                    difficultySet.add(difficulty);
                }
            });
        }
    }
    if (categorySet.size === 0 || difficultySet.size === 0) {
        const counts = SLOTS.map((slot) => `${slot}:${fragmentsBySlot[slot].length}`).join(", ");
        (_b = (_a = strapi.log) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, `[quests.generate] Validation failed: categories=${categorySet.size}, difficulties=${difficultySet.size}, ` +
            `inputCategories=${categories.length}, inputDifficulties=${difficulties.length}, fragments=${fragments.length}, perSlot={${counts}}`);
        throw new Error("Categories or difficulties collections are empty.");
    }
    return {
        categories: Array.from(categorySet),
        difficulties: Array.from(difficultySet),
        fragments: fragmentsBySlot,
    };
}
function ensureQuestData(data) {
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
function generateQuest(data, options) {
    ensureQuestData(data);
    const selectedCategory = options.category && data.categories.includes(options.category)
        ? options.category
        : pickFromArray(data.categories);
    const selectedDifficulty = options.difficulty && data.difficulties.includes(options.difficulty)
        ? options.difficulty
        : pickFromArray(data.difficulties);
    const selectedFragments = [];
    const parts = [];
    // Determine which slots to use based on difficulty
    let activeSlots = ["action", "place", "object"];
    if (selectedDifficulty === "easy") {
        activeSlots = ["action"];
    }
    else if (selectedDifficulty === "medium") {
        // Medium: Action + (Place OR Object)
        activeSlots = Math.random() < 0.5 ? ["action", "place"] : ["action", "object"];
    }
    // Hard (or other): use all slots ["action", "place", "object"]
    for (const slot of activeSlots) {
        const candidates = data.fragments[slot].filter((fragment) => {
            const matchesCategory = fragment.categories.length === 0 || fragment.categories.includes(selectedCategory);
            const matchesDifficulty = fragment.difficulties.length === 0 || fragment.difficulties.includes(selectedDifficulty);
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
async function loadQuestData(strapi) {
    var _a, _b, _c, _d, _e, _f;
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
        (_b = (_a = strapi.log) === null || _a === void 0 ? void 0 : _a.warn) === null || _b === void 0 ? void 0 : _b.call(_a, "[quests.generate] entityService returned no categories.");
    }
    const normalisedCategories = rawCategories
        .map((entry) => normaliseCategoryAttributes(entry))
        .filter((value) => Boolean(value));
    const rawDifficulties = extractList(difficulties);
    if (rawDifficulties.length === 0) {
        (_d = (_c = strapi.log) === null || _c === void 0 ? void 0 : _c.warn) === null || _d === void 0 ? void 0 : _d.call(_c, "[quests.generate] entityService returned no difficulties.");
    }
    const normalisedDifficulties = rawDifficulties
        .map((entry) => normaliseDifficultyAttributes(entry))
        .filter((value) => Boolean(value));
    const rawFragments = extractList(fragments);
    if (rawFragments.length === 0) {
        (_f = (_e = strapi.log) === null || _e === void 0 ? void 0 : _e.warn) === null || _f === void 0 ? void 0 : _f.call(_e, "[quests.generate] entityService returned no fragments.");
    }
    const normalisedFragments = rawFragments
        .map((entry) => normaliseFragmentAttributes(entry))
        .filter((value) => Boolean(value));
    return buildQuestData(strapi, normalisedCategories, normalisedDifficulties, normalisedFragments);
}
exports.default = strapi_1.factories.createCoreService("api::quest.quest", ({ strapi }) => {
    const typedStrapi = strapi;
    return {
        async generate(options = {}) {
            const data = await loadQuestData(typedStrapi);
            return generateQuest(data, options);
        },
    };
});
