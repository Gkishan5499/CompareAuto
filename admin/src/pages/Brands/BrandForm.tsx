import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import client from "../../api/client";
import { useQuery } from "@tanstack/react-query";
import { useApiCreate, useApiUpdate } from "../../hooks/useapi";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { X, Plus, ChevronDown, CheckCircle } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// 1. Define the shape of your form data
interface BrandFormValues {
  id: string;
  name: string;
  country: string;
  logo: string;
  logoFile?: FileList; // For the file input
  heroIntro?: string;
  latestUpcomingIntro?: string;
  bodyTypeSectionIntro?: string;
  budgetSectionIntro?: string;
  brandOverview?: string;
  brandPositioning?: string;
  warrantyServiceNetwork?: string;
  brandProsCons?: string;
  brandHistory?: string;
  brandFaqs?: string;
}

const countWords = (text: string) => {
  return text?.trim().split(/\s+/).filter(Boolean).length || 0;
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

const combineFaqsToString = (faqs: FaqItem[]): string => {
  return faqs
    .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
    .join("\n\n");
};

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

export default function BrandForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 2. Pass the interface to useForm for type safety
  const { register, handleSubmit, reset, watch, setValue, getValues } = useForm<BrandFormValues>({
    mode: "onChange"
  });

  // State for pros/cons and faqs
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [nextFaqId, setNextFaqId] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<(BrandFormValues & { brandProsCons?: string; brandFaqs?: string }) | null>(null);

  // 3. Fetch Data (Removed onSuccess)
  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ["brand", id],
    queryFn: async () => {
      // Typed response
      const res = await client.get<BrandFormValues>(`/api/brands/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // 4. Use useEffect to populate form when data arrives
  useEffect(() => {
    if (isSuccess && data) {
      console.log("=== FETCHED BRAND DATA ===");
      console.log("Full data:", data);
      console.log("heroIntro:", data.heroIntro);
      console.log("brandOverview:", data.brandOverview);
      console.log("brandPositioning:", data.brandPositioning);
      console.log("warrantyServiceNetwork:", data.warrantyServiceNetwork);
      console.log("brandProsCons:", data.brandProsCons);
      console.log("brandHistory:", data.brandHistory);
      console.log("brandFaqs:", data.brandFaqs);
      console.log("========================");
      
      reset({
        id: data.id,
        name: data.name,
        country: data.country,
        logo: data.logo,
        heroIntro: data.heroIntro || "",
        latestUpcomingIntro: data.latestUpcomingIntro || "",
        bodyTypeSectionIntro: data.bodyTypeSectionIntro || "",
        budgetSectionIntro: data.budgetSectionIntro || "",
        brandOverview: data.brandOverview || "",
        brandPositioning: data.brandPositioning || "",
        warrantyServiceNetwork: data.warrantyServiceNetwork || "",
        brandProsCons: data.brandProsCons || "",
        brandHistory: data.brandHistory || "",
        brandFaqs: data.brandFaqs || "",
      }, { 
        keepDefaultValues: false 
      });

      // Parse pros/cons
      const { pros: parsedPros, cons: parsedCons } = parseProsConsFromString(
        data.brandProsCons || ""
      );
      setPros(parsedPros);
      setCons(parsedCons);

      // Parse FAQs
      const parsedFaqs = parseFaqsFromString(data.brandFaqs || "");
      setFaqs(parsedFaqs);
      setNextFaqId(parsedFaqs.length);
    }
  }, [isSuccess, data, reset]);

  const createHook = useApiCreate(["brands"], "/api/brands");
  const updateHook = useApiUpdate(["brands"], `/api/brands/${id}`);

  // 5. Type the submit handler
  const onSubmit: SubmitHandler<BrandFormValues> = async (formData) => {
    // Manually collect all form values since we're using controlled components
    const allValues = getValues();
    
    console.log("=== FORM SUBMISSION ===");
    console.log("formData from handleSubmit:", formData);
    console.log("allValues from getValues():", allValues);
    console.log("heroIntro:", allValues.heroIntro);
    console.log("brandOverview:", allValues.brandOverview);
    console.log("=======================");
    
    // Handle File Upload
    let finalLogoUrl = allValues.logo || formData.logo;

    if (formData.logoFile && formData.logoFile.length > 0) {
      const fd = new FormData();
      fd.append("file", formData.logoFile[0]);

      const res = await client.post<{ url: string }>("/api/uploads", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      finalLogoUrl = res.data.url;
    }

    // Prepare payload using getValues() to ensure all controlled fields are included
    const payload = {
      id: allValues.id,
      name: allValues.name,
      country: allValues.country,
      logo: finalLogoUrl,
      heroIntro: allValues.heroIntro || "",
      latestUpcomingIntro: allValues.latestUpcomingIntro || "",
      bodyTypeSectionIntro: allValues.bodyTypeSectionIntro || "",
      budgetSectionIntro: allValues.budgetSectionIntro || "",
      brandOverview: allValues.brandOverview || "",
      brandPositioning: allValues.brandPositioning || "",
      warrantyServiceNetwork: allValues.warrantyServiceNetwork || "",
      brandHistory: allValues.brandHistory || "",
      brandProsCons: combineProsConsToString(pros, cons),
      brandFaqs: combineFaqsToString(faqs),
    };

    console.log("=== PAYLOAD TO SEND ===");
    console.log("Full payload:", payload);
    console.log("=======================");

    if (id) {
      await updateHook.mutateAsync(payload);
    } else {
      await createHook.mutateAsync(payload);
    }

    // Store saved data and show preview
    setLastSavedData(payload);
    setShowPreview(true);
    
    // Reset form with saved values so textareas show the saved content
    reset({
      id: payload.id,
      name: payload.name,
      country: payload.country,
      logo: payload.logo,
      heroIntro: payload.heroIntro || "",
      latestUpcomingIntro: payload.latestUpcomingIntro || "",
      bodyTypeSectionIntro: payload.bodyTypeSectionIntro || "",
      budgetSectionIntro: payload.budgetSectionIntro || "",
      brandOverview: payload.brandOverview || "",
      brandPositioning: payload.brandPositioning || "",
      warrantyServiceNetwork: payload.warrantyServiceNetwork || "",
      brandProsCons: payload.brandProsCons || "",
      brandHistory: payload.brandHistory || "",
      brandFaqs: payload.brandFaqs || "",
    });
    
    // Update pros/cons state to reflect saved values
    const { pros: savedPros, cons: savedCons } = parseProsConsFromString(
      payload.brandProsCons || ""
    );
    setPros(savedPros);
    setCons(savedCons);
    
    // Update FAQs state to reflect saved values
    const savedFaqs = parseFaqsFromString(payload.brandFaqs || "");
    setFaqs(savedFaqs);
    setNextFaqId(savedFaqs.length);
  };

  const logoFile = watch("logoFile");
  const currentLogo = watch("logo");

  // create preview if a file is selected
  const logoPreview = useMemo(() => {
    if (logoFile && logoFile.length > 0) return URL.createObjectURL(logoFile[0]);
    if (currentLogo) return currentLogo;
    return undefined;
  }, [logoFile, currentLogo]);

  // Cleanup blob URL when component unmounts or logoFile changes
  useEffect(() => {
    let url: string | undefined;
    if (logoFile && logoFile.length > 0) {
      url = URL.createObjectURL(logoFile[0]);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [logoFile]);

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

  // Show loading state when editing
  if (id && isLoading) {
    return (
      <div className="max-w-4xl bg-white p-6 rounded shadow">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading brand data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">{id ? "Edit Brand" : "Add Brand"}</h2>
      
      {/* Success Preview */}
      {showPreview && lastSavedData && (
        <div className="mb-6 p-6 bg-emerald-50 border border-emerald-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-semibold text-emerald-900">✓ Content Saved Successfully!</h3>
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
                onClick={() => navigate("/brands")}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Back to Brands
              </Button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 bg-white p-4 rounded">
            <div className="text-sm">
              <p className="font-medium text-slate-700">Brand</p>
              <p className="text-slate-600">{lastSavedData.name}</p>
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-700">Country</p>
              <p className="text-slate-600">{lastSavedData.country}</p>
            </div>
          </div>

          {/* Content Summary */}
          <details className="bg-white p-4 rounded border border-emerald-100 cursor-pointer">
            <summary className="flex items-center justify-between font-semibold text-slate-700 hover:text-slate-900">
              <span>📋 View All Saved Content</span>
              <ChevronDown className="w-4 h-4" />
            </summary>
            
            <div className="mt-4 space-y-4 border-t pt-4">
              {lastSavedData.heroIntro && (
                <div>
                  <p className="font-medium text-slate-700 text-sm">Hero Intro ({countWords(lastSavedData.heroIntro)} words)</p>
                  <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded">{lastSavedData.heroIntro}</p>
                </div>
              )}
              {lastSavedData.latestUpcomingIntro && (
                <div>
                  <p className="font-medium text-slate-700 text-sm">Latest/Upcoming Intro ({countWords(lastSavedData.latestUpcomingIntro)} words)</p>
                  <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded">{lastSavedData.latestUpcomingIntro}</p>
                </div>
              )}
              {lastSavedData.bodyTypeSectionIntro && (
                <div>
                  <p className="font-medium text-slate-700 text-sm">Body Type Section Intro ({countWords(lastSavedData.bodyTypeSectionIntro)} words)</p>
                  <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded">{lastSavedData.bodyTypeSectionIntro}</p>
                </div>
              )}
              {lastSavedData.budgetSectionIntro && (
                <div>
                  <p className="font-medium text-slate-700 text-sm">Budget Section Intro ({countWords(lastSavedData.budgetSectionIntro)} words)</p>
                  <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded">{lastSavedData.budgetSectionIntro}</p>
                </div>
              )}
              {lastSavedData.brandOverview && (
                <div>
                  <p className="font-medium text-slate-700 text-sm">Brand Overview ({countWords(lastSavedData.brandOverview)} words)</p>
                  <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded whitespace-pre-wrap">{lastSavedData.brandOverview}</p>
                </div>
              )}
              {lastSavedData.brandPositioning && (
                <div>
                  <p className="font-medium text-slate-700 text-sm">Brand Positioning ({countWords(lastSavedData.brandPositioning)} words)</p>
                  <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded whitespace-pre-wrap">{lastSavedData.brandPositioning}</p>
                </div>
              )}
              {lastSavedData.warrantyServiceNetwork && (
                <div>
                  <p className="font-medium text-slate-700 text-sm">Warranty & Service Network ({countWords(lastSavedData.warrantyServiceNetwork)} words)</p>
                  <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded whitespace-pre-wrap">{lastSavedData.warrantyServiceNetwork}</p>
                </div>
              )}
              {lastSavedData.brandHistory && (
                <div>
                  <p className="font-medium text-slate-700 text-sm">Brand History ({countWords(lastSavedData.brandHistory)} words)</p>
                  <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded whitespace-pre-wrap">{lastSavedData.brandHistory}</p>
                </div>
              )}
              {lastSavedData.brandProsCons && (
                <div>
                  <p className="font-medium text-slate-700 text-sm mb-2">Pros & Cons</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {lastSavedData.brandProsCons.split("\n---\n")[0] && (
                      <div className="bg-green-50 p-2 rounded border border-green-200">
                        <p className="text-xs font-semibold text-green-700 mb-1">Pros</p>
                        <p className="text-xs text-slate-600 whitespace-pre-wrap">{lastSavedData.brandProsCons.split("\n---\n")[0]}</p>
                      </div>
                    )}
                    {lastSavedData.brandProsCons.split("\n---\n")[1] && (
                      <div className="bg-orange-50 p-2 rounded border border-orange-200">
                        <p className="text-xs font-semibold text-orange-700 mb-1">Cons</p>
                        <p className="text-xs text-slate-600 whitespace-pre-wrap">{lastSavedData.brandProsCons.split("\n---\n")[1]}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {lastSavedData.brandFaqs && (
                <div>
                  <p className="font-medium text-slate-700 text-sm mb-2">FAQs</p>
                  <div className="space-y-2">
                    {parseFaqsFromString(lastSavedData.brandFaqs).map((faq, idx) => (
                      <div key={idx} className="bg-blue-50 p-2 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700">Q: {faq.question}</p>
                        <p className="text-xs text-slate-600 mt-1">A: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
          
          <p className="text-sm text-emerald-700 italic">💡 The form below is still editable - you can make changes and save again.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-semibold block mb-1">Brand ID</label>
          <Input {...register("id")} placeholder="brand id" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Brand Name</label>
          <Input {...register("name")} placeholder="brand name" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Country</label>
          <Input {...register("country")} placeholder="country" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Logo</label>
          <input
            type="file"
            {...register("logoFile")}
            className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100
          "
          />
        </div>
        {logoPreview && (
          <div>
            <img
              src={logoPreview}
              alt="logo preview"
              className="h-20 w-auto rounded border mt-2"
            />
          </div>
        )}

        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold mb-2">Brand Page Content</h3>
          {/* <p className="text-sm text-slate-500 mb-4">
            These sections appear on the public brand page for SEO.
          </p> */}
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">
            Hero Intro ({countWords(watch("heroIntro") || "")} words)
          </label>
          <Textarea
            value={watch("heroIntro") || ""}
            onChange={(e) => setValue("heroIntro", e.target.value)}
            placeholder="Short brand intro used in the hero section"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">
            Latest / Upcoming Intro ({countWords(watch("latestUpcomingIntro") || "")} words)
          </label>
          <Textarea
            value={watch("latestUpcomingIntro") || ""}
            onChange={(e) => setValue("latestUpcomingIntro", e.target.value)}
            placeholder="Intro for the latest and upcoming cars section"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">
            Cars by Body Type Intro ({countWords(watch("bodyTypeSectionIntro") || "")} words)
          </label>
          <Textarea
            value={watch("bodyTypeSectionIntro") || ""}
            onChange={(e) => setValue("bodyTypeSectionIntro", e.target.value)}
            placeholder="Around 100 words shown below Cars by Body Type heading"
            rows={4}
          />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">
            Cars by Budget Intro ({countWords(watch("budgetSectionIntro") || "")} words)
          </label>
          <Textarea
            value={watch("budgetSectionIntro") || ""}
            onChange={(e) => setValue("budgetSectionIntro", e.target.value)}
            placeholder="Around 100 words shown below Cars by Budget heading"
            rows={4}
          />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">
            Brand Overview ({countWords(watch("brandOverview") || "")} words)
          </label>
          <ReactQuill
            theme="snow"
            value={watch("brandOverview") || ""}
            onChange={(value) => setValue("brandOverview", value)}
            modules={quillModules}
            placeholder="Detailed brand overview"
            className="bg-white"
          />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">
            Brand Positioning ({countWords(watch("brandPositioning") || "")} words)
          </label>
          <ReactQuill
            theme="snow"
            value={watch("brandPositioning") || ""}
            onChange={(value) => setValue("brandPositioning", value)}
            modules={quillModules}
            placeholder="How the brand is positioned in the market"
            className="bg-white"
          />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">
            Warranty & Service Network ({countWords(watch("warrantyServiceNetwork") || "")} words)
          </label>
          <Textarea
            value={watch("warrantyServiceNetwork") || ""}
            onChange={(e) => setValue("warrantyServiceNetwork", e.target.value)}
            placeholder="Warranty details and service reach"
            rows={4}
          />
        </div>

        {/* Pros & Cons - Two Column */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Brand Pros & Cons</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm  block mb-1">
                Pros ({countWords(pros)} words)
              </label>
              <Textarea
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                placeholder="List brand strengths and advantages"
                rows={5}
              />
            </div>
            <div>
              <label className="text-sm  block mb-1">
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

        <div>
          <label className="text-sm block font-semibold mb-1">
            Brand History ({countWords(watch("brandHistory") || "")} words)
          </label>
          <ReactQuill
            theme="snow"
            value={watch("brandHistory") || ""}
            onChange={(value) => setValue("brandHistory", value)}
            modules={quillModules}
            placeholder="Brand history timeline or summary"
            className="bg-white"
          />
        </div>

        {/* FAQs - Dynamic Form */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">FAQs</h3>
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
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex justify-between items-start mb-3">
                    <label className="text-sm font-medium">Question</label>
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

        <div className="flex gap-2">
          <Button type="submit">{id ? "Save" : "Create"}</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/brands")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}