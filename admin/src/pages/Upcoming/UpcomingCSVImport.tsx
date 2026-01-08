import Papa from "papaparse";
import { useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import client from "../../api/client";
import { toast } from "sonner";
import { Download, CheckCircle, AlertCircle } from "lucide-react";

export default function UpcomingCSVImport() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<any>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
      complete: async (results) => {
        setPreview(results.data as any[]);
      }
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const onUpload = async () => {
    if (!selectedFile) return toast?.error?.("No file selected");
    try {
      setUploading(true); setProgress(0);
      const form = new FormData();
      form.append("file", selectedFile);
      const res = await client.post('/api/upcoming-cars/upload-csv', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / (e.total || 1)))
      });
      const summary = res?.data;
      setUploadResults(summary);
      toast?.success?.(`Processed ${summary?.processed || 0} of ${summary?.total || 0}`);
    } catch (err:any) {
      console.error(err); toast?.error?.(err?.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  const downloadTemplate = () => {
    const template = `Brand,Model,Segment,Body Type,Powertrain (expected),Expected Launch (Month/Year),Expected Ex-Showroom Price (₹),Notes
Mahindra,Thar 5-Door,SUV,SUV,Petrol / Diesel,August 2025,15,00,000 - 22,00,000,5-door with terrain modes
Toyota,Fortuner Facelift,SUV,SUV,Diesel / Hybrid,July 2025,35,00,000 - 50,00,000,Refreshed design
Kia,EV6 GT,Electric,SUV,EV,September 2025,60,00,000 - 65,00,000,Performance electric SUV`;
    
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(template);
    link.download = 'upcoming-cars-template.csv';
    link.click();
  };

  return (
    <div className="space-y-3 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Import Upcoming Cars (CSV)</h2>
        <Button onClick={downloadTemplate} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>
      <Card className="p-4">
        <div className="border-dashed border-2 rounded p-6 text-center" onDrop={onDrop} onDragOver={(e)=>e.preventDefault()}>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
          <div className="font-medium">Drag & drop CSV here or click to choose</div>
          <div className="text-sm text-muted-foreground mt-1">
            columns: Brand, Model, Segment, Body Type, Powertrain (expected), Expected Launch (Month/Year), Expected Ex-Showroom Price (₹), Notes
          </div>
          <Button onClick={() => fileRef.current?.click()} variant="outline" className="mt-3">Choose File</Button>
        </div>
        {preview?.length > 0 && (
          <div className="mt-3 overflow-auto max-h-48 border rounded p-2">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  {Object.keys(preview[0]).slice(0, 8).map((h) => <th key={h} className="pr-4">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i}>
                    {Object.values(r).slice(0, 8).map((v, j) => <td key={j} className="pr-4">{String(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex gap-2 mt-3 items-center">
          <Button onClick={onUpload} disabled={uploading}>Upload</Button>
          <div className="flex-1">
            <div className="h-2 bg-gray-100 rounded overflow-hidden">
              <div className="h-2 bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {uploadResults && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-950">
          <h3 className="font-semibold mb-4 text-lg">Upload Summary</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-white dark:bg-slate-900 rounded border">
              <div className="text-2xl font-bold text-blue-600">{uploadResults.total}</div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded border">
              <div className="text-2xl font-bold text-green-600">{uploadResults.processed}</div>
              <div className="text-sm text-muted-foreground">Processed</div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded border">
              <div className="text-2xl font-bold text-orange-600">
                {uploadResults.results?.filter((r: any) => r.status === 'skipped').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Skipped</div>
            </div>
          </div>

          {uploadResults.results && uploadResults.results.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadResults.results.map((result: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-2 bg-white dark:bg-slate-900 rounded text-sm">
                  {result.status === 'created' && (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  )}
                  {result.status === 'updated' && (
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  )}
                  {result.status === 'skipped' && (
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{result.name || result.modelName}</div>
                    <div className="text-xs text-muted-foreground">
                      {result.status === 'created' && '✓ Created'}
                      {result.status === 'updated' && '◆ Updated'}
                      {result.status === 'skipped' && `⚠ ${result.reason}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
