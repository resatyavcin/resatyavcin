import { Suspense } from "react";
import { getCatalog } from "@/lib/films";
import { FilmsPage } from "./films-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FilmList />
    </Suspense>
  );
}

async function FilmList() {
  const { films, series } = await getCatalog();
  return <FilmsPage films={films} series={series} />;
}
