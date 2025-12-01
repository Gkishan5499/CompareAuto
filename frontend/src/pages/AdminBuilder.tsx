import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, AlertCircle } from "lucide-react";
import SectionEditor from "@/components/builder/SectionEditor";
import pagesData from "@/data/pages.json";
import { useFeatureFlags } from "@/lib/api-hooks";

const AdminBuilder = () => {
  const [searchParams] = useSearchParams();
  const accessKey = searchParams.get("key");
  const [pages, setPages] = useState(pagesData);
  const { data: featureFlagsData = {}, isLoading: flagsLoading } = useFeatureFlags();
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (featureFlagsData && Object.keys(featureFlagsData).length > 0) {
      setFlags(featureFlagsData);
    }
  }, [featureFlagsData]);

  if (accessKey !== "demo") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Access denied. Valid key required.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleDownload = (type: "pages" | "flags") => {
    const data = type === "pages" ? pages : flags;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = type === "pages" ? "pages.json" : "feature-flags.json";
    a.click();
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="mb-8">Page Builder (Demo)</h1>
        
        <Alert className="mb-6">
          <AlertDescription>
            This is a demo builder. Changes are in-memory only. Download JSON files to save changes.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(flags).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{key}</span>
                  <Button
                    variant={value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFlags({ ...flags, [key]: !value })}
                  >
                    {value ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              ))}
              <Button onClick={() => handleDownload("flags")} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download feature-flags.json
              </Button>
            </CardContent>
          </Card>

          <Button onClick={() => handleDownload("pages")}>
            <Download className="h-4 w-4 mr-2" />
            Download pages.json
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminBuilder;
