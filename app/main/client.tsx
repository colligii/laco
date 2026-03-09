'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type WheelEvent } from 'react';
import { ChevronLeft, ChevronRight, Clock, MessageCircle, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { EventResponse } from '../api/event/route';
import formatDate from '../lib/formatDate';
import { useRouter } from 'next/navigation';

const MainContent = ({
  scheduleName = 'Nome da Programacao',
  onlineCount = 12,
  events,
}: {
  scheduleName?: string;
  onlineCount?: number;
  events: EventResponse[];
}) => {
  const hasInfiniteScroll = events.length > 1;
  const carouselEvents = useMemo(
    () => (hasInfiniteScroll ? [...events, ...events, ...events] : events),
    [events, hasInfiniteScroll]
  );
  const [currentIndex, setCurrentIndex] = useState(() =>
    hasInfiniteScroll ? events.length : 0
  );
  const currentIndexRef = useRef(currentIndex);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isAutoScrollingRef = useRef(false);
  const autoScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const centerCardByIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const card = cardRefs.current[index];
    if (!card) {
      return;
    }

    isAutoScrollingRef.current = true;
    card.scrollIntoView({
      behavior,
      block: 'nearest',
      inline: 'center',
    });

    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }

    autoScrollTimeoutRef.current = setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 280);
  };

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
    centerCardByIndex(index);
    router.replace(`/event/${events[index].id}`)
  };

  const handleStep = (direction: 'prev' | 'next') => {
    if (events.length < 2) {
      return;
    }

    const baseIndex = currentIndexRef.current;
    const nextIndexRaw =
      direction === 'next'
        ? baseIndex + 1
        : baseIndex - 1;
    const totalItems = carouselEvents.length;
    const nextIndex = ((nextIndexRaw % totalItems) + totalItems) % totalItems;

    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
    centerCardByIndex(nextIndex);
  };

  const blockMouseScroll = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (!scrollContainerRef.current) {
      return;
    }

    requestAnimationFrame(() => {
      const startIndex = hasInfiniteScroll ? events.length : 0;
      if (!cardRefs.current[startIndex]) {
        return;
      }

      currentIndexRef.current = startIndex;
      setCurrentIndex(startIndex);
      centerCardByIndex(startIndex, 'auto');
    });
  }, [events.length, hasInfiniteScroll, carouselEvents.length]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, []);

  const selectedEvent = useMemo(
    () => carouselEvents[currentIndex] ?? events[0] ?? null,
    [carouselEvents, currentIndex, events]
  );

  const heroImage = selectedEvent?.horizontal_url ?? selectedEvent?.vertical_url;
  const heroTitle = selectedEvent?.name ?? scheduleName;

  return (
    <div className="h-dvh overflow-hidden bg-zinc-950 text-white">
      <motion.div
        className="h-full flex flex-col overflow-hidden"
        initial={{ opacity: 0, x: '100%' }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="relative h-[270px] w-full shrink-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedEvent?.id ?? 'default-hero'}
              src={
                heroImage ??
                'https://images.unsplash.com/photo-1522071820081-009f0129c71c'
              }
              alt={heroTitle}
              className="h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent" />

          <button
            type="button"
            aria-label="Abrir chat"
            className="absolute right-5 top-5 rounded-full border border-zinc-700 bg-zinc-900/70 p-2 backdrop-blur-md"
          >
            <MessageCircle size={22} className="text-zinc-100" />
          </button>

          <div className="absolute bottom-14 w-full px-4 text-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={selectedEvent?.id ?? 'default-title'}
                className="text-2xl font-semibold tracking-tight text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {heroTitle}
              </motion.h1>
            </AnimatePresence>
          </div>
        </div>

        <div className="relative z-10 mx-4 -mt-8 mb-5 rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedEvent?.id ?? 'default-info'}
              className="grid grid-cols-3 gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div className="flex flex-col items-center gap-1 text-center">
                <Clock size={24} className="text-zinc-200" />
                <span className="text-[10px] uppercase text-zinc-500">Comeca</span>
                <span className="text-xs text-zinc-300">
                  {selectedEvent?.start_date ? formatDate(String(selectedEvent.start_date)) : '-'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1 text-center">
                <Clock size={24} className="text-zinc-200" />
                <span className="text-[10px] uppercase text-zinc-500">Termina</span>
                <span className="text-xs text-zinc-300">
                  {selectedEvent?.end_date ? formatDate(String(selectedEvent.end_date)) : '-'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1 text-center">
                <Users size={24} className="text-zinc-200" />
                <span className="text-[10px] uppercase text-zinc-500">Presenca</span>
                <span className="text-xs text-zinc-300">Online: {onlineCount}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative min-h-0 flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-40">
            <button
              type="button"
              aria-label="Evento anterior"
              onClick={() => handleStep('prev')}
              disabled={!hasInfiniteScroll}
              className="pointer-events-auto absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-zinc-600 bg-black/75 p-3 shadow-lg backdrop-blur-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <button
              type="button"
              aria-label="Proximo evento"
              onClick={() => handleStep('next')}
              disabled={!hasInfiniteScroll}
              className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-zinc-600 bg-black/75 p-3 shadow-lg backdrop-blur-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
          <div
            ref={scrollContainerRef}
            className="min-h-0 flex-1 overflow-hidden no-scrollbar snap-x snap-mandatory"
            onWheel={blockMouseScroll}
          >
            <div
              className={`flex h-full gap-6 pb-6 px-10 ${hasInfiniteScroll ? '' : 'justify-center'
                }`}
            >
              {carouselEvents.map((event, index) => (
                <motion.button
                  type="button"
                  key={`${event.id}-${index}`}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className={`relative h-[80%] self-center w-[80%] shrink-0 overflow-hidden rounded-xl border text-left ${hasInfiniteScroll ? 'snap-center' : ''
                    }`}
                  onClick={() => handleSelect(index)}
                  animate={{
                    scale: currentIndex === index ? 0.98 : 0.9,
                    borderColor: currentIndex === index ? '#a1a1aa' : '#27272a',
                  }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img
                    src={event.vertical_url}
                    alt="Event"
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4">
                    <h2 className="mb-5 text-xl font-semibold text-white">{event.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-zinc-200">
                      <Clock size={16} />
                      <span>Disponivel a partir de:</span>
                    </div>
                    <p className="pl-6 text-sm text-zinc-300">
                      {formatDate(String(event.start_date))}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function ScheduleScreen({ events }: ScheduleScreenProps) {

  return (
    <Suspense
      fallback={
        <div className="h-dvh flex flex-col overflow-hidden bg-zinc-950 text-white" />
      }
    >
      <MainContent
        events={events}
      />
    </Suspense>
  );
}

export interface ScheduleScreenProps {
  events: EventResponse[]
}
