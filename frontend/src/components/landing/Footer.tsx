import { motion } from 'framer-motion';
import { Package, ArrowUp, Mail, MessageCircle, Globe, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  product: [
    { name: 'Overview', href: '#overview' },
    { name: 'Features', href: '#features' },
    { name: 'Core Modules', href: '#modules' },
    { name: 'How It Works', href: '#how-it-works' },
  ],
  resources: [
    { name: 'Dashboard Preview', href: '#preview' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Login', href: '/login' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Security', href: '#security' },
  ],
};

const socialLinks = [
  { icon: Mail, href: 'https://github.com', label: 'GitHub' },
  { icon: MessageCircle, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Globe, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Share2, href: 'https://facebook.com', label: 'Facebook' },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative border-t bg-card">
      <div className="container mx-auto container-padding py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 text-xl font-bold mb-4"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-foreground">
                Inventory<span className="text-primary">Pro</span>
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mb-6 max-w-sm"
            >
              Enterprise-grade inventory management system designed to streamline operations, reduce costs, and drive business growth.
            </motion.p>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center group"
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </motion.div>
          </div>

          {/* Links Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => {
                      if (link.href.startsWith('/')) {
                        window.location.href = link.href;
                      } else {
                        scrollToSection(link.href);
                      }
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground"
          >
            <p>© 2026 InventoryPro. All rights reserved.</p>
            <div className="flex gap-4">
              {footerLinks.legal.map((link, index) => (
                <span key={link.name} className="flex items-center gap-4">
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="hover:text-primary transition-colors"
                  >
                    {link.name}
                  </button>
                  {index < footerLinks.legal.length - 1 && (
                    <span className="text-muted-foreground/50">•</span>
                  )}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={scrollToTop}
              className="rounded-full"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll to Top Button - Fixed Position */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-8 right-8 z-40 hidden lg:block"
      >
        <Button
          variant="default"
          size="icon"
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      </motion.div>
    </footer>
  );
}
