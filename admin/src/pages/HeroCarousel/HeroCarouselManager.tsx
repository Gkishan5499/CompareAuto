import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import DataTable from "@/components/DataTable";
import client from "../../api/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, GripVertical, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HeroImage {
  _id: string;
  id: string;
  title: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  link?: string;
  description?: string;
}

export default function HeroCarouselManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroImage | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    order: 0,
    isActive: true,
    link: "",
    description: "",
  });

  const { data: heroImages = [] } = useQuery({
    queryKey: ["heroCarousel"],
    queryFn: async () => {
      const res = await client.get("/api/hero-carousel");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await client.post("/api/hero-carousel", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroCarousel"] });
      toast.success("Hero image added successfully");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Failed to add hero image");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await client.put(`/api/hero-carousel/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroCarousel"] });
      toast.success("Hero image updated successfully");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Failed to update hero image");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/api/hero-carousel/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroCarousel"] });
      toast.success("Hero image deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete hero image");
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "hero");

    try {
      setUploadingImage(true);
      const res = await client.post("/api/uploads/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData((prev) => ({
        ...prev,
        imageUrl: res.data.url,
      }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenDialog = (item?: HeroImage) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        imageUrl: item.imageUrl,
        order: item.order,
        isActive: item.isActive,
        link: item.link || "",
        description: item.description || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        imageUrl: "",
        order: heroImages.length,
        isActive: true,
        link: "",
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      title: "",
      imageUrl: "",
      order: 0,
      isActive: true,
      link: "",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this hero image?")) {
      deleteMutation.mutate(id);
    }
  };

  const columns = [
    {
      header: "Preview",
      accessorKey: "imageUrl",
      cell: (row: HeroImage) => (
        <div className="w-24 h-16 rounded overflow-hidden bg-muted">
          {row.imageUrl ? (
            <img
              src={row.imageUrl}
              alt={row.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Order",
      accessorKey: "order",
      cell: (row: HeroImage) => (
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span>{row.order}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row: HeroImage) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            row.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "_id",
      cell: (row: HeroImage) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDialog(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Hero Carousel Manager</h2>
          <p className="text-sm text-muted-foreground">
            Manage homepage hero section carousel images
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      <Card className="p-6">
        <DataTable columns={columns} data={heroImages} />
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Hero Image" : "Add Hero Image"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update hero carousel image details"
                : "Add a new image to the hero carousel"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUpload">Upload Image to Cloudinary</Label>
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && (
                <p className="text-sm text-muted-foreground">Uploading to Cloudinary...</p>
              )}
              <p className="text-xs text-muted-foreground">
                Images will be automatically uploaded to Cloudinary CDN
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Cloudinary or Custom) *</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="Cloudinary URL or custom URL"
                required
              />
              {formData.imageUrl && (
                <div className="mt-2 border rounded p-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-48 flex items-center justify-center bg-muted rounded text-muted-foreground">Invalid Image URL</div>';
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link (Optional)</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="/brands/maruti-suzuki"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
