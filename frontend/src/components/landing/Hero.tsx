import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const features = [
  {
    id: 1,
    title: 'Navigate Through Every Feature',
    description: 'Seamlessly manage inventory, track stock in real-time, and monitor all warehouse operations from a single unified platform.',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80',
  },
  {
    id: 2,
    title: 'Real-Time Stock Tracking',
    description: 'Monitor inventory levels across multiple warehouses with instant live updates and automated smart reorder alerts.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80',
  },
  {
    id: 3,
    title: 'Advanced Analytics Dashboard',
    description: 'Make confident, data-driven business decisions with comprehensive performance reports and actionable sales insights.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80',
  },
  {
    id: 4,
    title: 'Efficient Order Management',
    description: 'Accelerate your entire supply chain workflow from purchase order creation to customer fulfillment and invoicing.',
    image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1920&q=80',
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex flex-col justify-center items-center pt-24 pb-16">
      {/* Background Carousel with seamless crossfade (no gaps/flashes) */}
      <div className="absolute inset-0 bg-slate-950">
        {features.map((feature, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={feature.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                style={{
                  backgroundImage: `url(${feature.image})`,
                }}
              />
            </div>
          );
        })}
        {/* High contrast dark gradient overlay ensuring clear visibility from afar */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/80 via-black/60 to-black/85 pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="relative z-30 flex w-full max-w-5xl flex-col items-center justify-center px-6 text-center my-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col items-center w-full"
          >
            {/* Main Headline - Bold, high-contrast, scalable */}
            <h1 className="mb-4 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-tight">
              {features[currentSlide].title}
            </h1>

            {/* Description */}
            <p className="mb-8 text-base sm:text-lg md:text-xl lg:text-2xl text-slate-100 font-medium max-w-3xl leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              {features[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Permanent, prominent CTA Button - Guaranteed 100% visible with vibrant bright styling */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="z-40 mt-6"
        >
          <button
            type="button"
            className="group relative inline-flex items-center justify-center gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-400 text-white font-black text-xl sm:text-2xl px-10 sm:px-12 py-5 sm:py-6 rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:shadow-[0_0_60px_rgba(37,99,235,0.9)] hover:scale-105 transition-all duration-200 border-2 border-white/40 cursor-pointer"
            onClick={() => {
              window.location.href = '/login';
            }}
          >
            <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-wide font-extrabold">
              Get Started Now
            </span>
            <ArrowRight className="h-7 w-7 text-white stroke-[3] transition-transform duration-200 group-hover:translate-x-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
          </button>
        </motion.div>

        {/* Carousel Navigation Arrows */}
        <div className="absolute left-2 right-2 sm:left-6 sm:right-6 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none z-40">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="pointer-events-auto h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/75 hover:scale-110 transition-all border border-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-8 w-8 sm:h-9 sm:w-9" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="pointer-events-auto h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/75 hover:scale-110 transition-all border border-white/20"
            aria-label="Next slide"
          >
            <ChevronRight className="h-8 w-8 sm:h-9 sm:w-9" />
          </Button>
        </div>

        {/* Carousel Indicators */}
        <div className="mt-8 flex gap-3 items-center justify-center z-40">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 transition-all duration-300 rounded-full cursor-pointer ${
                index === currentSlide ? 'w-10 bg-primary shadow-lg shadow-primary/50' : 'w-3 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
