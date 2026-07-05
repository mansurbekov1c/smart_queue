/* Ism, familiya va filial nomi kabi maydonlar uchun — faqat lotin harflari,
   bo'shliq va apostrof (masalan "Jo'rabek", "Anne Marie"). */
const LATIN_NAME_RE = /^[A-Za-z' ]+$/;

export function isLatinName(value) {
  return LATIN_NAME_RE.test((value || "").trim());
}
