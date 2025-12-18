import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Mail, Users, MessageCircle } from "lucide-react";

const Contact = () => {

  useEffect(() => {
    updateMetaTags({
      title: "Contact CompareAuto.in – Support & Partnerships",
      description: "Get in touch with CompareAuto.in for support, data corrections, partnerships, or media inquiries. We respond within 24-48 hours.",
      keywords: ["contact CompareAuto", "support", "partnerships", "car data corrections"],
      canonical: `${window.location.origin}/contact`,
      ogImage: DEFAULT_OG_IMAGE,
    });

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact CompareAuto.in",
      description: "Contact form and support information",
      url: `${window.location.origin}/contact`,
    };
    injectStructuredData(structuredData);
  }, []);

  const contactCards = [
    {
      icon: Mail,
      title: "General Support",
      email: "support@compareauto.in",
      description: "Questions about pricing, features, or using the platform",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Users,
      title: "Partnerships",
      email: "partners@compareauto.in",
      description: "Dealer networks, OEM collaborations, API access",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: MessageCircle,
      title: "Media & Press",
      email: "press@compareauto.in",
      description: "Interview requests, press releases, brand assets",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Get in Touch</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Have a question or feedback? We're here to help. Choose your preferred contact method below.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT CARDS */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {contactCards.map((card, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className={`${card.bgColor} ${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                  <a href={`mailto:${card.email}`} className="text-primary hover:underline text-sm mb-3 block">
                    {card.email}
                  </a>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Social Media: Follow us on{" "}
                <a href="https://twitter.com/compareauto" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  Twitter
                </a>
                {" • "}
                <a href="https://facebook.com/compareauto" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
                {" • "}
                <a href="https://instagram.com/compareauto" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Send Us a Message</h2>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you within 24-48 hours.
              </p>
            </div>

            <EnquiryForm
              context={{ pageType: "contact" }}
              inline={true}
            />
          </div>
        </div>
      </section>

      {/* FAQ STRIP */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Quick Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How quickly do you respond to inquiries?</AccordionTrigger>
                <AccordionContent>
                  We aim to respond to all inquiries within 24-48 hours during business days. For urgent matters, please mention "URGENT" in your subject line.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How do I request a data correction?</AccordionTrigger>
                <AccordionContent>
                  Please email support@compareauto.in with the specific model/variant name, the incorrect information, and the correct details with source documentation (official brochure, dealer confirmation, etc.).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I advertise on CompareAuto.in?</AccordionTrigger>
                <AccordionContent>
                  Yes! For advertising and partnership opportunities, please contact partners@compareauto.in with details about your business and advertising goals.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
