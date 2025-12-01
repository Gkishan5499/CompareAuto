import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, CheckCircle, AlertCircle, XCircle, Copy } from "lucide-react";
import { parseExcelMarkdown, runQAAnalysis, generateCSV, type QAReport } from "@/lib/excelImportQA";

const AdminImportReport = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const [excelData, setExcelData] = useState("");
  const [report, setReport] = useState<QAReport | null>(null);
  const [loading, setLoading] = useState(false);

  // Check auth
  if (key !== "demo") {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Access denied. Invalid key.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleAnalyze = () => {
    if (!excelData.trim()) {
      return;
    }

    setLoading(true);
    try {
      const parsed = parseExcelMarkdown(excelData);
      const qaReport = runQAAnalysis(parsed);
      setReport(qaReport);
    } catch (error) {
      console.error("QA analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = (data: any[], filename: string, columns: string[]) => {
    const csv = generateCSV(data, columns);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Excel Import QA Report</h1>
        <p className="text-muted-foreground">
          DRY-RUN comparison between Excel data and site variants (no changes will be made)
        </p>
      </div>

      {!report && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Paste Excel Data (Markdown Table Format)</CardTitle>
            <CardDescription>
              Paste the Excel content with columns: Make | Model | Variant | Ex Showroom cost
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full h-64 p-4 border rounded-md font-mono text-sm"
              placeholder="|Make|Model|Variant|Ex Showroom cost|
|-|-|-|-|
|Maruti Suzuki|Swift|VXI|₹658,900.00|
..."
              value={excelData}
              onChange={(e) => setExcelData(e.target.value)}
            />
            <Button onClick={handleAnalyze} disabled={loading || !excelData.trim()}>
              {loading ? "Analyzing..." : "Run DRY-RUN Analysis"}
            </Button>
          </CardContent>
        </Card>
      )}

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Rows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.sheetTotal}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Found in Site
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {report.foundInSite}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Missing in Site
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {report.missingInSite}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Duplicates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  {report.duplicatesInSheet}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Price Mismatches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  {report.priceMismatchCount}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unknown Brand/Model
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {report.unknownBrandsOrModels}
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>DRY-RUN MODE:</strong> This analysis does not modify any data. Added This Run = 0.
            </AlertDescription>
          </Alert>

          {/* Detailed Tables */}
          <Tabs defaultValue="missing" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="missing">
                Missing Variants ({report.missingVariants.length})
              </TabsTrigger>
              <TabsTrigger value="mismatches">
                Price Mismatches ({report.priceMismatches.length})
              </TabsTrigger>
              <TabsTrigger value="duplicates">
                Duplicates ({report.duplicates.length})
              </TabsTrigger>
              <TabsTrigger value="matched">
                Matched ({report.foundInSite})
              </TabsTrigger>
            </TabsList>

            {/* Missing Variants Tab */}
            <TabsContent value="missing">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Missing Variants</CardTitle>
                    <CardDescription>
                      Variants present in Excel but not found on the site
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownloadCSV(
                        report.missingVariants.slice(0, 100),
                        "missing-variants.csv",
                        ["brand", "model", "variant", "excelPrice", "reason"]
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download (first 100)
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Brand</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Variant</TableHead>
                          <TableHead>Excel Price</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.missingVariants.slice(0, 100).map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{item.brand}</TableCell>
                            <TableCell>{item.model}</TableCell>
                            <TableCell>{item.variant}</TableCell>
                            <TableCell>{formatCurrency(item.excelPrice)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.reason === "variant_not_found"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {item.reason.replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {report.missingVariants.length > 100 && (
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        Showing first 100 of {report.missingVariants.length} missing variants
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Price Mismatches Tab */}
            <TabsContent value="mismatches">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Price Mismatches</CardTitle>
                    <CardDescription>
                      Variants with price differences &gt; ₹1,000 between Excel and site
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownloadCSV(
                        report.priceMismatches.slice(0, 100),
                        "price-mismatches.csv",
                        ["brand", "model", "variant", "excelPrice", "sitePrice", "priceDiff"]
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download (first 100)
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Brand</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Variant</TableHead>
                          <TableHead>Excel Price</TableHead>
                          <TableHead>Site Price</TableHead>
                          <TableHead>Difference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.priceMismatches.slice(0, 100).map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{item.brand}</TableCell>
                            <TableCell>{item.model}</TableCell>
                            <TableCell>{item.variant}</TableCell>
                            <TableCell>{formatCurrency(item.excelPrice)}</TableCell>
                            <TableCell>{formatCurrency(item.sitePrice)}</TableCell>
                            <TableCell className="text-red-600 font-semibold">
                              {formatCurrency(item.priceDiff)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {report.priceMismatches.length > 100 && (
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        Showing first 100 of {report.priceMismatches.length} price mismatches
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Duplicates Tab */}
            <TabsContent value="duplicates">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Duplicates in Excel</CardTitle>
                    <CardDescription>
                      Identical brand+model+variant combinations found multiple times
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownloadCSV(
                        report.duplicates.slice(0, 100),
                        "duplicates.csv",
                        ["brand", "model", "variant", "count", "prices"]
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download (first 100)
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Brand</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Variant</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead>Prices</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.duplicates.slice(0, 100).map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{item.brand}</TableCell>
                            <TableCell>{item.model}</TableCell>
                            <TableCell>{item.variant}</TableCell>
                            <TableCell>
                              <Badge variant="destructive">{item.count}x</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.prices.map((p) => formatCurrency(p)).join(", ")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {report.duplicates.length > 100 && (
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        Showing first 100 of {report.duplicates.length} duplicates
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Matched Tab */}
            <TabsContent value="matched">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Successfully Matched</CardTitle>
                    <CardDescription>
                      Variants found in both Excel and site
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownloadCSV(
                        report.matches.slice(0, 100),
                        "matched-variants.csv",
                        ["brand", "model", "variant", "excelPrice", "sitePrice", "priceDiff"]
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download (first 100)
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Brand</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Variant</TableHead>
                          <TableHead>Excel Price</TableHead>
                          <TableHead>Site Price</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.matches.slice(0, 100).map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{item.brand}</TableCell>
                            <TableCell>{item.model}</TableCell>
                            <TableCell>{item.variant}</TableCell>
                            <TableCell>{formatCurrency(item.excelPrice)}</TableCell>
                            <TableCell>{formatCurrency(item.sitePrice)}</TableCell>
                            <TableCell>
                              {item.priceDiff <= 1000 ? (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Match
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  Diff: {formatCurrency(item.priceDiff)}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {report.matches.length > 100 && (
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        Showing first 100 of {report.matches.length} matched variants
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex gap-4">
            <Button onClick={() => setReport(null)} variant="outline">
              Run New Analysis
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminImportReport;
