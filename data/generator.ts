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
    {
      id: "action-video",
      text: "Сними короткое видео",
      categories: ["day", "night", "creative"],
      difficulties: ["easy", "medium"],
      weight: 2,
    },
    {
      id: "action-collect",
      text: "Собери маленькую коллекцию",
      categories: ["day", "creative", "home"],
      difficulties: ["easy"],
      weight: 2,
    },
    {
      id: "action-map",
      text: "Нарисуй мини‑карту места",
      categories: ["day", "creative"],
      difficulties: ["medium"],
      weight: 1,
    },
    {
      id: "action-compare",
      text: "Найди и сравни два объекта",
      categories: ["day", "creative", "home"],
      difficulties: ["medium"],
      weight: 2,
    },
    {
      id: "action-compliment",
      text: "Скажи комплимент незнакомцу",
      categories: ["social", "day"],
      difficulties: ["medium", "hard"],
      weight: 1,
    },
    {
      id: "action-cleanup",
      text: "Убери или отсортируй что‑то вокруг",
      categories: ["home"],
      difficulties: ["easy", "medium"],
      weight: 3,
    },
    {
      id: "action-trynew",
      text: "Попробуй сделать привычное иначе",
      categories: ["day", "night", "home"],
      difficulties: ["medium"],
      weight: 2,
    },
    {
      id: "action-count",
      text: "Посчитай десять находок",
      categories: ["day"],
      difficulties: ["easy"],
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
    {
      id: "place-cafe",
      text: "в кафе",
      categories: ["day", "social", "creative"],
      difficulties: ["easy", "medium"],
      weight: 3,
    },
    {
      id: "place-bridge",
      text: "на мосту",
      categories: ["day", "night", "creative"],
      difficulties: ["medium"],
      weight: 2,
    },
    {
      id: "place-store",
      text: "в магазине",
      categories: ["day", "social"],
      difficulties: ["easy"],
      weight: 3,
    },
    {
      id: "place-transport",
      text: "в общественном транспорте",
      categories: ["day", "social"],
      difficulties: ["medium"],
      weight: 2,
    },
    {
      id: "place-rooftop",
      text: "на крыше",
      categories: ["night", "creative"],
      difficulties: ["hard"],
      weight: 1,
    },
    {
      id: "place-kitchen",
      text: "на кухне",
      categories: ["home"],
      difficulties: allDifficulties,
      weight: 3,
    },
    {
      id: "place-bathroom",
      text: "в ванной",
      categories: ["home"],
      difficulties: ["easy", "medium"],
      weight: 2,
    },
    {
      id: "place-forest",
      text: "в сквере или лесополосе",
      categories: ["day", "creative"],
      difficulties: ["medium"],
      weight: 2,
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
    {
      id: "object-shadow",
      text: "с тенью",
      categories: ["day", "night", "creative"],
      difficulties: ["medium"],
      weight: 2,
    },
    {
      id: "object-reflection",
      text: "с отражением",
      categories: ["day", "night", "creative"],
      difficulties: ["easy", "medium"],
      weight: 3,
    },
    {
      id: "object-letter",
      text: "на выбранную букву",
      categories: ["day", "creative", "home"],
      difficulties: ["easy"],
      weight: 2,
    },
    {
      id: "object-circle",
      text: "круглой формы",
      categories: ["day", "creative", "home"],
      difficulties: ["easy", "medium"],
      weight: 2,
    },
    {
      id: "object-smell",
      text: "с ярким запахом",
      categories: ["day", "home"],
      difficulties: ["medium"],
      weight: 1,
    },
    {
      id: "object-habit",
      text: "твоя привычка",
      categories: ["home"],
      difficulties: ["easy"],
      weight: 2,
    },
    {
      id: "object-sign",
      text: "уличный знак",
      categories: ["day", "creative"],
      difficulties: ["easy", "medium"],
      weight: 2,
    },
    {
      id: "object-pet",
      text: "домашний питомец",
      categories: ["home", "social"],
      difficulties: ["easy"],
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
    {
      id: "manner-timer",
      text: "и уложись в 5 минут",
      categories: ["day", "night", "home"],
      difficulties: ["medium"],
      weight: 2,
    },
    {
      id: "manner-left-hand",
      text: "и сделай непривычной рукой",
      categories: ["creative", "home"],
      difficulties: ["medium"],
      weight: 1,
    },
    {
      id: "manner-minimal",
      text: "используя только 3 элемента",
      categories: ["creative"],
      difficulties: ["medium"],
      weight: 2,
    },
    {
      id: "manner-poem",
      text: "и оформи как короткое хоку",
      categories: ["creative"],
      difficulties: ["medium"],
      weight: 1,
    },
    {
      id: "manner-collage",
      text: "и собери мини‑коллаж",
      categories: ["creative", "home"],
      difficulties: ["medium"],
      weight: 2,
    },
    {
      id: "manner-ask",
      text: "и попроси друга оценить",
      categories: ["social"],
      difficulties: ["easy"],
      weight: 3,
    },
    {
      id: "manner-list",
      text: "и оформи в виде списка",
      categories: ["day", "home"],
      difficulties: ["easy"],
      weight: 2,
    },
    {
      id: "manner-emoji",
      text: "и добавь три подходящих эмодзи",
      categories: ["social", "creative"],
      difficulties: ["easy"],
      weight: 2,
    },
  ],
};
