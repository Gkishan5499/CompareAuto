import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { UsedGallery } from "@/components/used/UsedGallery";
import { UsedPriceBox } from "@/components/used/UsedPriceBox";
import { UsedSimilar } from "@/components/used/UsedSimilar";
import AdSlot from "@/components/ads/AdSlot";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Calendar,
  Gauge,
  User,
  Fuel,
  Settings,
  FileCheck,
  Shield,
  AlertTriangle,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getUsedCar, getUsedCars, UsedCar } from "@/lib/data";
import { updateMetaTags, injectStructuredData, generateProductSchema } from "@/lib/seo";

const UsedCarsDetail = () => {
  const { city, id } = useParams();
  const [car, setCar] = useState<UsedCar | null>(null);
  const [similarCars, setSimilarCars] = useState<UsedCar[]>([]);

  useEffect(() => {
    if (id) {
      const carData = getUsedCar(id);
      setCar(carData || null);

      if (carData) {
        // Get similar cars
        const similar = getUsedCars({ city: carData.city })
          .filter((c) => c.id !== carData.id && c.brand === carData.brand)
          .slice(0, 4);
        setSimilarCars(similar);

        // SEO
        updateMetaTags({
          title: `${carData.year} ${carData.brand} ${carData.model} ${carData.variant} in ${carData.city} – Price & Details | CompareAuto.in`,
          description: `${carData.year} ${carData.title} for sale in ${carData.city}. ${carData.kms.toLocaleString()} km driven, ${carData.owners} owner. Price: ₹${(carData.price / 100000).toFixed(2)} Lakh. ${carData.verified ? "Verified listing." : ""} ${carData.features.join(", ")}.`,
          keywords: [`${carData.brand} ${carData.model}`, `used ${carData.model}`, `${carData.model} ${carData.city}`, `buy ${carData.model}`],
          ogImage: carData.images[0] || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
        });

        const schema = generateProductSchema({
          name: carData.title,
          description: `${carData.year} ${carData.title} - ${carData.kms.toLocaleString()} km, ${carData.owners} owner`,
          image: carData.images[0],
          brand: carData.brand,
          price: carData.price,
          availability: "InStock",
          url: `https://compareauto.in${carData.listingUrl}`,
        });
        injectStructuredData(schema);
      }
    }
  }, [id]);

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Car not found</p>
      </div>
    );
  }

  const citySlug = city || car.city.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/used-cars">Used Cars</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/used-cars/${citySlug}`}>{car.city}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{car.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <AdSlot id="detail_page_top_banner" sizeMap={{ mobile: "320x50", desktop: "728x90" }} />

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Gallery & Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">{car.title}</h1>
                  {car.verified && (
                    <Badge className="bg-primary">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {car.year} • {car.city}
                </p>
              </div>

              {/* Gallery */}
              <UsedGallery images={car.images} title={car.title} />

              {/* Quick Facts */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Facts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">KMs Driven</p>
                        <p className="font-semibold">{car.kms.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Owners</p>
                        <p className="font-semibold">{car.owners}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Fuel</p>
                        <p className="font-semibold">{car.fuel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Transmission</p>
                        <p className="font-semibold">{car.transmission}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {car.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <AdSlot id="detail_inline_banner" sizeMap={{ mobile: "300x250", desktop: "728x90" }} />

              {/* Documents Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Important Documents to Verify
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Registration Certificate (RC) with matching owner details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Valid Insurance Policy (active and transferable)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>PUC (Pollution Under Control) Certificate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>NOC from bank/finance company (if applicable)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Service history and maintenance records</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Safety Notice */}
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                    <AlertTriangle className="w-5 h-5" />
                    Safety Notice
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-orange-800 dark:text-orange-200">
                  <p className="mb-2">
                    <strong>Important:</strong> Always verify seller documents and vehicle condition before
                    purchase.
                  </p>
                  <ul className="space-y-1 text-sm list-disc list-inside">
                    <li>Meet the seller in person and inspect the vehicle</li>
                    <li>Verify that the seller's name matches the RC</li>
                    <li>Consider a professional pre-purchase inspection</li>
                    <li>Check for any outstanding loans or legal issues</li>
                    <li>CompareAuto is not a dealer and does not sell cars directly</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Price Box */}
            <div className="lg:col-span-1">
              <UsedPriceBox
                price={car.price}
                sellerName={car.sellerName}
                sellerPhone={car.sellerPhone}
                sellerType={car.sellerType}
              />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Similar Listings */}
      {similarCars.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <UsedSimilar cars={similarCars} />
          </div>
        </section>
      )}
    </div>
  );
};

export default UsedCarsDetail;
