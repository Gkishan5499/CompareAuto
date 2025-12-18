import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, AlertTriangle } from "lucide-react";
import { parseExcelData, syncAllVariants, generateChangeReport, type SyncResult } from "@/lib/variantPriceSync";

const AdminVariantSync = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const [excelData, setExcelData] = useState("");
  const [result, setResult] = useState<SyncResult | null>(null);
  const [report, setReport] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSync = () => {
    setIsProcessing(true);
    
    try {
      // Parse Excel data
      const rows = parseExcelData(excelData);
      
      if (rows.length === 0) {
        alert("No valid data found in input. Please paste Excel data in markdown table format.");
        setIsProcessing(false);
        return;
      }
      
      // Sync variants
      const syncResult = syncAllVariants(rows);
      setResult(syncResult);
      
      // Generate report
      const reportText = generateChangeReport(syncResult);
      setReport(reportText);
      
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadVariantsJson = () => {
    // In a real app, you'd download the updated variants.json here
    alert("In production, this would download the updated variants.json file.");
  };

  if (key !== "demo") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">
            Please provide the correct key parameter to access the sync tool.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Variant Price Sync Tool</h1>
          <p className="text-muted-foreground">
            Paste Excel data below to update variant pricing across the platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">1. Paste Excel Data</h2>
              <Alert className="mb-4">
                <AlertDescription>
                  Paste the markdown table from the parsed Excel document. Format:
                  <code className="block mt-2 p-2 bg-muted rounded text-xs">
                    |Make|Model|Variant|Ex Showroom cost|<br/>
                    |Maruti Suzuki|Swift|LXI|₹578,900.00|
                  </code>
                </AlertDescription>
              </Alert>
              
              <Textarea
                placeholder="Paste Excel data here..."
                value={excelData}
                onChange={(e) => setExcelData(e.target.value)}
                rows={15}
                className="font-mono text-xs"
              />
              
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={handleSync} 
                  disabled={!excelData || isProcessing}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isProcessing ? "Processing..." : "Sync Variants"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {result && (
              <>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">2. Sync Results</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">{result.updated}</p>
                        <p className="text-xs text-muted-foreground">Updated</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{result.created}</p>
                        <p className="text-xs text-muted-foreground">Created</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <p className="text-xl font-bold">{result.skipped}</p>
                      </Badge>
                      <p className="text-xs text-muted-foreground">Skipped (no change)</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-2xl font-bold">{result.errors.length}</p>
                        <p className="text-xs text-muted-foreground">Errors</p>
                      </div>
                    </div>
                  </div>

                  {result.unknownBrands.size > 0 && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>
                        <strong>Unknown Brands ({result.unknownBrands.size}):</strong>
                        <div className="mt-1 text-xs">
                          {Array.from(result.unknownBrands).join(", ")}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {result.unknownModels.size > 0 && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>
                        <strong>Unknown Models ({result.unknownModels.size}):</strong>
                        <div className="mt-1 text-xs max-h-32 overflow-y-auto">
                          {Array.from(result.unknownModels).join(", ")}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={downloadVariantsJson}
                    variant="outline"
                    className="w-full"
                  >
                    Download Updated variants.json
                  </Button>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">3. Change Report</h2>
                  <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap">{report}</pre>
                  </div>
                </Card>
              </>
            )}
            
            {!result && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  Results will appear here after sync
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVariantSync;
