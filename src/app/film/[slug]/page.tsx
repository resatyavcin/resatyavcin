import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TitleView } from "@/components/title-view";
import { getFilm } from "@/lib/films";

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
  const film = await getFilm(slug);
  if (!film) notFound();

  return <TitleView item={film} diary />;
}
