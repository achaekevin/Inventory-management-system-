import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const features = [
  {
    id: 1,
    title: 'Navigate through every feature',
    description: 'Seamlessly manage inventory, track stock, and monitor your warehouse operations with real-time insights.',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1920&q=80',
  },
  {
    id: 2,
    title: 'Real-Time Stock Tracking',
    description: 'Monitor inventory levels across multiple warehouses with live updates and automated alerts.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80',
  },
  {
    id: 3,
    title: 'Advanced Analytics Dashboard',
    description: 'Make data-driven decisions with comprehensive reports and actionable insights.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80',
  },
  {
    id: 4,
    title: 'Efficient Order Management',
    description: 'Streamline your sales process from order creation to fulfillment and invoicing.',
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
    <section className="relative h-screen w-full overflow-hidden pt-16">
      {/* Background Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${features[currentSlide].image})`,
            }}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.h1
              className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {features[currentSlide].title}
            </motion.h1>

            <motion.p
              className="mb-8 text-xl text-white/90 md:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {features[currentSlide].description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary px-8 py-6 text-lg font-semibold text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    window.location.href = '/login';
                  }}
                >
                  Get Started Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg font-semibold border-white text-white hover:bg-white/10"
                  onClick={() => {
                    window.location.href = '/debug';
                  }}
                >
                  Debug Info
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation */}
        <div className="absolute left-8 right-8 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="h-12 w-12 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 hover:text-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="h-12 w-12 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 hover:text-white"
            aria-label="Next slide"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 transition-all ${
                index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
              } rounded-full`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
