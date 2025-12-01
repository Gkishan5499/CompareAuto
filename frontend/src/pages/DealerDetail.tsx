import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { updateMetaTags, injectStructuredData } from "@/lib/seo";
import { getDealerById } from "@/lib/dealers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { MapPin, Phone, Mail, Globe, Clock, Star, CheckCircle2, Navigation } from "lucide-react";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import NotFound from "./NotFound";

const DealerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [showEnquiry, setShowEnquiry] = useState(false);
  const dealer = id ? getDealerById(id) : null;

  useEffect(() => {
    if (!dealer) return;

    updateMetaTags({
      title: `${dealer.name} – ${dealer.address.city} | CompareAuto.in`,
      description: `Visit ${dealer.name} in ${dealer.address.city} for ${dealer.brands.join(", ")}. Get address, contact details, hours, and directions. ${dealer.categories.join(", ")} available.`,
      keywords: [
        dealer.name,
        ...dealer.brands,
        `${dealer.brands[0]} dealer ${dealer.address.city}`,
        `car dealer ${dealer.address.city}`,
      ],
      canonical: `https://compareauto.in/dealers/${dealer.id}`,
    });

    // AutoDealer structured data
    const dealerSchema = {
      "@context": "https://schema.org",
      "@type": "AutoDealer",
      name: dealer.name,
      url: `https://compareauto.in/dealers/${dealer.id}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: `${dealer.address.line1}, ${dealer.address.line2}`,
        addressLocality: dealer.address.city,
        addressRegion: dealer.address.state,
        postalCode: dealer.address.pincode,
        addressCountry: "IN",
      },
      telephone: dealer.phones[0],
      email: dealer.email,
      openingHours: `Mo-Sa ${dealer.hours.mon_sat}`,
      geo: {
        "@type": "GeoCoordinates",
        latitude: dealer.location.lat,
        longitude: dealer.location.lng,
      },
      aggregateRating: dealer.rating
        ? {
            "@type": "AggregateRating",
            ratingValue: dealer.rating,
            bestRating: 5,
          }
        : undefined,
    };
    injectStructuredData(dealerSchema);
  }, [dealer]);

  if (!dealer) {
    return <NotFound />;
  }

  const mapUrl = `https://www.google.com/maps?q=${dealer.location.lat},${dealer.location.lng}`;

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <section className="py-4 bg-muted/30">
        <div className="container mx-auto px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dealers">Dealers</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{dealer.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="mb-0">{dealer.name}</h1>
                {dealer.verified && (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {dealer.brands.map((brand) => (
                  <Badge key={brand} variant="secondary" className="text-base">
                    {brand}
                  </Badge>
                ))}
              </div>
              {dealer.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg">
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <span className="font-semibold">{dealer.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Rating</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowEnquiry(true)}>
                Get Price Quote
              </Button>
              <Button variant="outline" asChild>
                <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation className="h-4 w-4 mr-2" />
                  Directions
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Services Offered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {dealer.categories.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-base py-2 px-4">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Address & Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                    <div>
                      <div className="font-medium mb-1">Address</div>
                      <div className="text-muted-foreground">
                        <div>{dealer.address.line1}</div>
                        {dealer.address.line2 && <div>{dealer.address.line2}</div>}
                        <div>
                          {dealer.address.city}, {dealer.address.state} - {dealer.address.pincode}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                    <div>
                      <div className="font-medium mb-1">Phone</div>
                      <div className="space-y-1">
                        {dealer.phones.map((phone) => (
                          <div key={phone}>
                            <a href={`tel:${phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                              {phone}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                    <div>
                      <div className="font-medium mb-1">Email</div>
                      <a href={`mailto:${dealer.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                        {dealer.email}
                      </a>
                    </div>
                  </div>

                  {dealer.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                      <div>
                        <div className="font-medium mb-1">Website</div>
                        <a
                          href={dealer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {dealer.website}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <span className="font-medium">Monday - Saturday: </span>
                        <span className="text-muted-foreground">{dealer.hours.mon_sat}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <span className="font-medium">Sunday: </span>
                        <span className="text-muted-foreground">{dealer.hours.sun}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Map & CTA */}
            <div className="space-y-6">
              {/* Map Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex flex-col items-center gap-2"
                    >
                      <MapPin className="h-12 w-12" />
                      <span className="text-sm">View on Google Maps</span>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={() => setShowEnquiry(true)}>
                    Request Price Quote
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setShowEnquiry(true)}>
                    Book Test Drive
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Form Modal */}
      {showEnquiry && (
        <EnquiryForm
          context={{
            pageType: "dealer",
            dealerId: dealer.id,
            brand: dealer.brands[0],
          }}
          onSuccess={() => setShowEnquiry(false)}
        />
      )}
    </div>
  );
};

export default DealerDetail;
