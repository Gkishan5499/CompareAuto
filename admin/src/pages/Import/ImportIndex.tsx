import { Link } from "react-router-dom";

export default function ImportIndex() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Import CSV</h1>
      <div className="space-y-2">
        <Link to="/brands/import" className="block p-3 bg-white rounded shadow">Import Brands</Link>
        <Link to="/models/import" className="block p-3 bg-white rounded shadow">Import Models</Link>
        <Link to="/variants/import" className="block p-3 bg-white rounded shadow">Import Variants</Link>
        <Link to="/upcoming/import" className="block p-3 bg-white rounded shadow">Import Upcoming Cars</Link>
      </div>
    </div>
  );
}
