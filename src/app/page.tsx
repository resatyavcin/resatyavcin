const writing = [
  {
    title: "Değişmezlik ve Final",
    description: "How final works in Java, and what it actually makes constant.",
    href: "https://medium.com/p/1626f473fd7e",
  },
  {
    title: "Heap ve Stack",
    description: "The two memory areas a program uses at runtime.",
    href: "https://medium.com/p/b95e1a7d9a0b",
  },
  {
    title: "Veri, Değişken ve Tip (Java SE)",
    description: "What data, variables, and types mean in Java.",
    href: "https://medium.com/p/ff120b88da7a",
  },
  {
    title: "Git İş Akışını Nasıl Sağlıklı Yönetirim?",
    description: "Notes on keeping a Git workflow healthy.",
    href: "https://medium.com/p/68df73de7ad8",
  },
] as const;

export default function Home() {
  return (
    <div className="mx-auto max-w-[692px] overflow-x-hidden px-6 pt-[120px] pb-12 text-[#21201c] antialiased sm:pt-44 sm:pb-32 md:overflow-x-visible md:pt-[117px] md:pb-16">
      <header className="mb-32 flex flex-col items-start">
        <a href="/" className="inline-block font-medium no-underline">
          Reşat Yavçin
        </a>
        <span className="font-medium leading-none text-[#63635e]">Software Developer</span>
      </header>

      <main>
        <span className="mb-5 block font-medium sm:mb-6">Today</span>
        <p className="text-[#63635e] leading-[1.65]">
          I work as a software developer at{" "}
          <span className="whitespace-nowrap">
            <img
              src="/tom-bank.jpg"
              alt=""
              width={18}
              height={18}
              className="mr-1 inline size-[18px] rounded-[2px] align-[-3px]"
            />
            TOM Bank
          </span>. I contribute to n8n-based AI automation that affects software development
          workflows across every backend team. I work on workflows that automate Jira task
          processing, issue resolution, code implementation, and pull requests, and on bringing
          autonomous agents into the development lifecycle to improve efficiency, code quality, and
          automation across those teams.
        </p>
        <p className="mt-4 text-[#63635e] leading-[1.65]">
          I also build scalable Spring microservices and React back-office applications, and I work
          on campaign and CRM systems and agreement flows that include digital signatures.
        </p>

        <div className="-mb-3 mt-16 sm:mt-32">
          <span className="mb-5 block font-medium sm:mb-4">Writing</span>
          <div className="flex flex-col gap-7 sm:gap-4">
            {writing.map((post) => (
              <a
                key={post.href}
                href={post.href}
                target="_blank"
                rel="noreferrer"
                className="-mx-3 flex flex-col rounded-md px-3 no-underline hover:bg-[#F5F4F4] sm:py-3"
              >
                <span>{post.title}</span>
                <span className="text-[#63635e]">{post.description}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-16 sm:mt-32">
          <span className="mb-6 block font-medium">More</span>
          <span className="text-[#63635e]">
            You can read more of my writing on{" "}
            <a href="https://medium.com/@resatyavcin" target="_blank" rel="noreferrer" className="underline">
              Medium
            </a>{" "}
            and more about my work on{" "}
            <a
              href="https://www.linkedin.com/in/resatyavcin"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              LinkedIn
            </a>
            .
          </span>
        </div>
      </main>
    </div>
  );
}
