"use client";

import { SiteFrame, useLang } from "@/components/site-frame";
import filmsEn from "@/content/films-en.json";
import filmsTr from "@/content/films-tr.json";

const films = { tr: filmsTr, en: filmsEn };

export function FilmView({ slug }: { slug: string }) {
  const { lang, text, choose } = useLang();
  const film = films[lang].find((item) => item.slug === slug);

  if (!film) return null;

  return (
    <div className="mx-auto max-w-[692px] px-6 pt-[120px] pb-24 text-[#21201c] antialiased sm:pt-44 md:pt-[117px]">
      <SiteFrame text={text} lang={lang} choose={choose} />

      <main>
        <div className="mb-5 flex items-start gap-4 sm:mb-6">
          <img
            src={film.poster}
            alt=""
            width={96}
            height={144}
            className="h-36 w-24 shrink-0 rounded-sm"
          />
          <div>
            <h1 className="block font-medium">{film.title}</h1>
            <span className="mt-1 block text-[#63635e]">{film.date}</span>
            <span className="mt-1 block text-[#63635e]">{film.score}/10</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-[#63635e] leading-[1.65]">
          {film.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <a
          href={film.imdb}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block underline"
        >
          {text.openImdb}
        </a>
      </main>
    </div>
  );
}
