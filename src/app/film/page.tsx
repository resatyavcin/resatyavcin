import { Suspense } from "react";
import { getCatalog } from "@/lib/films";
import { CatalogSkeleton, FilmsFrame, FilmsPage } from "./films-page";

export default function Page() {
  return (
    <FilmsFrame>
      <Suspense fallback={<CatalogSkeleton />}>
        <FilmList />
      </Suspense>
    </FilmsFrame>
  );
}

async function FilmList() {
  const { films, series } = await getCatalog();
  return <FilmsPage films={films} series={series} />;
}
