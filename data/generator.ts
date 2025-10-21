export const questCategories = ["day", "night", "creative", "social", "home"] as const;
export type QuestCategory = (typeof questCategories)[number];

export const questDifficulties = ["easy", "medium", "hard"] as const;
export type QuestDifficulty = (typeof questDifficulties)[number];

export type SlotKey = "action" | "place" | "object" | "manner";

export interface SlotFragment {
  id: string;
  text: string;
  categories: QuestCategory[];
  difficulties: QuestDifficulty[];
  weight?: number;
}

const allDifficulties: QuestDifficulty[] = ["easy", "medium", "hard"];

export const fragments: Record<SlotKey, SlotFragment[]> = {
  action: [
    {
      id: "action-story",
      text: "Придумай мини-историю",
      categories: ["day", "creative", "social"],
      difficulties: ["easy", "medium"],
      weight: 3,
    },
    {
      id: "action-photo",
      text: "Собери мини-фото-серию",
      categories: ["day", "night", "creative"],
      difficulties: ["easy", "medium"],
      weight: 2,
    },
    {
      id: "action-note",
      text: "Запиши короткую заметку",
      categories: ["day", "night", "home"],
      difficulties: allDifficulties,
      weight: 3,
    },
    {
      id: "action-sketch",
      text: "Сделай экспресс-скетч",
      categories: ["creative", "home"],
      difficulties: ["easy", "medium"],
      weight: 2,
    },
    {
      id: "action-question",
      text: "Задай вопрос и зафиксируй ответ",
      categories: ["social"],
      difficulties: ["medium", "hard"],
      weight: 2,
    },
  ],

  place: [
    {
      id: "place-street",
      text: "на оживлённой улице",
      categories: ["day", "social"],
      difficulties: allDifficulties,
      weight: 3,
    },
    {
      id: "place-park",
      text: "в ближайшем парке",
      categories: ["day", "creative"],
      difficulties: ["easy", "medium"],
      weight: 3,
    },
    {
      id: "place-neon",
      text: "у витрины с огнями",
      categories: ["night", "creative"],
      difficulties: ["easy", "medium"],
      weight: 2,
    },
    {
      id: "place-window",
      text: "у окна дома",
      categories: ["home"],
      difficulties: allDifficulties,
      weight: 2,
    },
    {
      id: "place-balcony",
      text: "на балконе или кухне",
      categories: ["home", "creative"],
      difficulties: ["easy"],
      weight: 1,
    },
  ],

  object: [
    {
      id: "object-passersby",
      text: "про первого прохожего, которого заметишь",
      categories: ["day", "social"],
      difficulties: ["easy", "medium"],
      weight: 2,
    },
    {
      id: "object-colors",
      text: "о трёх цветах вокруг",
      categories: ["day", "creative", "home"],
      difficulties: allDifficulties,
      weight: 3,
    },
    {
      id: "object-sound",
      text: "про звук, который услышишь",
      categories: ["night", "home", "creative"],
      difficulties: ["easy", "medium"],
      weight: 2,
    },
    {
      id: "object-item",
      text: "о предмете, который возьмёшь в руки",
      categories: ["creative", "home"],
      difficulties: allDifficulties,
      weight: 3,
    },
    {
      id: "object-dialog",
      text: "про человека, с которым поговоришь",
      categories: ["social"],
      difficulties: ["medium", "hard"],
      weight: 2,
    },
  ],

  manner: [
    {
      id: "manner-share",
      text: "и поделись итогом с другом",
      categories: ["social", "day", "home"],
      difficulties: ["easy", "medium"],
      weight: 3,
    },
    {
      id: "manner-audio",
      text: "и запиши голосовое для себя",
      categories: ["night", "creative"],
      difficulties: ["medium"],
      weight: 2,
    },
    {
      id: "manner-photo",
      text: "и сохрани фото в коллекции",
      categories: ["day", "creative"],
      difficulties: ["easy", "medium"],
      weight: 3,
    },
    {
      id: "manner-journal",
      text: "и занеси мысль в дневник",
      categories: ["home", "night"],
      difficulties: allDifficulties,
      weight: 2,
    },
    {
      id: "manner-story",
      text: "и выложи короткую сторис",
      categories: ["social", "creative"],
      difficulties: ["medium", "hard"],
      weight: 1,
    },
  ],
};
