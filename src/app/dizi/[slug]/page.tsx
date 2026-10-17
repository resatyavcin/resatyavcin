import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TitleView } from "@/components/title-view";
import { getSeriesItem } from "@/lib/films";

export default function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <SeriesBody params={params} />
    </Suspense>
  );
}

async function SeriesBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const show = await getSeriesItem(slug);
  if (!show) notFound();

  return <TitleView item={show} series />;
}
