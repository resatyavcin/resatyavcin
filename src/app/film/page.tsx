"use client";

import { SiteFrame, useLang } from "@/components/site-frame";
import filmsEn from "@/content/films-en.json";
import filmsTr from "@/content/films-tr.json";

const films = { tr: filmsTr, en: filmsEn };

export default function FilmsPage() {
  const { lang, text, choose } = useLang();

  return (
    <div className="mx-auto max-w-[692px] px-6 pt-[120px] pb-24 text-[#21201c] antialiased sm:pt-44 md:pt-[117px]">
      <SiteFrame text={text} lang={lang} choose={choose} />

      <main>
        <span className="mb-5 block font-medium sm:mb-6">{text.films}</span>
        <div className="flex flex-col gap-7 sm:gap-4">
          {films[lang].map((film) => (
            <a
              key={film.slug}
              href={`/film/${film.slug}`}
              className="-mx-3 flex items-center gap-4 rounded-md px-3 no-underline hover:bg-[#F5F4F4] sm:py-3"
            >
              <img
                src={film.poster}
                alt=""
                width={48}
                height={72}
                className="h-[72px] w-12 shrink-0 rounded-sm"
              />
              <span className="flex flex-col">
                <span>{film.title}</span>
                <span className="text-[#63635e]">
                  {film.date}
                  <span aria-hidden> · </span>
                  {film.score}/10
                </span>
              </span>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
