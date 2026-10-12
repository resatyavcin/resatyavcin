import { Suspense } from "react";
import { notFound } from "next/navigation";
import filmsTr from "@/content/films-tr.json";
import { FilmView } from "./film-view";

export function generateStaticParams() {
  return filmsTr.map((film) => ({ slug: film.slug }));
}

export default function FilmPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <FilmBody params={params} />
    </Suspense>
  );
}

async function FilmBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!filmsTr.some((film) => film.slug === slug)) notFound();

  return <FilmView slug={slug} />;
}
