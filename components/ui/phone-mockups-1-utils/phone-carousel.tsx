"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ImageItem = {
  src: string;
  alt: string;
};

type PhoneCarouselProps = {
  images: ImageItem[];
  interval?: number;
  className?: string;
};

const getWrappedIndex = (index: number, length: number) =>
  (index + length) % length;

function PhoneFrame({
  image,
  muted = false,
}: {
  image: ImageItem;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[390/844] w-full rounded-[2.9rem] border-[3px] border-neutral-700 bg-neutral-900 p-[7px] shadow-[0_35px_80px_-24px_rgba(15,23,42,0.48)]",
        muted && "border-neutral-400 bg-neutral-300 shadow-none",
      )}
    >
      <div className="relative h-full overflow-hidden rounded-[2.35rem] bg-white">
        {/* The local screenshots include their own status bar; the frame only
            supplies the physical bezel so custom images can remain drop-in. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          draggable={false}
          className="h-full w-full select-none object-cover"
        />
      </div>

      <span
        aria-hidden="true"
        className={cn(
          "absolute -left-[5px] top-[22%] h-10 w-[3px] rounded-l-full bg-neutral-700",
          muted && "bg-neutral-400",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute -left-[5px] top-[30%] h-16 w-[3px] rounded-l-full bg-neutral-700",
          muted && "bg-neutral-400",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute -right-[5px] top-[27%] h-20 w-[3px] rounded-r-full bg-neutral-700",
          muted && "bg-neutral-400",
        )}
      />
    </div>
  );
}

export function PhoneCarousel({
  images,
  interval = 4500,
  className,
}: PhoneCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => getWrappedIndex(current - 1, images.length));
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => getWrappedIndex(current + 1, images.length));
  }, [images.length]);

  useEffect(() => {
    if (!isPlaying || images.length < 2) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const timer = window.setInterval(showNext, interval);
    return () => window.clearInterval(timer);
  }, [images.length, interval, isPlaying, showNext]);

  if (images.length === 0) return null;

  const currentIndex = getWrappedIndex(activeIndex, images.length);
  const previousIndex = getWrappedIndex(currentIndex - 1, images.length);
  const nextIndex = getWrappedIndex(currentIndex + 1, images.length);

  return (
    <div
      className={cn(
        "relative isolate flex h-[520px] w-full max-w-[820px] items-center justify-center overflow-hidden sm:h-[620px] sm:overflow-visible",
        className,
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label="Apsara Assistant product screens"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") showPrevious();
        if (event.key === "ArrowRight") showNext();
      }}
    >
      {images.length > 1 && (
        <button
          type="button"
          onClick={showPrevious}
          aria-label={`Show previous screen: ${images[previousIndex].alt}`}
          className="absolute left-1/2 top-1/2 z-10 w-[230px] -translate-x-[112%] -translate-y-[47%] -rotate-1 opacity-25 grayscale transition duration-500 hover:opacity-40 focus-visible:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:w-[278px]"
        >
          <PhoneFrame image={images[previousIndex]} muted />
        </button>
      )}

      <div
        key={images[currentIndex].src}
        className="absolute left-1/2 top-1/2 z-30 w-[246px] -translate-x-1/2 -translate-y-1/2 animate-[phone-screen-in_500ms_cubic-bezier(0.22,1,0.36,1)] sm:w-[310px]"
        aria-live="polite"
        aria-label={`${images[currentIndex].alt}, slide ${currentIndex + 1} of ${images.length}`}
      >
        <PhoneFrame image={images[currentIndex]} />
      </div>

      {images.length > 1 && (
        <button
          type="button"
          onClick={showNext}
          aria-label={`Show next screen: ${images[nextIndex].alt}`}
          className="absolute left-1/2 top-1/2 z-10 w-[230px] translate-x-[12%] -translate-y-[47%] rotate-1 opacity-25 grayscale transition duration-500 hover:opacity-40 focus-visible:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:w-[278px]"
        >
          <PhoneFrame image={images[nextIndex]} muted />
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 sm:bottom-11">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={showPrevious}
            aria-label="Previous screen"
            className="size-11 rounded-full border border-white/10 bg-neutral-800/90 text-white shadow-lg backdrop-blur-md hover:bg-neutral-700 hover:text-white"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying((current) => !current)}
            aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
            aria-pressed={!isPlaying}
            className="size-11 rounded-full border border-white/10 bg-neutral-800/90 text-white shadow-lg backdrop-blur-md hover:bg-neutral-700 hover:text-white"
          >
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={showNext}
            aria-label="Next screen"
            className="size-11 rounded-full border border-white/10 bg-neutral-800/90 text-white shadow-lg backdrop-blur-md hover:bg-neutral-700 hover:text-white"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
