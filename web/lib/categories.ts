const CATEGORY_LABELS: Record<string, string> = {
  day: "Дневные приключения",
  night: "Ночные приключения",
  creative: "Творческие приключения",
  social: "Социальные приключения",
  home: "Домашние приключения",
};

const toTitleCase = (value: string) =>
  value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const getCategoryLabel = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const normalized = value.toString().trim().toLowerCase();
  if (!normalized) {
    return "";
  }

  const mapped = CATEGORY_LABELS[normalized] ?? toTitleCase(normalized);
  if (mapped && mapped.trim().length > 0) {
    return mapped;
  }

  return value;
};

export const getCategoryLabelOrFallback = (value?: string | null, fallback = "Личное приключение") => {
  const label = getCategoryLabel(value);
  return label || fallback;
};

export { CATEGORY_LABELS };
