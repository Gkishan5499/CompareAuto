import { useQuery } from "@tanstack/react-query";
import client from "../../api/client";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await client.get("/api/dashboard/stats")).data,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  const chartData = [
    { name: "Brands", count: data.brands },
    { name: "Models", count: data.models },
    { name: "Variants", count: data.variants ?? 0 },
    { name: "UsedCars", count: data.usedCars ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle>Brands</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.brands}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Models</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.models}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Used Cars</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.usedCars}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Articles</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.articles}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="count" /></BarChart></ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
