"use client";

import { useEffect, useState } from "react";
import en from "@/content/en.json";
import tr from "@/content/tr.json";

const copy = { tr, en } as const;

export type Lang = keyof typeof copy;
export type Copy = (typeof copy)[Lang];

const STORAGE_KEY = "lang";

export function useLang() {
  const [lang, setLang] = useState<Lang>("tr");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "tr" || stored === "en") setLang(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function choose(next: Lang) {
    setLang(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return { lang, text: copy[lang], choose };
}

export function SiteFrame({
  text,
  lang,
  choose,
  spaced = true,
}: {
  text: Copy;
  lang: Lang;
  choose: (next: Lang) => void;
  spaced?: boolean;
}) {
  return (
    <div className="relative">
      <div
        className="absolute right-0 bottom-full mb-5 flex items-center gap-2.5 text-sm leading-none"
        role="group"
        aria-label={text.languageLabel}
      >
        {(["tr", "en"] as const).map((code, index) => (
          <span key={code} className="flex items-center gap-2.5">
            {index > 0 ? (
              <span className="text-[#63635e]" aria-hidden>
                /
              </span>
            ) : null}
            <button
              type="button"
              aria-pressed={lang === code}
              onClick={() => choose(code)}
              className={
                lang === code
                  ? "font-medium text-[#21201c]"
                  : "text-[#63635e] hover:text-[#21201c]"
              }
            >
              {code.toUpperCase()}
            </button>
          </span>
        ))}
      </div>

      <header className={`flex flex-col items-start ${spaced ? "mb-32" : ""}`}>
        <a href="/" className="inline-block font-medium no-underline">
          Reşat Yavçin
        </a>
        <div className="flex flex-wrap items-baseline gap-x-5">
          <a
            href="/"
            className="font-medium leading-none text-[#63635e] no-underline hover:text-[#21201c]"
          >
            {text.role}
          </a>
          <a
            href="/film"
            className="font-medium leading-none text-[#63635e] no-underline hover:text-[#21201c]"
          >
            {text.film}
          </a>
        </div>
      </header>
    </div>
  );
}
