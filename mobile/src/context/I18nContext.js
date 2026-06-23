import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { I18N, LANG_CODES } from "../i18n/translations";

const I18nCtx = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("uz-latn");

  const t = useCallback(
    (key, fallback) => {
      const dict = I18N[lang] || {};
      if (dict[key] !== undefined) return dict[key];
      if (fallback !== undefined) return fallback;
      return key;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t, langCodes: LANG_CODES, langName: (code) => I18N[code]?.langName || code }), [lang, t]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n I18nProvider ichida ishlatilishi kerak");
  return ctx;
}
