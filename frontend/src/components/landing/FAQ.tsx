import { motion } from 'framer-motion';
import { Section, SectionHeader } from './Section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Who is this system designed for?',
    answer:
      'Our inventory management system is designed for small to large businesses that need to track products, manage warehouses, process purchases and sales, and generate reports. It\'s ideal for retailers, wholesalers, distributors, and manufacturers.',
  },
  {
    question: 'Does it support multiple warehouses?',
    answer:
      'Yes! You can manage inventory across unlimited warehouse locations. Track stock levels separately for each warehouse, transfer inventory between locations, and view consolidated reports across all warehouses.',
  },
  {
    question: 'Can I manage multiple users with different permissions?',
    answer:
      'Absolutely. The system includes comprehensive role-based access control (RBAC) with 5 predefined roles: Super Administrator, Inventory Manager, Procurement Officer, Sales & POS Officer, and Finance & Reports Manager. You can assign granular permissions to control what each user can access and modify.',
  },
  {
    question: 'Does it generate inventory and sales reports?',
    answer:
      'Yes, we provide over 12 types of reports including inventory valuation, stock movement, sales analysis, purchase history, profit & loss, customer reports, supplier reports, and more. All reports can be exported to PDF, Excel, or CSV formats.',
  },
  {
    question: 'Is barcode scanning supported?',
    answer:
      'Yes! The system supports both barcode and QR code generation and scanning. You can generate codes for your products and use a scanner or mobile device to quickly process inventory counts, sales, and purchases.',
  },
  {
    question: 'Can the system scale as my business grows?',
    answer:
      'Definitely. The system is built with scalability in mind. You can start with the Starter plan and upgrade as needed. The Professional and Enterprise plans support unlimited products, multiple warehouses, and unlimited users. The architecture is designed to handle growing transaction volumes efficiently.',
  },
  {
    question: 'Is it mobile responsive?',
    answer:
      'Yes, the entire system is fully responsive and works seamlessly on desktop computers, tablets, and mobile phones. You can manage your inventory, process orders, and view reports from any device with an internet connection.',
  },
  {
    question: 'Does it support role-based access control?',
    answer:
      'Yes, RBAC is a core feature. The system includes 95+ granular permissions organized by module (products, sales, purchases, reports, etc.). You can assign specific permissions to each role and control exactly what users can view, create, edit, or delete.',
  },
  {
    question: 'What kind of support do you provide?',
    answer:
      'We offer email support for all plans, priority support for Professional plan users, and 24/7 phone support for Enterprise customers. We also provide comprehensive documentation, video tutorials, and a knowledge base to help you get the most out of the system.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Security is our top priority. We use bank-level SSL encryption, secure authentication with JWT tokens, daily automated backups, and comply with GDPR regulations. All data is stored in secure, redundant data centers with 99.9% uptime guarantee.',
  },
];

export function FAQ() {
  return (
    <Section id="faq" background="muted">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          subtitle="FAQ"
          title="Frequently Asked Questions"
          description="Find answers to common questions about our inventory management system."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card border rounded-lg px-6 data-[state=open]:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help.
          </p>
          <a
            href="#contact"
            className="text-primary hover:underline font-medium inline-flex items-center gap-2"
          >
            Contact our support team →
          </a>
        </motion.div>
      </div>
    </Section>
  );
}
