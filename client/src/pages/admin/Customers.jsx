import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
<<<<<<< HEAD
import { fmtDateTime, PAID_STATUSES, peso } from "@/lib/format";
=======
import { fmtDateTime, PAID_STATUSES, peso } from "@/utils";
>>>>>>> 3f8021b6a239b887bd48f7170589b29b907ef28d
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Customers() {
  const { users, orders } = useOutletContext();
  const rows = useMemo(
    () =>
      users
        .filter((u) => u.role !== "admin")
        .map((u) => {
          const mine = orders.filter((o) => o.uid === u.id && PAID_STATUSES.includes(o.status));
          return { ...u, count: mine.length, spent: mine.reduce((s, o) => s + o.total, 0), last: mine[0]?.createdAt };
        })
        .sort((a, b) => b.spent - a.spent),
    [users, orders]
  );
  return (
    <Card>
      <CardHeader><CardTitle>Customers ({rows.length})</CardTitle></CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">No customers yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">Total spent</TableHead><TableHead>Last order</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-bold">{r.name}</TableCell><TableCell>{r.email}</TableCell>
                  <TableCell className="text-right">{r.count}</TableCell><TableCell className="text-right">{peso(r.spent)}</TableCell>
                  <TableCell>{fmtDateTime(r.last)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
