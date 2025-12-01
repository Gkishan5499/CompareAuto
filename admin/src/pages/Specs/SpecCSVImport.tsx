// admin/src/pages/Specs/SpecsCSVImport.tsx
import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import client from "../../api/client"; // your axios or fetch wrapper
import { toast } from "sonner"; // optional

export default function SpecsCSVImport() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [customPaths, setCustomPaths] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setSelectedFile(f);
    // Preview first 5 rows (optional)
    Papa.parse(f, {
      header: true,
      preview: 5,
      skipEmptyLines: true,
      complete: (res) => {
        setPreviewRows(res.data as any[]);
      }
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      // parse preview
      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        preview: 5,
        skipEmptyLines: true,
        complete: (res: Papa.ParseResult<Record<string, unknown>>) => {
          const data = res.data ?? [];
          setPreviewRows(data as any[]);
          // auto-suggest mapping keys for common columns
          const suggested: Record<string, string> = {};
          const known = [
            "brand","model","variant","variant_id","engine_cc","mileage","fuel_type","transmission","price",
            "ex_showroom_price","vehicle_overview","vehicle_warranty","battery_warranty","hero","gallery",
            "length_mm","width_mm","height_mm","wheelbase_mm","ground_clearance_mm","kerb_weight_kg","gross_weight_kg",
            "ncap_rating","airbags","abs","ebd","esp","traction_control","hill_hold_control","seat_upholstery",
            "infotainment_screen","android_auto","apple_carplay","ota_updates","average_fuel_consumption","distance_to_empty"
          ];
          if (data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
            Object.keys(data[0]).forEach(k => {
              const low = String(k).toLowerCase();
              if (known.includes(low)) suggested[k] = low;
            });
          }
          setMapping(suggested);
        }
      });
    }
  }, []);
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); };

  const handleUpload = async () => {
    if (!selectedFile && !fileRef.current?.files?.[0]) {
      alert("Please choose a CSV file");
      return;
    }
    const f = selectedFile || fileRef.current!.files![0];
    setUploading(true);
    setReport(null);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append("file", f);
      // Build mapping object to send (resolve any __custom__ placeholders)
      const mappingToSend: Record<string, string> = {};
      Object.entries(mapping).forEach(([k, v]) => {
        if (!v) return;
        if (v === "__custom__") {
          if (customPaths[k]) mappingToSend[k] = customPaths[k];
        } else {
          mappingToSend[k] = v;
        }
      });
      // Send mapping as JSON string if available
      if (Object.keys(mappingToSend).length) fd.append("mapping", JSON.stringify(mappingToSend));
      // Post to backend (ensure token is attached by your client)
      const res = await client.post("/api/specs-csv/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const p = Math.round((e.loaded * 100) / (e.total || 1));
          setProgress(p);
        }
      });
      setReport(res.data.report);
      setProgress(100);
      toast?.success?.("Import completed");
    } catch (err: any) {
      console.error("Upload failed", err);
      toast?.error?.("Import failed: " + (err?.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Import Full CarSpecs (CSV)</h2>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Upload CSV</label>
            <div
              className={`border-dashed border-2 rounded p-6 text-center cursor-pointer ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileRef.current?.click()}
            >
              <input type="file" accept=".csv,text/csv" ref={fileRef} onChange={onFileChange} className="hidden" />
              <div className="text-sm font-medium">Drag & drop a CSV file here or click to choose</div>
              <div className="text-xs text-muted-foreground mt-1">CSV must contain brand, model, variant, variant_id (optional), and spec columns</div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">CSV must contain columns like brand, model, variant, variant_id (optional), and full specs columns. See sample below.</p>
          </div>

          {previewRows.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Preview (first 5 rows)</h4>
              <div className="overflow-auto max-h-40 border rounded p-2">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      {Object.keys(previewRows[0]).slice(0, 8).map((h) => <th key={h} className="pr-4">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((r, i) => (
                      <tr key={i}>
                        {Object.values(r).slice(0, 8).map((v, j) => <td key={j} className="pr-4">{String(v)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Column mapping */}
          {previewRows.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Column Mapping (optional)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(previewRows[0]).map((col) => (
                  <div key={col} className="flex items-center gap-2">
                    <div className="font-mono text-xs w-40 truncate">{col}</div>
                    <div className="flex-1 flex gap-2">
                      <select value={mapping[col] || ""} onChange={(e) => {
                        const v = e.target.value;
                        if (v === "__custom__") {
                          setMapping(prev => ({ ...prev, [col]: "__custom__" }));
                        } else {
                          // if the value is a known mapping, set it and clear custom path
                          setCustomPaths(prev => { const p = { ...prev }; delete p[col]; return p; });
                          setMapping(prev => ({ ...prev, [col]: v }));
                        }
                      }} className="flex-1 bg-white border rounded p-2 text-sm">
                      <option value="">(auto / leave blank)</option>
                      <option value="brand">brand</option>
                      <option value="model">model</option>
                      <option value="variant">variant</option>
                      <option value="variant_id">variant_id</option>
                      <option value="description">description</option>
                      <option value="summary">summary</option>
                      <option value="engine_cc">engine_cc</option>
                      <option value="engine_type">engine_type</option>
                      <option value="cylinders">cylinders</option>
                      <option value="turbocharger">turbocharger</option>
                      <option value="hybrid">hybrid</option>
                      <option value="mileage">mileage</option>
                      <option value="driving_range">driving_range</option>
                      <option value="gears">gears</option>
                      <option value="fuel_type">fuel_type</option>
                      <option value="transmission">transmission</option>
                      <option value="seating_capacity">seating_capacity</option>
                      <option value="length_mm">length_mm</option>
                      <option value="width_mm">width_mm</option>
                      <option value="height_mm">height_mm</option>
                      <option value="wheelbase_mm">wheelbase_mm</option>
                      <option value="ground_clearance_mm">ground_clearance_mm</option>
                      <option value="kerb_weight_kg">kerb_weight_kg</option>
                      <option value="gross_weight_kg">gross_weight_kg</option>
                      <option value="ncap_rating">ncap_rating</option>
                      <option value="airbags">airbags</option>
                      <option value="abs">abs</option>
                      <option value="ebd">ebd</option>
                      <option value="esp">esp</option>
                      <option value="traction_control">traction_control</option>
                      <option value="hill_hold_control">hill_hold_control</option>
                      <option value="infotainment_screen">infotainment_screen</option>
                      <option value="speakers">speakers</option>
                      <option value="android_auto">android_auto</option>
                      <option value="apple_carplay">apple_carplay</option>
                      <option value="bluetooth">bluetooth</option>
                      <option value="wireless_charger">wireless_charger</option>
                      <option value="ota_updates">ota_updates</option>
                      <option value="headlights">headlights</option>
                      <option value="taillights">taillights</option>
                      <option value="fog_lights">fog_lights</option>
                      <option value="interior_colors">interior_colors</option>
                      <option value="seat_upholstery">seat_upholstery</option>
                      <option value="rear_ac">rear_ac</option>
                      <option value="driver_seat_adjust">driver_seat_adjust</option>
                      <option value="passenger_seat_adjust">passenger_seat_adjust</option>
                      <option value="rear_seat_adjust">rear_seat_adjust</option>
                      <option value="vehicle_warranty">vehicle_warranty</option>
                      <option value="battery_warranty">battery_warranty</option>
                      <option value="hero">hero</option>
                      <option value="gallery">gallery</option>
                      <option value="vehicle_overview">vehicle_overview</option>
                      <option value="ex_showroom_price">ex_showroom_price</option>
                      <option value="ex_showroom_price_1">ex_showroom_price_1</option>
                      <option value="exterior_design">exterior_design</option>
                      <option value="sunroof">sunroof</option>
                      <option value="spoiler">spoiler</option>
                      <option value="roof_rails">roof_rails</option>
                      <option value="grille">grille</option>
                      <option value="bumpers">bumpers</option>
                      <option value="antenna">antenna</option>
                      <option value="seatbelt_type">seatbelt_type</option>
                      <option value="speed_assist_system">speed_assist_system</option>
                      <option value="skid_plates">skid_plates</option>
                      <option value="overspeed_warning">overspeed_warning</option>
                      <option value="rear_middle_three_point_seatbelt">rear_middle_three_point_seatbelt</option>
                      <option value="rear_middle_head_rest">rear_middle_head_rest</option>
                      <option value="front_ac">front_ac</option>
                      <option value="heater">heater</option>
                      <option value="keyless_start_button_start">keyless_start_button_start</option>
                      <option value="electronic_parking_brake">electronic_parking_brake</option>
                      <option value="tyre_inflator">tyre_inflator</option>
                      <option value="cabin_boot_access">cabin_boot_access</option>
                      <option value="headlight_height_adjuster">headlight_height_adjuster</option>
                      <option value="automatic_headlamps">automatic_headlamps</option>
                      <option value="stop_lamp">stop_lamp</option>
                      <option value="reading_lamp">reading_lamp</option>
                      <option value="average_fuel_consumption">average_fuel_consumption</option>
                      <option value="distance_to_empty">distance_to_empty</option>
                      <option value="low_fuel_level_warning">low_fuel_level_warning</option>
                      <option value="speedometer">speedometer</option>
                      <option value="instrument_cluster_screen_type">instrument_cluster_screen_type</option>
                      <option value="bottle_holder_in_doors">bottle_holder_in_doors</option>
                      <option value="cup_holders_position">cup_holders_position</option>
                      <option value="bootspace">bootspace</option>
                      <option value="warranty_coverage">warranty_coverage</option>
                      <option value="wheels">wheels</option>
                      <option value="body_colours">body_colours</option>
                      <option value="number_of_rows">number_of_rows</option>
                      <option value="number_of_doors">number_of_doors</option>
                      <option value="tyre_size">tyre_size</option>
                      <option value="front_suspension">front_suspension</option>
                      <option value="rear_suspension">rear_suspension</option>
                      <option value="front_brakes">front_brakes</option>
                      <option value="rear_brakes">rear_brakes</option>
                      <option value="steering_type">steering_type</option>
                      <option value="power_windows">power_windows</option>
                      <option value="ventilated_seats">ventilated_seats</option>
                      <option value="ventilated_seat_type">ventilated_seat_type</option>
                      <option value="ambient_interior_lighting">ambient_interior_lighting</option>
                      <option value="follow_me_home_headlamps">follow_me_home_headlamps</option>
                      <option value="puddle_lamps">puddle_lamps</option>
                      <option value="anti_theft_immobilisation">anti_theft_immobilisation</option>
                      <option value="remote_engine_start_stop">remote_engine_start_stop</option>
                      <option value="remote_parking_with_key">remote_parking_with_key</option>
                      <option value="remote_ac_on_off_via_app">remote_ac_on_off_via_app</option>
                      <option value="digital_key">digital_key</option>
                      <option value="logo">logo</option>
                      <option value="country">country</option>
                      <option value="__custom__">Other / custom path</option>
                      </select>
                      {mapping[col] === "__custom__" && (
                        <input
                          className="flex-1 border rounded p-2 text-sm"
                          placeholder="Enter nested path e.g. engine.max_power"
                          value={customPaths[col] || ''}
                          onChange={(e) => {
                            const path = e.target.value;
                            setCustomPaths(prev => ({ ...prev, [col]: path }));
                            // mark this column as using a custom mapping, but do not replace the mapping value
                            setMapping(prev => ({ ...prev, [col]: "__custom__" }));
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <Button onClick={() => fileRef.current?.click()} variant="outline">Choose file</Button>
            <Button onClick={handleUpload} disabled={uploading || !fileName}>{uploading ? "Uploading..." : "Upload & Import"}</Button>
            <div className="w-48">
              <div className="h-2 w-full bg-gray-100 rounded mt-2 overflow-hidden">
                <div className="h-2 bg-blue-600 rounded" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Upload progress: {progress}%</div>
            </div>
          </div>

          {report && (
            <div className="mt-4">
              <h4 className="font-medium">Import Report</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 border rounded text-center">
                  <div className="font-bold text-lg">{report?.totalRows ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Total rows</div>
                </div>
                <div className="p-3 border rounded text-center">
                  <div className="font-bold text-lg">{report?.createdBrands ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Brands created</div>
                </div>
                <div className="p-3 border rounded text-center">
                  <div className="font-bold text-lg">{report?.createdModels ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Models created</div>
                </div>
                <div className="p-3 border rounded text-center">
                  <div className="font-bold text-lg">{report?.createdVariants ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Variants created</div>
                </div>
                <div className="p-3 border rounded text-center">
                  <div className="font-bold text-lg">{report?.createdSpecs ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Specs created</div>
                </div>
                <div className="p-3 border rounded text-center">
                  <div className="font-bold text-lg">{report?.updatedSpecs ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Specs updated</div>
                </div>
                <div className="p-3 border rounded text-center">
                  <div className="font-bold text-lg">{report?.failed ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Failed rows</div>
                </div>
                <div className="p-3 border rounded text-center">
                  <div className="font-bold text-lg">{report?.errors?.length ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Errors</div>
                </div>
              </div>
              {report?.errors?.length > 0 && (
                <div className="mt-3 bg-red-50 border rounded p-3 text-sm text-red-700">
                  <strong>Errors:</strong>
                  <ul className="list-disc ml-5 mt-1 max-h-40 overflow-auto">
                    {report.errors.map((e: any, i: number) => <li key={i}>{e.row ? `Row ${e.row}: ` : ""}{e.reason}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="mb-2 font-medium">Sample CSV Header (required/important fields)</h4>
        <div className="text-sm text-muted-foreground">
          <pre>
            brand,model,variant,variant_id,fuel_type,engine_cc,engine_type,mileage,transmission,body_type,seating_capacity,price,infotainment_screen,android_auto,apple_carplay,vehicle_warranty,battery_warranty,hero,gallery
          </pre>
        </div>
        <p className="text-xs text-muted-foreground mt-2">You can include many more columns — the server will map columns to nested spec keys if mapping exists. Extend mapping on server side to handle custom column names.</p>
      </Card>
    </div>
  );
}
