import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import client from "../../api/client";
import { useApiCreate, useApiUpdate } from "../../hooks/useapi";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { X, Plus, Loader2 } from "lucide-react";
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

export default function VariantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch, setValue, getValues } = useForm();

  // Image upload state
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  // State for pros/cons and faqs
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [nextFaqId, setNextFaqId] = useState(0);

  const { data: variant } = useQuery({
    queryKey: ["variant", id],
    queryFn: async () => (await client.get(`/api/variants/${id}`)).data,
    enabled: !!id,
  });

  // Populate form when variant data arrives
  useEffect(() => {
    if (variant) {
      reset(variant);

      // Parse pros/cons
      const { pros: parsedPros, cons: parsedCons } = parseProsConsFromString(
        variant.variantProsCons || ""
      );
      setPros(parsedPros);
      setCons(parsedCons);

      // Parse FAQs
      const parsedFaqs = parseFaqsFromString(variant.variantFaqs || "");
      setFaqs(parsedFaqs);
      setNextFaqId(parsedFaqs.length);

      // Handle images
      const imgs: string[] = [];
      if (variant.images && Array.isArray(variant.images)) imgs.push(...variant.images);
      else if (variant.photos && Array.isArray(variant.photos)) imgs.push(...variant.photos);
      else if (variant.image) imgs.push(variant.image);
      setExistingImages(imgs);
    }
  }, [variant, reset]);

  // FAQ handlers at component level
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

  const createHook = useApiCreate(["variants"], "/api/variants");
  const updateHook = useApiUpdate(["variants"], `/api/variants/${id}`);

  const onSubmit = async (form: any) => {
    try {
      const allValues = getValues();

      const payload = {
        ...form,
        heroSectionContent: allValues.heroSectionContent || "",
        variantOverview: allValues.variantOverview || "",
        keyFeaturesSummary: allValues.keyFeaturesSummary || "",
        uniqueVsLowerVariant: allValues.uniqueVsLowerVariant || "",
        engineTransmissionSummary: allValues.engineTransmissionSummary || "",
        featureDifferencesTable: allValues.featureDifferencesTable || "",
        valueForMoneyAnalysis: allValues.valueForMoneyAnalysis || "",
        variantProsCons: combineProsConsToString(pros, cons),
        whoShouldBuy: allValues.whoShouldBuy || "",
        variantFaqs: combineFaqsToString(faqs),
      };

      // If we have file uploads or images removed, use FormData
      if (newFiles.length > 0 || removedImages.length > 0) {
        const fd = new FormData();
        fd.append("data", JSON.stringify(payload));
        newFiles.forEach((file) => fd.append("images", file));
        fd.append("removedImages", JSON.stringify(removedImages));

        if (id) {
          await client.put(`/api/variants/${id}`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Variant updated successfully!");
        } else {
          await client.post(`/api/variants`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Variant created successfully!");
        }
      } else {
        // No files — use existing hooks
        if (id) {
          await updateHook.mutateAsync(payload);
          toast.success("Variant updated successfully!");
        } else {
          await createHook.mutateAsync(payload);
          toast.success("Variant created successfully!");
        }
      }

      navigate("/variants");
    } catch (err: any) {
      console.error("Error saving variant:", err);
      toast.error(err?.response?.data?.message || "Failed to save variant");
    }
  };

  const onFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setNewFiles((prev) => [...prev, ...arr]);
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  const removeNewFile = (idx: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      {updateHook.isPending || createHook.isPending ? (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-100 text-green-800 p-4 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving variant...
        </div>
      ) : null}

      <h1 className="text-2xl font-semibold mb-6 pt-4 md:pt-0">
        {id ? "Edit Variant" : "Add New Variant"}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 pb-32 md:pb-6"
      >
        {/* Basic Info Section */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="variant-id">Variant ID</Label>
              <input
                id="variant-id"
                {...register("id")}
                placeholder="Variant ID"
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="variant-model-id">Model ID</Label>
              <input
                id="variant-model-id"
                {...register("modelId")}
                placeholder="Model ID"
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="variant-name">Name</Label>
              <input
                id="variant-name"
                {...register("name")}
                placeholder="Variant Name"
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="variant-price">Price</Label>
              <input
                id="variant-price"
                {...register("price")}
                placeholder="Price"
                type="number"
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="variant-fuel">Fuel Type</Label>
              <input
                id="variant-fuel"
                {...register("fuelType")}
                placeholder="e.g., Petrol, Diesel"
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="variant-transmission">Transmission</Label>
              <input
                id="variant-transmission"
                {...register("transmission")}
                placeholder="e.g., Manual, Automatic"
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="variant-engine">Engine</Label>
              <input
                id="variant-engine"
                {...register("engine")}
                placeholder="e.g., 1.5L"
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="variant-mileage">Mileage</Label>
              <input
                id="variant-mileage"
                {...register("mileage")}
                placeholder="e.g., 20 kmpl"
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="variant-seating">Seating</Label>
              <input
                id="variant-seating"
                {...register("seating")}
                placeholder="e.g., 5"
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="variant-colors">Colors</Label>
              <input
                id="variant-colors"
                {...register("colors")}
                placeholder="e.g., White, Black, Silver"
                className="border p-2 w-full rounded"
              />
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4">Images</h2>
          <div className="flex items-center gap-3 flex-wrap">
            {existingImages.map((url) => (
              <div key={url} className="relative w-28 h-20 border rounded overflow-hidden">
                <img src={url} alt="variant" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(url)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded px-2 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}

            {newFiles.map((f, i) => (
              <div key={f.name + i} className="relative w-28 h-20 border rounded overflow-hidden">
                <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded px-2 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}

            <label className="w-28 h-20 border rounded flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onFilesSelected(e.target.files)}
                className="hidden"
              />
              <span className="text-xs text-gray-500">Add Images</span>
            </label>
          </div>
        </div>

        {/* Variant Page Content Section */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-4">Variant Page Content</h2>
          <div className="space-y-6 max-h-none overflow-visible">
            {/* Hero Section */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Hero Section ({countWords(watch("heroSectionContent") || "")} words)
              </label>
              <p className="text-xs text-gray-500 mb-2">Variant Price + Key Specs - 100-150 words</p>
              <ReactQuill
                theme="snow"
                value={watch("heroSectionContent") || ""}
                onChange={(value) => setValue("heroSectionContent", value)}
                modules={quillModules}
                placeholder="Enter hero section content"
                className="bg-white"
              />
            </div>

            {/* Variant Overview */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Variant Overview ({countWords(watch("variantOverview") || "")} words)
              </label>
              <p className="text-xs text-gray-500 mb-2">200-300 words</p>
              <ReactQuill
                theme="snow"
                value={watch("variantOverview") || ""}
                onChange={(value) => setValue("variantOverview", value)}
                modules={quillModules}
                placeholder="Enter variant overview"
                className="bg-white"
              />
            </div>

            {/* Key Features Summary */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Key Features Summary ({countWords(watch("keyFeaturesSummary") || "")} words)
              </label>
              <p className="text-xs text-gray-500 mb-2">200-300 words</p>
              <ReactQuill
                theme="snow"
                value={watch("keyFeaturesSummary") || ""}
                onChange={(value) => setValue("keyFeaturesSummary", value)}
                modules={quillModules}
                placeholder="Highlight key features of this variant"
                className="bg-white"
              />
            </div>

            {/* What's Unique vs Lower Variant */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                What's Unique vs Lower Variant ({countWords(watch("uniqueVsLowerVariant") || "")} words)
              </label>
              <p className="text-xs text-gray-500 mb-2">Differentiation vs lower variants</p>
              <ReactQuill
                theme="snow"
                value={watch("uniqueVsLowerVariant") || ""}
                onChange={(value) => setValue("uniqueVsLowerVariant", value)}
                modules={quillModules}
                placeholder="Explain unique selling points vs lower variants"
                className="bg-white"
              />
            </div>

            {/* Engine & Transmission Summary */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Engine & Transmission Summary ({countWords(watch("engineTransmissionSummary") || "")} words)
              </label>
              <p className="text-xs text-gray-500 mb-2">200-300 words</p>
              <ReactQuill
                theme="snow"
                value={watch("engineTransmissionSummary") || ""}
                onChange={(value) => setValue("engineTransmissionSummary", value)}
                modules={quillModules}
                placeholder="Detail engine specs and transmission options"
                className="bg-white"
              />
            </div>

            {/* Feature Differences Table */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Feature Differences Table ({countWords(watch("featureDifferencesTable") || "")} words)
              </label>
              <p className="text-xs text-gray-500 mb-2">Compare features vs other variants</p>
              <ReactQuill
                theme="snow"
                value={watch("featureDifferencesTable") || ""}
                onChange={(value) => setValue("featureDifferencesTable", value)}
                modules={quillModules}
                placeholder="Create feature comparison table in HTML or text format"
                className="bg-white"
              />
            </div>

            {/* Value for Money Analysis */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Value for Money Analysis ({countWords(watch("valueForMoneyAnalysis") || "")} words)
              </label>
              <p className="text-xs text-gray-500 mb-2">200-300 words</p>
              <ReactQuill
                theme="snow"
                value={watch("valueForMoneyAnalysis") || ""}
                onChange={(value) => setValue("valueForMoneyAnalysis", value)}
                modules={quillModules}
                placeholder="Analyze value proposition and pricing"
                className="bg-white"
              />
            </div>

            {/* Pros & Cons */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Variant Pros & Cons</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Pros ({countWords(pros)} words)
                  </label>
                  <Textarea
                    value={pros}
                    onChange={(e) => setPros(e.target.value)}
                    placeholder="List variant strengths and advantages"
                    rows={6}
                    className="border rounded p-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Cons ({countWords(cons)} words)
                  </label>
                  <Textarea
                    value={cons}
                    onChange={(e) => setCons(e.target.value)}
                    placeholder="List any limitations or drawbacks"
                    rows={6}
                    className="border rounded p-2"
                  />
                </div>
              </div>
            </div>

            {/* Who Should Buy This Variant */}
            <div>
              <label className="text-sm font-semibold block mb-2">
                Who Should Buy This Variant ({countWords(watch("whoShouldBuy") || "")} words)
              </label>
              <p className="text-xs text-gray-500 mb-2">Target buyer profile - 200-300 words</p>
              <ReactQuill
                theme="snow"
                value={watch("whoShouldBuy") || ""}
                onChange={(value) => setValue("whoShouldBuy", value)}
                modules={quillModules}
                placeholder="Describe ideal buyers for this variant"
                className="bg-white"
              />
            </div>

            {/* FAQs */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
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
                        className="mb-3 border rounded p-2"
                      />

                      <label className="text-sm font-medium block mb-2">Answer</label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                        placeholder="Enter the answer"
                        rows={3}
                        className="border rounded p-2"
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

        {/* Submit Buttons - Fixed at bottom on mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:relative md:border-t-0 md:bg-transparent md:p-0 md:flex md:justify-between md:gap-3">
          <Button
            type="submit"
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            disabled={updateHook.isPending || createHook.isPending}
          >
            {updateHook.isPending || createHook.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Variant"
            )}
          </Button>
          <Button
            type="button"
            onClick={() => navigate("/variants")}
            variant="outline"
            className="w-full md:w-auto mt-2 md:mt-0"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
