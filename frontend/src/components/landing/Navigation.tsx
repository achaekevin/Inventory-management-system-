import { motion } from 'framer-motion';
import { Package, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { name: 'Home', href: '/#' },
  { name: 'Features', href: '/#features' },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = (href: string) => {
    const clean = href.replace('/#', '#');
    if (clean === '#' || clean === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (clean.startsWith('#')) {
      const el = document.querySelector(clean);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = clean;
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <motion.button
          onClick={() => navigate('/#')}
          className="flex items-center gap-2 text-xl font-bold text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-primary">
            <Package className="h-5 w-5" />
          </span>
          InventoryPro
        </motion.button>

        {/* Center menu (desktop) */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            className="hidden text-white hover:bg-white/10 hover:text-white md:inline-flex"
            onClick={() => (window.location.href = '/login')}
          >
            Log in
          </Button>
          <Button
            className="hidden rounded-md border border-white bg-white text-primary hover:bg-white/90 md:inline-flex"
            onClick={() => (window.location.href = '/login')}
          >
            Sign up
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="border-t border-white/20 bg-primary px-6 pb-6 pt-4 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className="text-left text-sm font-medium text-white/90 hover:text-white"
              >
                {item.name}
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                className="flex-1 text-white hover:bg-white/10 hover:text-white"
                onClick={() => (window.location.href = '/login')}
              >
                Log in
              </Button>
              <Button
                className="flex-1 rounded-md border border-white bg-white text-primary hover:bg-white/90"
                onClick={() => (window.location.href = '/login')}
              >
                Sign up
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
