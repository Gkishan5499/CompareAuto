import { useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  Copy,
  FileJson,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { dataCache } from "@/lib/data-cache";

const AdminContentGuide = () => {
  const [searchParams] = useSearchParams();
  const [validationResults, setValidationResults] = useState<{
    brands: { valid: boolean; errors: string[] };
    models: { valid: boolean; errors: string[] };
    variants: { valid: boolean; errors: string[] };
  } | null>(null);

  // Guard: require ?key=demo
  const accessKey = searchParams.get("key");
  if (accessKey !== "demo") {
    return <Navigate to="/" replace />;
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  const validateJSON = () => {
    const results = {
      brands: { valid: true, errors: [] as string[] },
      models: { valid: true, errors: [] as string[] },
      variants: { valid: true, errors: [] as string[] },
    };

    // Validate brands
    try {
      const brandsData = dataCache.getBrands();
      if (!Array.isArray(brandsData)) {
        results.brands.valid = false;
        results.brands.errors.push("brands.json must be an array");
      } else {
        brandsData.forEach((brand, idx) => {
          if (!brand.id || !brand.name || !brand.slug) {
            results.brands.errors.push(`Brand at index ${idx} missing required fields (id, name, slug)`);
            results.brands.valid = false;
          }
        });
      }
    } catch (err) {
      results.brands.valid = false;
      results.brands.errors.push("Failed to parse brands.json");
    }

    // Validate models
    try {
      const modelsData = dataCache.getModels();
      if (!Array.isArray(modelsData)) {
        results.models.valid = false;
        results.models.errors.push("models.json must be an array");
      } else {
        modelsData.forEach((model: any, idx: number) => {
          if (!model.id || (!model.brand && !model.brandId) || !model.name) {
            results.models.errors.push(`Model at index ${idx} missing required fields (id, brand/brandId, name)`);
            results.models.valid = false;
          }
        });
      }
    } catch (err) {
      results.models.valid = false;
      results.models.errors.push("Failed to parse models.json");
    }

    // Validate variants
    try {
      const variantsData = dataCache.getVariants();
      if (!Array.isArray(variantsData)) {
        results.variants.valid = false;
        results.variants.errors.push("variants.json must be an array");
      } else {
        variantsData.forEach((entry: any, idx: number) => {
          if (!entry.id || !entry.modelId) {
            results.variants.errors.push(`Entry at index ${idx} missing required fields (id, modelId)`);
            results.variants.valid = false;
          }
        });
      }
    } catch (err) {
      results.variants.valid = false;
      results.variants.errors.push("Failed to parse variants.json");
    }

    setValidationResults(results);
    
    const totalErrors = results.brands.errors.length + results.models.errors.length + results.variants.errors.length;
    if (totalErrors === 0) {
      toast({ title: "Validation passed!", description: "All JSON files are valid" });
    } else {
      toast({ 
        title: "Validation failed", 
        description: `Found ${totalErrors} issue(s)`,
        variant: "destructive"
      });
    }
  };

  const brandTemplate = `{
  "id": "brand-slug",
  "name": "Brand Name",
  "slug": "brand-slug",
  "logo": "brands/brand-slug/logo.png",
  "country": "Country",
  "modelCount": 0
}`;

  const modelTemplate = `{
  "id": "brand-model",
  "brand": "brand-slug",
  "name": "Model Name",
  "slug": "model-slug",
  "bodyType": "Sedan",
  "fuelType": "Petrol",
  "priceRange": "₹10.00 - 15.00 Lakh",
  "status": "on_sale",
  "launchDate": "2024-01-15"
}`;

  const variantTemplate = `{
  "brandSlug": "brand-slug",
  "modelSlug": "model-slug",
  "modelLabel": "Model Name",
  "variants": [
    {
      "variantSlug": "variant-slug",
      "label": "Variant Name",
      "code": "VX",
      "fuel": "Petrol",
      "transmission": "Manual",
      "exShowroom": 1000000,
      "status": "on_sale"
    }
  ]
}`;

  const imageStructure = `/public/
  ├── cars/
  │   └── {brand-slug}/
  │       └── {model-slug}/
  │           ├── hero.png              # Main hero image
  │           ├── gallery/
  │           │   ├── front.png
  │           │   ├── side.png
  │           │   ├── rear.png
  │           │   └── interior.png
  │           ├── colors/
  │           │   ├── red.png
  │           │   ├── white.png
  │           │   └── blue.png
  │           └── 360-viewer/          # Optional 360° images
  │               ├── 001.png
  │               └── ...
  └── brands/
      └── {brand-slug}/
          └── logo.png`;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Content Management Guide</h1>
          <p className="text-muted-foreground">
            Manual editing instructions for brands, models, variants, and images
          </p>
        </div>

        {/* Validation Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              JSON Validation
            </CardTitle>
            <CardDescription>
              Check all data files for errors before deploying
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={validateJSON} className="mb-4">
              Validate All JSON Files
            </Button>

            {validationResults && (
              <div className="space-y-3">
                {/* Brands validation */}
                <Alert variant={validationResults.brands.valid ? "default" : "destructive"}>
                  <div className="flex items-start gap-3">
                    {validationResults.brands.valid ? (
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">brands.json</p>
                      {validationResults.brands.errors.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-sm">
                          {validationResults.brands.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Alert>

                {/* Models validation */}
                <Alert variant={validationResults.models.valid ? "default" : "destructive"}>
                  <div className="flex items-start gap-3">
                    {validationResults.models.valid ? (
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">models.json</p>
                      {validationResults.models.errors.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-sm">
                          {validationResults.models.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Alert>

                {/* Variants validation */}
                <Alert variant={validationResults.variants.valid ? "default" : "destructive"}>
                  <div className="flex items-start gap-3">
                    {validationResults.variants.valid ? (
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">variants.json</p>
                      {validationResults.variants.errors.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-sm">
                          {validationResults.variants.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for different guides */}
        <Tabs defaultValue="brands" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="brands">Brands</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          {/* Brands Tab */}
          <TabsContent value="brands" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Adding a New Brand</CardTitle>
                <CardDescription>
                  Add brands to <code>/src/data/brands.json</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge>JSON Template</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(brandTemplate, "Brand template")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {brandTemplate}
                  </pre>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Required fields:</strong> id, name, slug, logo, country<br />
                    <strong>Slug format:</strong> lowercase, hyphen-separated (e.g., maruti-suzuki)<br />
                    <strong>Logo path:</strong> brands/{'{brand-slug}'}/logo.png
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Adding a New Model</CardTitle>
                <CardDescription>
                  Add models to <code>/src/data/models.json</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge>JSON Template</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(modelTemplate, "Model template")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {modelTemplate}
                  </pre>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Required fields:</strong> id, brand, name, slug<br />
                    <strong>Body types:</strong> Sedan, SUV, Hatchback, MUV, Coupe, Convertible<br />
                    <strong>Fuel types:</strong> Petrol, Diesel, Electric, Hybrid, CNG<br />
                    <strong>Status:</strong> on_sale, upcoming, discontinued
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Adding Variants & Prices</CardTitle>
                <CardDescription>
                  Add variants to <code>/src/data/variants.json</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge>JSON Template</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(variantTemplate, "Variant template")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {variantTemplate}
                  </pre>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Required fields:</strong> brandSlug, modelSlug, modelLabel, variants[]<br />
                    <strong>Variant fields:</strong> variantSlug, label<br />
                    <strong>Price (exShowroom):</strong> in rupees, no decimals (e.g., 1000000 for ₹10 lakh)<br />
                    <strong>Transmission:</strong> Manual, Automatic, AMT, CVT, DCT
                  </AlertDescription>
                </Alert>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <p className="font-semibold mb-2">📝 Updating Prices</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Find the brand/model entry in variants.json</li>
                    <li>Locate the specific variant by variantSlug</li>
                    <li>Update the exShowroom field (in rupees)</li>
                    <li>Save the file and redeploy</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Image Structure
                </CardTitle>
                <CardDescription>
                  Place images in <code>/public</code> folder
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge>Directory Structure</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(imageStructure, "Image structure")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto font-mono">
                    {imageStructure}
                  </pre>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Naming convention:</strong> Use lowercase slugs with hyphens<br />
                    <strong>Image formats:</strong> PNG, JPG, WebP (WebP recommended for best performance)<br />
                    <strong>Recommended sizes:</strong><br />
                    • Hero: 1600x900px<br />
                    • Gallery: 1200x675px<br />
                    • Color swatches: 80x80px<br />
                    • Brand logos: 200x200px (transparent background)
                  </AlertDescription>
                </Alert>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <p className="font-semibold mb-2">🖼️ Adding Images</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Upload images to /public/cars/{'{brand-slug}'}/{'{model-slug}'}/</li>
                    <li>Follow the naming convention (hero.png, gallery/front.png, etc.)</li>
                    <li>Update media-map.json to reference the images (optional)</li>
                    <li>Redeploy to see changes</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>💡 Pro Tip:</strong> After making changes, always validate JSON files before deploying.
            Keep backups of your data files before making bulk updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminContentGuide;
