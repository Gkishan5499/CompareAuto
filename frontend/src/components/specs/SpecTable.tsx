import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export default function SpecTable({ title, rows }: { title: string; rows: Array<{ label: string; value?: string | number | undefined }>; }) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-primary/5 px-6 py-3 border-b">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <Table>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.label}>
              <TableCell className="font-medium">{r.label}</TableCell>
              <TableCell>{r.value ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
