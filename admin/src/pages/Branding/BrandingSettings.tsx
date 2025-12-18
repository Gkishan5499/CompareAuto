import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import client from "../../api/client";
import { toast } from "sonner";
import {Upload } from "lucide-react";

export default function BrandingSettings() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({
    logo: "",
    siteName: "",
    tagline: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await client.get("/api/site-settings");
      const settingsMap: any = {};
      data.forEach((s: any) => {
        settingsMap[s.key] = s.value;
      });
      setSettings({
        logo: settingsMap.logo || "",
        siteName: settingsMap.siteName || "CompareAuto.in",
        tagline: settingsMap.tagline || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "branding");

    try {
      setUploading(true);
      const res = await client.post("/api/uploads/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSettings((prev) => ({ ...prev, logo: res.data.url }));
      toast.success("Logo uploaded");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await client.put("/api/site-settings", {
        key: "logo",
        value: settings.logo,
        type: "image",
        description: "Site logo",
      });
      await client.put("/api/site-settings", {
        key: "siteName",
        value: settings.siteName,
        type: "text",
        description: "Site name",
      });
      await client.put("/api/site-settings", {
        key: "tagline",
        value: settings.tagline,
        type: "text",
        description: "Site tagline",
      });
      toast.success("Branding settings saved");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete logo?")) return;
    try {
      await client.delete("/api/site-settings/logo");
      setSettings((prev) => ({ ...prev, logo: "" }));
      toast.success("Logo deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to delete");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Branding Settings</h1>
        <p className="text-muted-foreground">Manage your site logo, name, and tagline.</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              placeholder="CompareAuto.in"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              placeholder="Compare cars, variants & prices"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              value={settings.logo}
              onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">Paste a URL or upload below.</p>
            <div className="space-y-2">
              <Label htmlFor="logoUpload">Upload Logo to Cloudinary</Label>
              <Input
                id="logoUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
            </div>
          </div>

          {settings.logo && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-muted flex items-center justify-center">
                <img src={settings.logo} alt="Logo preview" className="max-h-32 object-contain" />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            {settings.logo && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete Logo
              </Button>
            )}
            <Button onClick={handleSave}>
              <Upload className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
