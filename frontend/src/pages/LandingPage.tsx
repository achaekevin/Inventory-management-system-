import { useEffect } from 'react';
import { Navigation } from '@/components/landing/Navigation';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { CoreModules } from '@/components/landing/CoreModules';
import { Benefits } from '@/components/landing/Benefits';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Statistics } from '@/components/landing/Statistics';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';
import { Contact } from '@/components/landing/Contact';
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

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'InventoryPro - Enterprise Inventory Management System');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute(
        'content',
        'Transform your business with enterprise-grade inventory management. Track stock, manage warehouses, and make data-driven decisions.'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <DashboardPreview />
        <CoreModules />
        <Benefits />
        <HowItWorks />
        <Statistics />
        <Pricing />
        <FAQ />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
