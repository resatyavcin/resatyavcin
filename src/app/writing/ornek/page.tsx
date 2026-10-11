"use client";

import { SiteFrame, useLang } from "@/components/site-frame";
import sampleEn from "@/content/sample-en.json";
import sampleTr from "@/content/sample-tr.json";

const samples = { tr: sampleTr, en: sampleEn };

const KEYWORDS = new Set([
  "public",
  "private",
  "final",
  "class",
  "return",
  "new",
  "if",
  "this",
]);

function highlight(code: string) {
  const parts = code.split(/(\/\/.*|"(?:\\.|[^"])*"|\b[A-Za-z_][A-Za-z0-9_]*\b)/g);
  return parts.map((part, index) => {
    if (part.startsWith("//")) {
      return (
        <span key={index} className="text-[#82827c]">
          {part}
        </span>
      );
    }
    if (part.startsWith('"')) {
      return (
        <span key={index} className="text-[#63635e]">
          {part}
        </span>
      );
    }
    if (KEYWORDS.has(part)) {
      return (
        <span key={index} className="font-medium text-[#21201c]">
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function SampleWritingPage() {
  const { lang, text, choose } = useLang();
  const sample = samples[lang];

  return (
    <div className="mx-auto max-w-[692px] px-6 pt-[120px] pb-24 text-[#21201c] antialiased sm:pt-44 md:pt-[117px]">
      <SiteFrame text={text} lang={lang} choose={choose} />

      <main>
        <h1 className="mb-5 block text-base font-medium sm:mb-6">{sample.title}</h1>
        <div className="flex flex-col gap-4 text-[#63635e] leading-[1.65]">
          {sample.blocks.map((block, index) => {
            if (block.type === "h2") {
              return (
                <h2 key={index} className="mt-8 font-medium text-[#21201c]">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "figure") {
              return (
                <figure key={index} className="my-2">
                  <img
                    src={block.src}
                    alt={block.alt}
                    className="h-auto w-full rounded-md"
                  />
                  <figcaption className="mt-2">{block.caption}</figcaption>
                </figure>
              );
            }
            if (block.type === "code" && block.code) {
              return (
                <pre
                  key={index}
                  className="my-2 overflow-x-auto rounded-md bg-[#f5f4f4] p-4 font-mono text-sm leading-relaxed text-[#21201c]"
                >
                  <code>{highlight(block.code)}</code>
                </pre>
              );
            }
            return <p key={index}>{block.text}</p>;
          })}
        </div>
      </main>
    </div>
  );
}
