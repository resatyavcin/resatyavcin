"use client";

import { SiteFrame, useLang } from "@/components/site-frame";
import { useInlineMark } from "@/hooks/use-inline-mark";

const marks = [
  {
    pattern: /TOM Bank\S*/,
    src: "/hadi.svg",
    width: 35,
    height: 20,
    size: "h-5 w-[35px]",
  },
  {
    pattern: /Vodafone\S*/,
    src: "/vodafone.jpg",
    width: 20,
    height: 20,
    size: "h-5 w-5",
  },
] as const;

function splitLastWord(before: string) {
  const match = before.match(/^(.*\s)(\S+)$/);
  if (!match) return { lead: "", word: before };
  return { lead: match[1], word: match[2] };
}

function CompanyMark({
  before,
  lead,
  previousWord,
  token,
  after,
  mark,
  atStart,
}: {
  before: string;
  lead: string;
  previousWord: string;
  token: string;
  after: string;
  mark: (typeof marks)[number];
  atStart: boolean;
}) {
  const { markRef, mode } = useInlineMark(previousWord, token);
  const stuck = mode !== "none" && previousWord.length > 0;
  const nameInside = mode !== "word";

  return (
    <>
      {stuck ? lead : before}
      <span className="whitespace-nowrap">
        {stuck ? previousWord : null}
        <img
          ref={markRef}
          src={mark.src}
          alt=""
          width={mark.width}
          height={mark.height}
          className={
            atStart
              ? `mr-1.5 inline align-[-4px] ${mark.size}`
              : `mx-1.5 inline align-[-4px] ${mark.size}`
          }
        />
        {nameInside ? token : null}
      </span>
      {nameInside ? null : token}
      {after}
    </>
  );
}

function CompanyParagraph({ text }: { text: string }) {
  const found = marks
    .map((mark) => ({ mark, match: text.match(mark.pattern) }))
    .find((item) => item.match?.index !== undefined);

  if (!found?.match || found.match.index === undefined) return <p>{text}</p>;

  const token = found.match[0];
  const index = found.match.index;
  const atStart = index === 0;
  const before = atStart ? "" : text.slice(0, index).replace(/\s+$/, "");
  const after = text.slice(index + token.length);
  const parts = atStart ? { lead: "", word: "" } : splitLastWord(before);

  return (
    <p>
      <CompanyMark
        before={before}
        lead={parts.lead}
        previousWord={parts.word}
        token={token}
        after={after}
        mark={found.mark}
        atStart={atStart}
      />
    </p>
  );
}

export default function Home() {
  const { lang, text, choose } = useLang();

  return (
    <div className="mx-auto max-w-[692px] overflow-x-hidden px-6 pt-[120px] pb-12 text-[#21201c] antialiased sm:pt-44 sm:pb-32 md:overflow-x-visible md:pt-[117px] md:pb-16">
      <SiteFrame text={text} lang={lang} choose={choose} />

      <main>
        <span className="mb-5 block font-medium sm:mb-6">{text.today}</span>
        <div className="flex flex-col gap-4 text-[#63635e] leading-[1.65]">
          {text.paragraphs.map((paragraph) => (
            <CompanyParagraph key={paragraph} text={paragraph} />
          ))}
        </div>

        <div className="-mb-3 mt-16 sm:mt-32">
          <span className="mb-5 block font-medium sm:mb-4">{text.writing}</span>
          <div className="flex flex-col gap-7 sm:gap-4">
            {text.posts.map((post) => {
              const external = post.href.startsWith("http");
              return (
              <a
                key={post.href}
                href={post.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="-mx-3 flex flex-col rounded-md px-3 no-underline hover:bg-[#F5F4F4] sm:py-3"
              >
                <span>{post.title}</span>
                <span className="text-[#63635e]">{post.description}</span>
              </a>
              );
            })}
          </div>
        </div>

        <div className="mt-16 sm:mt-32">
          <span className="mb-6 block font-medium">{text.more}</span>
          <span className="text-[#63635e]">
            {text.moreBefore}
            <a
              href="https://medium.com/@resatyavcin"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {text.medium}
            </a>
            {text.moreMiddle}
            <a
              href="https://www.linkedin.com/in/resatyavcin"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {text.linkedin}
            </a>
            {text.moreAfter}
          </span>
        </div>
      </main>
    </div>
  );
}
