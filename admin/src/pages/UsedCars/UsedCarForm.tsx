import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useApiList } from "../../hooks/useapi";

export default function UsedCarForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { data: cars = [] } = useApiList(["used-cars"], "/api/used-cars");
  const existing = cars.find((c: any) => c.id === id);

  const [form, setForm] = useState<any>({
    id: "",
    title: "",
    brand: "",
    carmodel: "",
    variant: "",
    year: 2018,
    fuel: "Petrol",
    transmission: "Manual",
    kms: 50000,
    owners: 1,
    city: "Delhi",
    price: 500000,
    images: [],
    features: [],
    sellerType: "Dealer",
    sellerName: "",
    sellerPhone: "",
    listingUrl: "",
    verified: false,
  });

  useEffect(() => {
    if (existing) setForm(existing);
  }, [existing]);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const url = `/api/used-cars${isEdit ? `/${id}` : ""}`;
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      navigate("/used-cars");
    } else {
      alert("Failed to save used car");
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">{isEdit ? "Edit" : "Add"} Used Car</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Listing ID</Label>
          <Input value={form.id} onChange={(e) => handleChange("id", e.target.value)} />
        </div>
        <div>
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => handleChange("title", e.target.value)} />
        </div>
        <div>
          <Label>Brand</Label>
          <Input value={form.brand} onChange={(e) => handleChange("brand", e.target.value)} />
        </div>
        <div>
          <Label>Model</Label>
          <Input value={form.carmodel} onChange={(e) => handleChange("carmodel", e.target.value)} />
        </div>
        <div>
          <Label>Variant</Label>
          <Input value={form.variant} onChange={(e) => handleChange("variant", e.target.value)} />
        </div>
        <div>
          <Label>Year</Label>
          <Input type="number" value={form.year} onChange={(e) => handleChange("year", Number(e.target.value))} />
        </div>
        <div>
          <Label>Fuel</Label>
          <Input value={form.fuel} onChange={(e) => handleChange("fuel", e.target.value)} />
        </div>
        <div>
          <Label>Transmission</Label>
          <Input value={form.transmission} onChange={(e) => handleChange("transmission", e.target.value)} />
        </div>
        <div>
          <Label>Kms</Label>
          <Input type="number" value={form.kms} onChange={(e) => handleChange("kms", Number(e.target.value))} />
        </div>
        <div>
          <Label>Owners</Label>
          <Input type="number" value={form.owners} onChange={(e) => handleChange("owners", Number(e.target.value))} />
        </div>
        <div>
          <Label>City</Label>
          <Input value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
        </div>
        <div>
          <Label>Price (₹)</Label>
          <Input type="number" value={form.price} onChange={(e) => handleChange("price", Number(e.target.value))} />
        </div>
        <div className="md:col-span-2">
          <Label>Images (comma separated URLs)</Label>
          <Input value={form.images?.join(", ")} onChange={(e) => handleChange("images", e.target.value.split(",").map(s => s.trim()))} />
        </div>
        <div className="md:col-span-2">
          <Label>Features (comma separated)</Label>
          <Input value={form.features?.join(", ")} onChange={(e) => handleChange("features", e.target.value.split(",").map(s => s.trim()))} />
        </div>
        <div>
          <Label>Seller Type</Label>
          <Input value={form.sellerType} onChange={(e) => handleChange("sellerType", e.target.value)} />
        </div>
        <div>
          <Label>Seller Name</Label>
          <Input value={form.sellerName} onChange={(e) => handleChange("sellerName", e.target.value)} />
        </div>
        <div>
          <Label>Seller Phone</Label>
          <Input value={form.sellerPhone} onChange={(e) => handleChange("sellerPhone", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Listing URL</Label>
          <Input value={form.listingUrl} onChange={(e) => handleChange("listingUrl", e.target.value)} />
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button onClick={handleSubmit}>{isEdit ? "Update" : "Create"}</Button>
        <Button variant="outline" onClick={() => navigate("/used-cars")}>Cancel</Button>
      </div>
    </div>
  );
}
