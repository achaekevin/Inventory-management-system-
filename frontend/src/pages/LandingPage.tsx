import { useEffect } from 'react';
import { Navigation } from '@/components/landing/Navigation';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { CoreModules } from '@/components/landing/CoreModules';
import { Benefits } from '@/components/landing/Benefits';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';

export function LandingPage() {
  useEffect(() => {
    // Set page title and meta tags
    document.title = 'InventoryPro - Enterprise Inventory Management System';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Streamline your warehouse operations with InventoryPro - a comprehensive inventory management platform with real-time tracking, multi-warehouse support, and advanced analytics.'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <div id="overview">
          <Hero />
        </div>
        <div id="features">
          <Features />
        </div>
        <div id="modules">
          <CoreModules />
        </div>
        <Benefits />
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="faq">
          <FAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
}
