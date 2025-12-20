import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

interface StateTaxConfig {
  _id: string;
  state: string;
  gstRate: number;
  rtoPercentage: number;
  rtoByFuelType?: {
    petrol?: number;
    diesel?: number;
    cng?: number;
    hybrid?: number;
    ev?: number;
  };
  insurancePercentage: number;
  insuranceByFuelType?: {
    petrol?: number;
    diesel?: number;
    cng?: number;
    hybrid?: number;
    ev?: number;
  };
  registrationFee: number;
  tcsRate?: number;
  fastagCharges?: number;
}

interface PricingSummary {
  variants: {
    total: number;
    priceStats: {
      average: number;
      min: number;
      max: number;
    };
  };
  taxConfigs: StateTaxConfig[];
}

const PricingManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // RTO Fuel Type Selection State
  const [selectedFuelType, setSelectedFuelType] = useState<"petrol" | "diesel" | "cng" | "hybrid" | "ev">("petrol");

  // Pricing Update State
  const [priceUpdateType, setPriceUpdateType] = useState<"percentage" | "fixed">("percentage");
  const [priceUpdateValue, setPriceUpdateValue] = useState<number>(0);
  const [priceUpdateFilter, setPriceUpdateFilter] = useState("");

  // State Tax State
  const [stateTaxConfigs, setStateTaxConfigs] = useState<StateTaxConfig[]>([]);
  const [pricingSummary, setPricingSummary] = useState<PricingSummary | null>(null);

  // Edit Tax Dialog State
  const [editingState, setEditingState] = useState<StateTaxConfig | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<StateTaxConfig>>({});
  
  // Inline Editing State
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditData, setInlineEditData] = useState<Partial<StateTaxConfig>>({});

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);

  // Fetch Summary
  useEffect(() => {
    fetchPricingSummary();
  }, []);

  const fetchPricingSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/pricing/summary");
      if (!response.ok) throw new Error("Failed to fetch summary");
      const data = await response.json();
      setPricingSummary(data);
      setStateTaxConfigs(data.taxConfigs);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch pricing summary" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAllPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/pricing/variants/update-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: priceUpdateType,
          value: parseFloat(priceUpdateValue.toString()),
          filters: priceUpdateFilter ? { modelId: priceUpdateFilter } : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to update prices");
      const data = await response.json();

      setMessage({ type: "success", text: `Updated ${data.variantsUpdated} variant prices` });
      setPriceUpdateValue(0);
      fetchPricingSummary();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update variant prices" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStateTax = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/pricing/taxes/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) throw new Error("Failed to update state tax");
      const data = await response.json();

      setMessage({ type: "success", text: data.message });
      setEditingState(null);
      fetchPricingSummary();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update state tax configuration" });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPredefinedUpdates = async () => {
    if (!confirm("This will update RTO and Insurance percentages for Petrol fuel type across all states. Continue?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/state-tax-config/apply-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to apply updates");
      const data = await response.json();

      setMessage({ 
        type: "success", 
        text: `Successfully updated ${data.updatedCount} out of ${data.totalAttempted} state configurations` 
      });
      fetchPricingSummary();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to apply predefined updates" });
    } finally {
      setLoading(false);
    }
  };

  const handleImportCsv = async () => {
    if (!csvFile) {
      setMessage({ type: "error", text: "Please choose a CSV file first" });
      return;
    }
    try {
      setCsvUploading(true);
      setMessage(null);
      const form = new FormData();
      form.append("file", csvFile);

      const resp = await fetch("/api/state-tax-config/import-csv", {
        method: "POST",
        body: form,
      });
      if (!resp.ok) throw new Error("Import failed");
      const data = await resp.json();
      setMessage({
        type: "success",
        text: `Imported ${data.updated + data.created} (updated ${data.updated}, created ${data.created}, skipped ${data.skipped})`,
      });
      setCsvFile(null);
      (document.getElementById("csv-input") as HTMLInputElement | null)?.value && ((document.getElementById("csv-input") as HTMLInputElement).value = "");
      fetchPricingSummary();
    } catch (e) {
      setMessage({ type: "error", text: "Failed to import CSV" });
    } finally {
      setCsvUploading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "prices", label: "Update Prices" },
    { id: "taxes", label: "State Taxes" },
  ];

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
        }`}>
          {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && pricingSummary && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-gray-600 text-sm">Total Variants</div>
                <p className="text-2xl font-bold">{pricingSummary.variants.total}</p>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Average Price</div>
                <p className="text-2xl font-bold">₹{Math.round(pricingSummary.variants.priceStats.average).toLocaleString()}</p>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Price Range</div>
                <p className="text-lg">₹{Math.round(pricingSummary.variants.priceStats.min).toLocaleString()} - ₹{Math.round(pricingSummary.variants.priceStats.max).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Configurations by State</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Current tax rates and fees</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <label className="block text-sm font-medium">View RTO by Fuel Type:</label>
                    <select
                      value={selectedFuelType}
                      onChange={(e) => setSelectedFuelType(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="cng">CNG</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="ev">EV</option>
                    </select>
                    <span className="text-sm text-gray-500">
                      Select a fuel type to see and edit RTO and Insurance percentages for that fuel type across all states.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="csv-input"
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      className="text-sm bg-gray-50 border border-gray-30 rounded p-3"
                    />
                    <Button onClick={handleImportCsv} disabled={csvUploading || !csvFile} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      {csvUploading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                      Import CSV
                    </Button>
                  </div>

                  <Button 
                    onClick={handleApplyPredefinedUpdates} 
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                    Apply Latest Updates
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>State</TableHead>
                      <TableHead>RTO %</TableHead>
                      <TableHead>Insurance %</TableHead>
                      <TableHead>TCS Rate</TableHead>
                      <TableHead>FASTag</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingSummary.taxConfigs.map((config) => {
                      const isEditing = inlineEditingId === config._id;
                      const editData = isEditing ? inlineEditData : config;
                      
                      return (
                      <TableRow key={config._id} className={isEditing ? "bg-blue-50" : ""}>
                        <TableCell className="font-medium">{config.state}</TableCell>
                        
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.1"
                              className="w-20"
                                value={editData.rtoByFuelType?.[selectedFuelType] || editData.rtoPercentage || 0}
                                onChange={(e) => setInlineEditData({ 
                                  ...inlineEditData, 
                                  rtoByFuelType: { 
                                    ...inlineEditData.rtoByFuelType,
                                    [selectedFuelType]: parseFloat(e.target.value)
                                  }
                                })}
                            />
                          ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                  {selectedFuelType.charAt(0).toUpperCase() + selectedFuelType.slice(1)}: {config.rtoByFuelType?.[selectedFuelType] ?? config.rtoPercentage}%
                                </span>
                              </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.1"
                              className="w-20"
                              value={editData.insuranceByFuelType?.[selectedFuelType] || editData.insurancePercentage || 0}
                              onChange={(e) => setInlineEditData({ 
                                ...inlineEditData, 
                                insuranceByFuelType: { 
                                  ...inlineEditData.insuranceByFuelType,
                                  [selectedFuelType]: parseFloat(e.target.value)
                                }
                              })}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                {selectedFuelType.charAt(0).toUpperCase() + selectedFuelType.slice(1)}: {config.insuranceByFuelType?.[selectedFuelType] ?? config.insurancePercentage}%
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.1"
                              className="w-20"
                              value={editData.tcsRate || 1}
                              onChange={(e) => setInlineEditData({ ...inlineEditData, tcsRate: parseFloat(e.target.value) })}
                            />
                          ) : (
                            `${config.tcsRate || 1}%`
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              className="w-24"
                              value={editData.fastagCharges || 500}
                              onChange={(e) => setInlineEditData({ ...inlineEditData, fastagCharges: parseInt(e.target.value) })}
                            />
                          ) : (
                            `₹${(config.fastagCharges || 500).toLocaleString()}`
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={async () => {
                                  try {
                                    setLoading(true);
                                    const response = await fetch("/api/admin/pricing/taxes/update", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ ...config, ...inlineEditData }),
                                    });
                                    if (response.ok) {
                                      setMessage({ type: "success", text: "Updated successfully" });
                                      setInlineEditingId(null);
                                      fetchPricingSummary();
                                    }
                                  } catch (error) {
                                    setMessage({ type: "error", text: "Failed to update" });
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setInlineEditingId(null);
                                  setInlineEditData({});
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setInlineEditingId(config._id);
                                  setInlineEditData(config);
                                }}
                              >
                                Edit
                              </Button>
                              <Dialog open={editingState?._id === config._id} onOpenChange={(open) => {
                                if (!open) setEditingState(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingState(config);
                                      setEditFormData(config);
                                    }}
                                  >
                                    Advanced
                                  </Button>
                                </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Advanced Tax Configuration - {config.state}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">GST Rate (%)</label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      value={editFormData.gstRate || 0}
                                      onChange={(e) => setEditFormData({ ...editFormData, gstRate: parseFloat(e.target.value) })}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">RTO Percentage (%)</label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      value={editFormData.rtoPercentage || 0}
                                      onChange={(e) => setEditFormData({ ...editFormData, rtoPercentage: parseFloat(e.target.value) })}
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-3">RTO by Fuel Type (%)</label>
                                    <div className="grid grid-cols-5 gap-2">
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Petrol</label>
                                        <Input
                                          type="number"
                                          step="0.1"
                                          value={editFormData.rtoByFuelType?.petrol ?? editFormData.rtoPercentage ?? 0}
                                          onChange={(e) => setEditFormData({ 
                                            ...editFormData, 
                                            rtoByFuelType: { 
                                              ...editFormData.rtoByFuelType, 
                                              petrol: parseFloat(e.target.value) 
                                            } 
                                          })}
                                          placeholder="9"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Diesel</label>
                                        <Input
                                          type="number"
                                          step="0.1"
                                          value={editFormData.rtoByFuelType?.diesel ?? editFormData.rtoPercentage ?? 0}
                                          onChange={(e) => setEditFormData({ 
                                            ...editFormData, 
                                            rtoByFuelType: { 
                                              ...editFormData.rtoByFuelType, 
                                              diesel: parseFloat(e.target.value) 
                                            } 
                                          })}
                                          placeholder="9.5"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">CNG</label>
                                        <Input
                                          type="number"
                                          step="0.1"
                                          value={editFormData.rtoByFuelType?.cng ?? editFormData.rtoPercentage ?? 0}
                                          onChange={(e) => setEditFormData({ 
                                            ...editFormData, 
                                            rtoByFuelType: { 
                                              ...editFormData.rtoByFuelType, 
                                              cng: parseFloat(e.target.value) 
                                            } 
                                          })}
                                          placeholder="8.5"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Hybrid</label>
                                        <Input
                                          type="number"
                                          step="0.1"
                                          value={editFormData.rtoByFuelType?.hybrid ?? editFormData.rtoPercentage ?? 0}
                                          onChange={(e) => setEditFormData({ 
                                            ...editFormData, 
                                            rtoByFuelType: { 
                                              ...editFormData.rtoByFuelType, 
                                              hybrid: parseFloat(e.target.value) 
                                            } 
                                          })}
                                          placeholder="8"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">EV</label>
                                        <Input
                                          type="number"
                                          step="0.1"
                                          value={editFormData.rtoByFuelType?.ev ?? editFormData.rtoPercentage ?? 0}
                                          onChange={(e) => setEditFormData({ 
                                            ...editFormData, 
                                            rtoByFuelType: { 
                                              ...editFormData.rtoByFuelType, 
                                              ev: parseFloat(e.target.value) 
                                            } 
                                          })}
                                          placeholder="0"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Insurance Percentage (%)</label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      value={editFormData.insurancePercentage || 0}
                                      onChange={(e) => setEditFormData({ ...editFormData, insurancePercentage: parseFloat(e.target.value) })}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">TCS Rate (%) - For vehicles ≥10L</label>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      value={editFormData.tcsRate || 1}
                                      onChange={(e) => setEditFormData({ ...editFormData, tcsRate: parseFloat(e.target.value) })}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">FASTag Charges (₹)</label>
                                    <Input
                                      type="number"
                                      value={editFormData.fastagCharges || 500}
                                      onChange={(e) => setEditFormData({ ...editFormData, fastagCharges: parseInt(e.target.value) })}
                                    />
                                  </div>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                                  <p className="font-medium mb-1">Current Breakdown:</p>
                                  <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>Individual Registration = RTO %</li>
                                    <li>TCS applies only to vehicles with ex-showroom ≥ Rs. 10,00,000</li>
                                    <li>Other Charges = TCS + FASTag</li>
                                  </ul>
                                </div>
                                <Button onClick={handleUpdateStateTax} disabled={loading} className="w-full">
                                  {loading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                                  Update Configuration
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );})}
                    
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Price Update Tab */}
      {activeTab === "prices" && (
        <Card>
          <CardHeader>
            <CardTitle>Update Variant Prices</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Update ex-showroom prices for all or filtered variants</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Update Type</label>
                <select
                  value={priceUpdateType}
                  onChange={(e) => setPriceUpdateType(e.target.value as "percentage" | "fixed")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{priceUpdateType === "percentage" ? "Percentage" : "Amount (₹)"}</label>
                <Input
                  type="number"
                  step={priceUpdateType === "percentage" ? "0.1" : "1000"}
                  value={priceUpdateValue}
                  onChange={(e) => setPriceUpdateValue(parseFloat(e.target.value))}
                  placeholder={priceUpdateType === "percentage" ? "e.g., 5.5" : "e.g., 50000"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Filter by Model (Optional)</label>
              <Input
                placeholder="Enter model ID (leave empty for all variants)"
                value={priceUpdateFilter}
                onChange={(e) => setPriceUpdateFilter(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                {priceUpdateType === "percentage"
                  ? `This will increase all prices by ${priceUpdateValue}%`
                  : `This will increase all prices by ₹${priceUpdateValue.toLocaleString()}`}
              </p>
            </div>

            <Button onClick={handleUpdateAllPrices} disabled={loading} size="lg" className="w-full">
              {loading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Prices
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Taxes Tab */}
      {activeTab === "taxes" && (
        <Card>
          <CardHeader>
            <CardTitle>State-wise Tax Configuration</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Manage GST, RTO, insurance, TCS rate, and FASTag charges by state</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead>GST %</TableHead>
                    <TableHead>RTO %</TableHead>
                    <TableHead>Insurance %</TableHead>
                    <TableHead>Reg. Fee</TableHead>
                    <TableHead>TCS %</TableHead>
                    <TableHead>FASTag</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stateTaxConfigs.map((config) => {
                    const isEditing = inlineEditingId === config._id;
                    const editData = isEditing ? inlineEditData : config;
                    
                    return (
                    <TableRow key={config._id} className={isEditing ? "bg-blue-50" : ""}>
                      <TableCell className="font-medium">{config.state}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.1"
                            className="w-20"
                            value={editData.gstRate || 0}
                            onChange={(e) => setInlineEditData({ ...inlineEditData, gstRate: parseFloat(e.target.value) })}
                          />
                        ) : (
                          `${config.gstRate}%`
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.1"
                            className="w-20"
                            value={editData.rtoPercentage || 0}
                            onChange={(e) => setInlineEditData({ ...inlineEditData, rtoPercentage: parseFloat(e.target.value) })}
                          />
                        ) : (
                          `${config.rtoPercentage}%`
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.1"
                            className="w-20"
                            value={editData.insurancePercentage || 0}
                            onChange={(e) => setInlineEditData({ ...inlineEditData, insurancePercentage: parseFloat(e.target.value) })}
                          />
                        ) : (
                          `${config.insurancePercentage}%`
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            className="w-28"
                            value={editData.registrationFee || 0}
                            onChange={(e) => setInlineEditData({ ...inlineEditData, registrationFee: parseInt(e.target.value) })}
                          />
                        ) : (
                          `₹${config.registrationFee.toLocaleString()}`
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.1"
                            className="w-20"
                            value={editData.tcsRate || 1}
                            onChange={(e) => setInlineEditData({ ...inlineEditData, tcsRate: parseFloat(e.target.value) })}
                          />
                        ) : (
                          `${config.tcsRate || 1}%`
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            className="w-24"
                            value={editData.fastagCharges || 500}
                            onChange={(e) => setInlineEditData({ ...inlineEditData, fastagCharges: parseInt(e.target.value) })}
                          />
                        ) : (
                          `₹${(config.fastagCharges || 500).toLocaleString()}`
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  const response = await fetch("/api/admin/pricing/taxes/update", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ ...config, ...inlineEditData }),
                                  });
                                  if (response.ok) {
                                    setMessage({ type: "success", text: "Updated successfully" });
                                    setInlineEditingId(null);
                                    fetchPricingSummary();
                                  }
                                } catch (error) {
                                  setMessage({ type: "error", text: "Failed to update" });
                                } finally {
                                  setLoading(false);
                                }
                              }}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setInlineEditingId(null);
                                setInlineEditData({});
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setInlineEditingId(config._id);
                              setInlineEditData(config);
                            }}
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );})}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PricingManagement;
