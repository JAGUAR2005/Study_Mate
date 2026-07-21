export const languages = [
  { name: "English", code: "en-US" },
  { name: "Hindi", code: "hi-IN" },
  { name: "Spanish", code: "es-ES" },
  { name: "French", code: "fr-FR" },
  { name: "German", code: "de-DE" },
  { name: "Japanese", code: "ja-JP" },
  { name: "Korean", code: "ko-KR" },
  { name: "Portuguese", code: "pt-BR" },
  { name: "Arabic", code: "ar-SA" },
] as const;

export type PreferredLanguage = (typeof languages)[number]["name"];

const preferenceKey = "studymate:preferred-language";

export function storedLanguage(): PreferredLanguage {
  if (typeof window === "undefined") return "English";
  const value = window.localStorage.getItem(preferenceKey);
  return languages.some((language) => language.name === value) ? value as PreferredLanguage : "English";
}

export function saveLanguage(language: PreferredLanguage) {
  window.localStorage.setItem(preferenceKey, language);
}
