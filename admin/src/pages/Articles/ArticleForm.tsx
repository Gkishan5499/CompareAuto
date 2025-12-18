import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import client from "../../api/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface ArticleForm {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorBio: string;
  date: string;
  heroImage: string;
  slug: string;
  readingTime: number;
  tags: string;
}

const categories = ["News", "Reviews", "Comparisons", "EVs", "Guides"];

export default function ArticleForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const [form, setForm] = useState<ArticleForm>({
    title: "",
    excerpt: "",
    content: "",
    category: "News",
    author: "",
    authorBio: "",
    date: new Date().toISOString().split("T")[0],
    heroImage: "",
    slug: "",
    readingTime: 5,
    tags: "",
  });

  const handleQuillImage = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "articles/content");
      try {
        const res = await client.post("/api/uploads/single", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const quill = (document.querySelector(".ql-editor") as any)?.__quill;
        const range = quill?.getSelection(true);
        if (range) {
          quill.insertEmbed(range.index, "image", res.data.url);
          quill.setSelection(range.index + 1);
        }
      } catch (err) {
        toast.error("Image upload failed");
      }
    };
  };

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "blockquote", "image"],
        ["clean"],
      ],
      handlers: {
        image: handleQuillImage,
      },
    },
  }), []);

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "link",
    "blockquote",
  ];

  useEffect(() => {
    if (id) {
      const load = async () => {
        try {
          const { data } = await client.get(`/api/articles/${id}`);
          setForm({
            title: data.title || "",
            excerpt: data.excerpt || "",
            content: data.body || "",
            category: data.category || "News",
            author: data.author || "",
            authorBio: data.authorBio || "",
            date: data.date?.split("T")[0] || "",
            heroImage: data.heroImage || "",
            slug: data.slug || "",
            readingTime: data.readingTime || 5,
            tags: (data.tags || []).join(", "),
          });
        } catch (err) {
          toast.error("Failed to load article");
          navigate("/articles");
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      toast.error("Title, excerpt, and content are required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: id || Date.now().toString(),
        title: form.title,
        excerpt: form.excerpt,
        body: form.content,
        category: form.category,
        author: form.author,
        authorBio: form.authorBio,
        date: form.date,
        heroImage: form.heroImage,
        slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-"),
        readingTime: form.readingTime,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      if (id) {
        await client.put(`/api/articles/${id}`, payload);
        toast.success("Article updated");
      } else {
        await client.post(`/api/articles`, payload);
        toast.success("Article created");
      }
      navigate("/articles");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save article");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "articles");

    try {
      setUploadingImage(true);
      const res = await client.post("/api/uploads/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, heroImage: res.data.url }));
      toast.success("Image uploaded to Cloudinary");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">{id ? "Edit Article" : "New Article"}</h1>
        <p className="text-muted-foreground">Create or edit a blog article or news post.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Article title"
                maxLength={200}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 rounded-md border bg-transparent px-3 py-2 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Author name"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorBio">Author Bio</Label>
            <Textarea
              id="authorBio"
              value={form.authorBio}
              onChange={(e) => setForm({ ...form, authorBio: e.target.value })}
              placeholder="Brief description about the author (optional)"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">This will be displayed at the bottom of the article</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Brief summary of the article"
              rows={2}
              maxLength={500}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <ReactQuill
              theme="snow"
              value={form.content}
              onChange={(value) => setForm({ ...form, content: value })}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Write the article content..."
              className="rich-editor"
            />
            <div className="flex items-center gap-2 mt-2">
              <input id="rawToggle" type="checkbox" checked={showRaw} onChange={(e) => setShowRaw(e.target.checked)} />
              <Label htmlFor="rawToggle">Edit raw HTML</Label>
            </div>
            {showRaw && (
              <Textarea
                id="contentRaw"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Article HTML content"
                rows={10}
              />
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heroImage">Hero Image URL</Label>
              <Input
                id="heroImage"
                value={form.heroImage}
                onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">Paste a URL or upload to Cloudinary below.</p>
              <div className="space-y-2">
                <Label htmlFor="heroUpload">Upload to Cloudinary</Label>
                <Input
                  id="heroUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage && <p className="text-xs text-muted-foreground">Uploading...</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="readingTime">Reading Time (mins)</Label>
              <Input
                id="readingTime"
                type="number"
                value={form.readingTime}
                onChange={(e) => setForm({ ...form, readingTime: Number(e.target.value) })}
                min={1}
                max={60}
              />
            </div>
          </div>

          {form.heroImage && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <img src={form.heroImage} alt="Hero preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated from title"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g., Tesla, EV, SUV"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => navigate("/articles")}>
              Cancel
            </Button>
            <Button disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {id ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
