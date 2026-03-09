import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import client from "../../api/client";
import { useApiCreate, useApiUpdate } from "../../hooks/useapi";
import CloudinaryUpload from "../../components/CloudinaryUpload";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { X, Plus, CheckCircle } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// ReactQuill modules configuration
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const countWords = (text: string) => {
  return text?.trim().split(/\s+/).filter(Boolean).length || 0;
};

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const parseProsConsFromString = (raw: string): { pros: string; cons: string } => {
  if (!raw) return { pros: "", cons: "" };
  const parts = raw.split(/\n---\n/);
  return {
    pros: (parts[0] || "").trim(),
    cons: (parts[1] || "").trim(),
  };
};

const combineProsConsToString = (pros: string, cons: string): string => {
  return `${pros.trim()}\n---\n${cons.trim()}`;
};

const parseFaqsFromString = (raw: string): FaqItem[] => {
  if (!raw) return [];
  const blocks = raw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const items: FaqItem[] = [];
  let id = 0;

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const qLine = lines.find((line) => /^q:\s*/i.test(line));
    const aIndex = lines.findIndex((line) => /^a:\s*/i.test(line));

    if (qLine && aIndex >= 0) {
      const question = qLine.replace(/^q:\s*/i, "").trim();
      const answer = lines.slice(aIndex).join("\n").replace(/^a:\s*/i, "").trim();
      if (question && answer) {
        items.push({ id: String(id++), question, answer });
      }
      continue;
    }
  }

  return items;
};

const combineFaqsToString = (faqs: FaqItem[]): string => {
  return faqs
    .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
    .join("\n\n");
};

export default function ModelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch, setValue, getValues } = useForm();
  const [gallery, setGallery] = useState<string[]>([]);
  const [interiorImages, setInteriorImages] = useState<string[]>([]);
  const [exteriorImages, setExteriorImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<any>(null);
  
  // State for pros/cons and faqs
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [nextFaqId, setNextFaqId] = useState(0);

  const { data: model } = useQuery({
    queryKey: ["model", id],
    queryFn: async () => (await client.get(`/api/models/${id}`)).data,
    enabled: !!id,
  });

  // Ensure form fields are populated when model data arrives
  useEffect(() => {
    if (model) {
      reset(model);
      setGallery(model.gallery || []);
      setInteriorImages(model.interiorImages || []);
      setExteriorImages(model.exteriorImages || []);
      setYoutubeUrl(model.youtubeUrl || "");
      setVideoUrl(model.videoUrl || "");
      
      // Parse pros/cons
      const { pros: parsedPros, cons: parsedCons } = parseProsConsFromString(
        model.modelProsCons || ""
      );
      setPros(parsedPros);
      setCons(parsedCons);

      // Parse FAQs
      const parsedFaqs = parseFaqsFromString(model.modelFaqs || "");
      setFaqs(parsedFaqs);
      setNextFaqId(parsedFaqs.length);
    }
  }, [model, reset]);
  


  const createModel = useApiCreate(["models"], "/api/models");
  const updateModel = useApiUpdate(["models"], `/api/models/${id}`);

  const imageFile = watch("imageFile");

  useEffect(() => {
    let url: string | undefined;
    if (imageFile && imageFile.length > 0) url = URL.createObjectURL(imageFile[0]);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  const onSubmit = async (form: any) => {
    // Get all form values including Quill editors
    const allValues = getValues();
    
    // handle image upload
    if (form.imageFile?.[0]) {
      const fd = new FormData();
      fd.append("file", form.imageFile[0]);

      const uploadRes = await client.post("/api/uploads", fd);
      form.image = uploadRes.data.url;
    }

    // handle video file upload
    if (form.videoFile?.[0]) {
      const fd = new FormData();
      fd.append("file", form.videoFile[0]);

      const uploadRes = await client.post("/api/uploads", fd);
      form.videoUrl = uploadRes.data.url;
    }

    // attach gallery from Cloudinary uploads
    form.gallery = gallery;
    form.interiorImages = interiorImages;
    form.exteriorImages = exteriorImages;
    form.youtubeUrl = youtubeUrl;
    form.videoUrl = videoUrl || form.videoUrl;
    if (!form.image && gallery.length > 0) {
      form.image = gallery[0];
    }

    // Include all content fields
    form.heroSectionContent = allValues.heroSectionContent || "";
    form.modelOverview = allValues.modelOverview || "";
    form.variantLineup = allValues.variantLineup || "";
    form.engineTransmission = allValues.engineTransmission || "";
    form.mileageExplanation = allValues.mileageExplanation || "";
    form.featuresHighlight = allValues.featuresHighlight || "";
    form.safetyOverview = allValues.safetyOverview || "";
    form.interiorOverview = allValues.interiorOverview || "";
    form.exteriorOverview = allValues.exteriorOverview || "";
    form.rideHandling = allValues.rideHandling || "";
    form.ownershipCost = allValues.ownershipCost || "";
    form.modelProsCons = combineProsConsToString(pros, cons);
    form.competitorsSection = allValues.competitorsSection || "";
    form.expertVerdict = allValues.expertVerdict || "";
    form.modelFaqs = combineFaqsToString(faqs);

    delete form.imageFile;
    delete form.videoFile;

    if (id) {
      updateModel.mutate(form, {
        onSuccess: () => {
          toast.success("Model updated successfully!");
          setShowPreview(true);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to update model");
        },
      });
    } else {
      createModel.mutate(form, {
        onSuccess: () => {
          toast.success("Model created successfully!");
          setShowPreview(true);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to create model");
        },
      });
    }

    setLastSavedData(form);
  };

  // FAQ handlers
  const addFaq = () => {
    setFaqs([...faqs, { id: String(nextFaqId), question: "", answer: "" }]);
    setNextFaqId(nextFaqId + 1);
  };

  const removeFaq = (faqId: string) => {
    setFaqs(faqs.filter((f) => f.id !== faqId));
  };

  const updateFaq = (
    faqId: string,
    field: "question" | "answer",
    value: string
  ) => {
    setFaqs(
      faqs.map((f) => (f.id === faqId ? { ...f, [field]: value } : f))
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-6">{id ? "Edit Model" : "Add New Model"}</h1>

      {/* Success Preview - Fixed at Top */}
      {showPreview && lastSavedData && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-emerald-50 border-b-2 border-emerald-300 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-semibold text-emerald-900">✓ Model Saved Successfully!</h3>
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                onClick={() => setShowPreview(false)}
                variant="outline"
                size="sm"
                className="text-emerald-700 border-emerald-300 hover:bg-emerald-100"
              >
                Hide Preview
              </Button>
              <Button 
                type="button" 
                onClick={() => navigate("/models")}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Back to Models
              </Button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${showPreview ? 'pt-20' : ''}`}>
        {/* Basic Info Section */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="model-id">Model ID *</Label>
              <input id="model-id" {...register("id")} placeholder="Model ID" className="border p-2 w-full rounded" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="model-name">Model Name *</Label>
              <input id="model-name" {...register("name")} placeholder="Model Name" className="border p-2 w-full rounded" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="model-brand-id">Brand ID *</Label>
              <input id="model-brand-id" {...register("brandId")} placeholder="Brand ID" className="border p-2 w-full rounded" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="model-brand-name">Brand Name *</Label>
              <input id="model-brand-name" {...register("brandName")} placeholder="Brand Name" className="border p-2 w-full rounded" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="model-body-type">Body Type</Label>
              <input id="model-body-type" {...register("bodyType")} placeholder="Body Type" className="border p-2 w-full rounded" />
            </div>
          </div>
        </div>

        {/* Gallery Upload */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4">Gallery & Images</h2>
          
          {/* Car Images (General Gallery) */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-3">Car Images</h3>
            <div className="border rounded p-3 mb-4">
              <CloudinaryUpload value={gallery} onChange={setGallery} maxFiles={30} />
              <p className="text-xs text-gray-500 mt-2">
                Upload up to 30 images. First image becomes the hero image on the site. <br/>
                You can reorder images by dragging or using the move buttons on hover.
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="model-image">Hero Image</Label>
              <input id="model-image" type="file" {...register("imageFile")} className="border p-2 w-full rounded" />
            </div>
            {watch("imageFile")?.length > 0 && <img src={URL.createObjectURL(watch("imageFile")[0])} alt="preview" className="h-24 mt-2 rounded" />}
          </div>

          {/* Interior Images */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-3">Interior Images ({interiorImages.length}/10)</h3>
            <div className="border rounded p-3 mb-4">
              <CloudinaryUpload value={interiorImages} onChange={setInteriorImages} maxFiles={10} />
              <p className="text-xs text-gray-500 mt-2">
                Upload up to 10 interior images. These showcase the car's interior design and features. <br/>
                You can reorder images by dragging or using the move buttons on hover.
              </p>
            </div>
          </div>

          {/* Exterior Images */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-3">Exterior Images ({exteriorImages.length}/10)</h3>
            <div className="border rounded p-3">
              <CloudinaryUpload value={exteriorImages} onChange={setExteriorImages} maxFiles={10} />
              <p className="text-xs text-gray-500 mt-2">
                Upload up to 10 exterior images. These showcase the car's design and features from outside. <br/>
                You can reorder images by dragging or using the move buttons on hover.
              </p>
            </div>
          </div>

          {/* YouTube URL */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-3">YouTube Link</h3>
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube Video URL</Label>
              <input
                id="youtube-url"
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="border p-2 w-full rounded"
              />
              <p className="text-xs text-gray-500">
                Paste a YouTube video URL to embed on the model page. Optional.
              </p>
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <h3 className="text-base font-semibold mb-3">Video Upload</h3>
            <div className="border rounded p-3">
              <Label htmlFor="video-file">Upload Video File</Label>
              <input
                id="video-file"
                type="file"
                accept="video/*"
                {...register("videoFile")}
                className="border p-2 w-full rounded mt-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                Upload a video file to display on the model page. Supported formats: MP4, WebM, Ogg. Optional.
              </p>
            </div>
          </div>
        </div>

        {/* Model Page Content Section */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4">Model Page Content</h2>
          <div className="space-y-6 max-h-none overflow-visible">
            {/* Hero Section */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Hero Section ({countWords(watch("heroSectionContent") || "")} words)
              </label>
              <ReactQuill
                theme="snow"
                value={watch("heroSectionContent") || ""}
                onChange={(value) => setValue("heroSectionContent", value)}
                modules={quillModules}
                placeholder="Price, Rating, Quick Specs - 100-150 words"
                className="bg-white"
              />
            </div>

            {/* Model Overview */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Model Overview ({countWords(watch("modelOverview") || "")} words)
              </label>
              <ReactQuill
                theme="snow"
                value={watch("modelOverview") || ""}
                onChange={(value) => setValue("modelOverview", value)}
                modules={quillModules}
                placeholder="Short Intro - 120-150 words"
                className="bg-white"
              />
            </div>

            {/* Variant Lineup */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Variant Lineup & Price Table ({countWords(watch("variantLineup") || "")} words)
              </label>
              <ReactQuill
                theme="snow"
                value={watch("variantLineup") || ""}
                onChange={(value) => setValue("variantLineup", value)}
                modules={quillModules}
                placeholder="250-350 words"
                className="bg-white"
              />
            </div>

            {/* Engine & Transmission */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Engine & Transmission Overview ({countWords(watch("engineTransmission") || "")} words)
              </label>
              <ReactQuill
                theme="snow"
                value={watch("engineTransmission") || ""}
                onChange={(value) => setValue("engineTransmission", value)}
                modules={quillModules}
                placeholder="300-400 words"
                className="bg-white"
              />
            </div>

            {/* Mileage Explanation */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Mileage Explanation ({countWords(watch("mileageExplanation") || "")} words)
              </label>
              <ReactQuill
                theme="snow"
                value={watch("mileageExplanation") || ""}
                onChange={(value) => setValue("mileageExplanation", value)}
                modules={quillModules}
                placeholder="150-250 words"
                className="bg-white"
              />
            </div>

            {/* Features Highlight */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Features Highlight ({countWords(watch("featuresHighlight") || "")} words)
              </label>
              <ReactQuill
                theme="snow"
                value={watch("featuresHighlight") || ""}
                onChange={(value) => setValue("featuresHighlight", value)}
                modules={quillModules}
                placeholder="300-400 words"
                className="bg-white"
              />
            </div>

            {/* Safety Overview */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Safety Overview ({countWords(watch("safetyOverview") || "")} words)
              </label>
              <ReactQuill
                theme="snow"
                value={watch("safetyOverview") || ""}
                onChange={(value) => setValue("safetyOverview", value)}
                modules={quillModules}
                placeholder="200-300 words"
                className="bg-white"
              />
            </div>

            {/* Interior Overview */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Interior Overview ({countWords(watch("interiorOverview") || "")} words)
              </label>
              <ReactQuill
                theme="snow"
                value={watch("interiorOverview") || ""}
                onChange={(value) => setValue("interiorOverview", value)}
                modules={quillModules}
                placeholder="250-350 words"
                className="bg-white"
              />
            </div>

            {/* Exterior Overview */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Exterior Overview ({countWords(watch("exteriorOverview") || "")} words)
              </label>
              <ReactQuill
                theme="snow"
                value={watch("exteriorOverview") || ""}
                onChange={(value) => setValue("exteriorOverview", value)}
                modules={quillModules}
                placeholder="250-350 words"
                className="bg-white"
              />
            </div>

            {/* Ride & Handling */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Ride & Handling ({countWords(watch("rideHandling") || "")} words)
              </label>
              <ReactQuill
                theme="snow"
                value={watch("rideHandling") || ""}
                onChange={(value) => setValue("rideHandling", value)}
                modules={quillModules}
                placeholder="200-300 words"
                className="bg-white"
              />
            </div>

            {/* Ownership Cost */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Ownership Cost Insight ({countWords(watch("ownershipCost") || "")} words)
              </label>
              <ReactQuill
                theme="snow"
                value={watch("ownershipCost") || ""}
                onChange={(value) => setValue("ownershipCost", value)}
                modules={quillModules}
                placeholder="250-350 words"
                className="bg-white"
              />
            </div>

            {/* Pros & Cons - Two Column */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Model Pros & Cons</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm block mb-1">
                    Pros ({countWords(pros)} words)
                  </label>
                  <Textarea
                    value={pros}
                    onChange={(e) => setPros(e.target.value)}
                    placeholder="List model strengths and advantages"
                    rows={5}
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">
                    Cons ({countWords(cons)} words)
                  </label>
                  <Textarea
                    value={cons}
                    onChange={(e) => setCons(e.target.value)}
                    placeholder="List any limitations or drawbacks"
                    rows={5}
                  />
                </div>
              </div>
            </div>

            {/* Competitors Section */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Competitors Section ({countWords(watch("competitorsSection") || "")} words)
              </label>
              <ReactQuill
                theme="snow"
                value={watch("competitorsSection") || ""}
                onChange={(value) => setValue("competitorsSection", value)}
                modules={quillModules}
                placeholder="200-300 words"
                className="bg-white"
              />
            </div>

            {/* Expert Verdict */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Expert Verdict ({countWords(watch("expertVerdict") || "")} words)
              </label>
              <ReactQuill
                theme="snow"
                value={watch("expertVerdict") || ""}
                onChange={(value) => setValue("expertVerdict", value)}
                modules={quillModules}
                placeholder="200-300 words"
                className="bg-white"
              />
            </div>

            {/* FAQs - Dynamic Form */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold">FAQs ({faqs.length})</h3>
                  <p className="text-xs text-gray-500 mt-1">Add as many FAQs as needed</p>
                </div>
                <Button
                  type="button"
                  onClick={addFaq}
                  size="sm"
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" /> Add FAQ
                </Button>
              </div>

              {faqs.length > 0 ? (
                <div className="space-y-4 max-h-none overflow-visible">
                  {faqs.map((faq, index) => (
                    <div key={faq.id} className="border rounded-lg p-4 bg-slate-50">
                      <div className="flex justify-between items-start mb-3">
                        <label className="text-sm font-medium">Question {index + 1}</label>
                        <button
                          type="button"
                          onClick={() => removeFaq(faq.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <Textarea
                        value={faq.question}
                        onChange={(e) =>
                          updateFaq(faq.id, "question", e.target.value)
                        }
                        placeholder="Enter the question"
                        rows={2}
                        className="mb-3"
                      />

                      <label className="text-sm font-medium block mb-2">Answer</label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                        placeholder="Enter the answer"
                        rows={3}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 mb-3">
                  No FAQs added yet. Click "Add FAQ" to create one.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2">
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={updateModel.isPending || createModel.isPending}
          >
            {updateModel.isPending || createModel.isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {id ? "Updating..." : "Creating..."}
              </>
            ) : (
              id ? "Update Model" : "Create Model"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/models")}
            disabled={updateModel.isPending || createModel.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
