import Papa from "papaparse";
import { useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import client from "../../api/client";
import { toast } from "sonner";

export default function VariantCSVImport() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

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
    setUploading(true); setProgress(0);
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          await client.post('/api/variants/bulk', { data: results.data }, {
            onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / (e.total || 1)))
          });
          toast?.success?.('Variants imported');
        } catch (err:any) {
          console.error(err); toast?.error?.('Import failed');
        } finally { setUploading(false); }
      }
    });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">Import Variants (CSV)</h2>
      <Card className="p-4">
        <div className="border-dashed border-2 rounded p-6 text-center" onDrop={onDrop} onDragOver={(e)=>e.preventDefault()}>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
          <div className="font-medium">Drag & drop CSV here or click to choose</div>
          <div className="text-sm text-muted-foreground mt-1">columns: id,modelId,name,slug,price,fuelType,transmission,engine,mileage,seating,colors</div>
        </div>
        {preview?.length > 0 && (
          <div className="mt-3 overflow-auto max-h-40 border rounded p-2">
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
          <Button onClick={() => fileRef.current?.click()} variant="outline">Choose File</Button>
          <Button onClick={onUpload} disabled={uploading}>Import</Button>
          <div className="flex-1">
            <div className="h-2 bg-gray-100 rounded overflow-hidden">
              <div className="h-2 bg-blue-600" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
