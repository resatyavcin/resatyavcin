import Lanyard from "@/components/Lanyard";
import TechMarquee from "@/components/TechMarquee";

export default function Home() {
  return (
    <main className="relative h-dvh w-full">
      <Lanyard
        frontImage="/card-photo.jpg"
        backImage="/tom-logo.jpg"
        imageFit="contain"
        strapImage="/hadi-strap.svg?v=2"
        strapColor="#000000"
        finish="metallic"
        gravity={1.25}
        size={0.41}
      />
      <div className="pointer-events-none absolute right-6 bottom-[5.25rem] left-6 z-20 text-right">
        <p className="text-[1.625rem] leading-none">Reşat Yavçin</p>
        <p className="mt-1.5 text-base leading-none text-foreground/60">Software Developer at TOMBank</p>
      </div>
      <TechMarquee />
    </main>
  );
}
