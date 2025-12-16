import { useApiList } from "../../hooks/useapi";
import { Card } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import dayjs from "dayjs";

interface Enquiry {
  _id: string;
  ref: string;
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  pincode: string;
  pageType?: string;
  brand?: string;
  carModel?: string;
  variant?: string;
  usedId?: string;
  message?: string;
  createdAt: string;
}

export default function EnquiryList() {
  const { data, isLoading, isError } = useApiList<{ success: boolean; items: Enquiry[] }>(["enquiries"], "/api/enquiries");

  const items = data?.items || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Enquiries</h1>
        <p className="text-muted-foreground">Latest enquiries from the website (OTP verified).</p>
      </div>

      <Card className="p-4">
        {isLoading && <div>Loading enquiries...</div>}
        {isError && <div className="text-red-600">Failed to load enquiries.</div>}
        {!isLoading && items.length === 0 && <div>No enquiries yet.</div>}

        {!isLoading && items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Context</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((enq) => (
                <TableRow key={enq._id}>
                  <TableCell className="font-mono text-xs">{enq.ref}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{enq.fullName}</div>
                    <div className="text-xs text-muted-foreground">{enq.email}</div>
                  </TableCell>
                  <TableCell>
                    <div>{enq.mobile}</div>
                  </TableCell>
                  <TableCell>
                    <div>{enq.city}</div>
                    <div className="text-xs text-muted-foreground">{enq.state} - {enq.pincode}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 text-xs">
                      <Badge variant="secondary">{enq.pageType || "contact"}</Badge>
                      {enq.brand && <Badge variant="outline">{enq.brand}</Badge>}
                      {enq.carModel && <Badge variant="outline">{enq.carModel}</Badge>}
                      {enq.variant && <Badge variant="outline">{enq.variant}</Badge>}
                      {enq.usedId && <Badge variant="outline">Used #{enq.usedId}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs text-sm">
                    <div className="line-clamp-3">{enq.message || ""}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {dayjs(enq.createdAt).format("DD MMM YYYY, HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
