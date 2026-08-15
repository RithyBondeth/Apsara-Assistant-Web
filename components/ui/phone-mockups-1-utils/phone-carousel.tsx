"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { chatDemos, type ChatDemo } from "./chat-screens";

type PhoneCarouselProps = {
  interval?: number;
  className?: string;
};

const getWrappedIndex = (index: number, length: number) =>
  (index + length) % length;

function PhoneFrame({ demo, muted = false }: { demo: ChatDemo; muted?: boolean }) {
  const Screen = demo.Screen;

  return (
    <div
      className={cn(
        "relative aspect-[390/844] w-full rounded-[2.9rem] border-[5px] border-[#171719] bg-[#171719] p-[3px] shadow-[0_42px_92px_-30px_rgba(15,23,42,0.62),0_0_0_1px_rgba(255,255,255,0.16)] transition-[border-color,background-color,box-shadow] duration-500",
        muted && "border-[#d7d7da] bg-[#d7d7da] shadow-none",
      )}
      role="img"
      aria-label={demo.alt}
    >
      <div className="relative size-full overflow-hidden rounded-[2.3rem] bg-white">
        <div aria-hidden="true" className="phone-screen size-full">
          <Screen />
        </div>
      </div>

      <span
        aria-hidden="true"
        className={cn(
          "absolute -left-[8px] top-[21%] h-9 w-[3px] rounded-l-full bg-[#29292c]",
          muted && "bg-[#d7d7da]",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute -left-[8px] top-[29%] h-14 w-[3px] rounded-l-full bg-[#29292c]",
          muted && "bg-[#d7d7da]",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute -right-[8px] top-[27%] h-[4.5rem] w-[3px] rounded-r-full bg-[#29292c]",
          muted && "bg-[#d7d7da]",
        )}
      />
    </div>
  );
}

export function PhoneCarousel({ interval = 5200, className }: PhoneCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const pointerStartX = useRef<number | null>(null);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => getWrappedIndex(current - 1, chatDemos.length));
  }, []);

  const showNext = useCallback(() => {
    setActiveIndex((current) => getWrappedIndex(current + 1, chatDemos.length));
  }, []);

  const showPreviousManually = useCallback(() => {
    setIsPlaying(false);
    showPrevious();
  }, [showPrevious]);

  const showNextManually = useCallback(() => {
    setIsPlaying(false);
    showNext();
  }, [showNext]);

  useEffect(() => {
    if (!isPlaying || chatDemos.length < 2) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const timer = window.setInterval(showNext, interval);
    return () => window.clearInterval(timer);
  }, [interval, isPlaying, showNext]);

  const currentIndex = getWrappedIndex(activeIndex, chatDemos.length);

  const getRelativePosition = (index: number) => {
    let position = index - currentIndex;
    const halfway = chatDemos.length / 2;

    if (position > halfway) position -= chatDemos.length;
    if (position < -halfway) position += chatDemos.length;
    return position;
  };

  return (
    <div
      className={cn(
        "relative isolate flex h-[660px] w-full max-w-[920px] touch-pan-y items-center justify-center overflow-hidden [--phone-shift:165px] [overflow-anchor:none] sm:h-[760px] sm:[--phone-shift:225px] sm:overflow-visible",
        className,
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer conversations handled by Apsara"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") showPreviousManually();
        if (event.key === "ArrowRight") showNextManually();
      }}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("button")) return;
        pointerStartX.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (pointerStartX.current === null) return;

        const distance = event.clientX - pointerStartX.current;
        pointerStartX.current = null;
        if (Math.abs(distance) < 38) return;

        if (distance > 0) showPreviousManually();
        else showNextManually();
      }}
      onPointerCancel={() => {
        pointerStartX.current = null;
      }}
    >
      <div className="absolute left-1/2 top-0 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/70 bg-background/95 p-1 shadow-lg shadow-slate-950/10 backdrop-bl-xl">
        {chatDemos.map((demo, index) => {
          const isActive = index === currentIndex;

          return (
            <button
              key={demo.id}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                setIsPlaying(false);
              }}
              onMouseDown={(event) => event.preventDefault()}
              aria-label={`Show ${demo.platform} conversation`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "h-9 rounded-full px-2.5 text-[10px] font-semibold transition-colors sm:px-4 sm:text-xs",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {demo.platform}
            </button>
          );
        })}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsPlaying((current) => !current)}
          aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
          aria-pressed={!isPlaying}
          className="size-9 shrink-0 rounded-full text-muted-foreground hover:bg-blue-50 hover:text-blue-700"
        >
          {isPlaying ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5 fill-current" />
          )}
        </Button>
      </div>

      <div aria-live="polite" className="contents">
        {chatDemos.map((demo, index) => {
          const position = getRelativePosition(index);
          const isCurrent = position === 0;
          const isAdjacent = Math.abs(position) === 1;
          const shift = position < 0 ? -1 : position > 0 ? 1 : 0;

          return (
            <button
              key={demo.id}
              type="button"
              onClick={() => {
                if (isCurrent) return;
                setActiveIndex(index);
                setIsPlaying(false);
              }}
              onMouseDown={(event) => event.preventDefault()}
              aria-label={
                isCurrent
                  ? `Current conversation: ${demo.alt}`
                  : isAdjacent
                    ? `Show ${position < 0 ? "previous" : "next"} conversation: ${demo.alt}`
                    : `Conversation preview: ${demo.alt}`
              }
              aria-current={isCurrent ? "true" : undefined}
              tabIndex={isAdjacent ? 0 : -1}
              className={cn(
                "absolute left-1/2 top-[54%] w-[270px] mt-4 transition-[transform,opacity,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:w-[320px]",
                isCurrent && "z-30 cursor-default opacity-100",
                isAdjacent &&
                  "z-10 cursor-pointer opacity-35 saturate-50 hover:opacity-60 hover:saturate-100 focus-visible:opacity-60",
                !isCurrent && !isAdjacent && "pointer-events-none z-0 opacity-0",
              )}
              style={{
                transform: isCurrent
                  ? "translate(-50%, -50%) scale(1) rotate(0deg)"
                  : isAdjacent
                    ? shift < 0
                      ? "translate(calc(-50% - var(--phone-shift)), -50%) scale(0.9) rotate(-2deg)"
                      : "translate(calc(-50% + var(--phone-shift)), -50%) scale(0.9) rotate(2deg)"
                    : "translate(-50%, -50%) scale(0.82)",
                filter: isCurrent
                  ? "none"
                  : isAdjacent
                    ? "grayscale(0.25) brightness(0.78)"
                    : "grayscale(1) brightness(0.6)",
              }}
            >
              <PhoneFrame demo={demo} muted={!isCurrent} />
            </button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={showPreviousManually}
        onMouseDown={(event) => event.preventDefault()}
        aria-label="Previous conversation"
        className="absolute left-2 top-[54%] z-50 size-11 -translate-y-1/2 rounded-full border border-border/70 bg-background/95 text-foreground shadow-lg backdrop-bl-xl hover:bg-blue-600 hover:text-white sm:left-[calc(50%-225px)]"
      >
        <ChevronLeft className="size-5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={showNextManually}
        onMouseDown={(event) => event.preventDefault()}
        aria-label="Next conversation"
        className="absolute right-2 top-[54%] z-50 size-11 -translate-y-1/2 rounded-full border border-border/70 bg-background/95 text-foreground shadow-lg backdrop-blur-xl hover:bg-blue-600 hover:text-white sm:right-[calc(50%-225px)]"
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}
