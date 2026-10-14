import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Plus } from "lucide-react";
import { db } from "@/firebase";
import { CATEGORIES, peso } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const blank = { name: "", price: "", category: "Coffee", description: "", emoji: "🥤", imageUrl: "", available: true };

export default function MenuManager() {
  const { menu } = useOutletContext();
  const [form, setForm] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const { id, ...data } = form;
    data.price = Number(data.price);
    if (id) await updateDoc(doc(db, "menu", id), data);
    else await addDoc(collection(db, "menu"), data);
    setForm(null);
  };
  const toggle = (m) => updateDoc(doc(db, "menu", m.id), { available: m.available === false });
  const del = (m) => confirm(`Delete ${m.name}?`) && deleteDoc(doc(db, "menu", m.id));

  const sorted = [...menu].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button onClick={() => setForm({ ...blank })}><Plus /> Add item</Button>
          <span className="text-sm text-muted-foreground">{menu.length} items. Run <code className="rounded bg-secondary px-1">npm run seed</code> to load the starter menu.</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Price</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((m) => (
              <TableRow key={m.id}>
                <TableCell><b>{m.emoji} {m.name}</b><div className="text-xs text-muted-foreground">{m.description}</div></TableCell>
                <TableCell>{m.category}</TableCell>
                <TableCell className="text-right">{peso(m.price)}</TableCell>
                <TableCell>
                  <Badge className={m.available === false ? "border-transparent bg-red-100 text-red-700" : "border-transparent bg-green-100 text-green-700"}>
                    {m.available === false ? "Sold out" : "Available"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => setForm({ ...blank, ...m })}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => toggle(m)}>{m.available === false ? "Mark available" : "Mark sold out"}</Button>
                    <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => del(m)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent>
          {form && (
            <form onSubmit={save} className="grid gap-3.5">
              <DialogHeader><DialogTitle>{form.id ? "Edit item" : "Add item"}</DialogTitle></DialogHeader>
              <div className="grid gap-1.5"><Label>Name</Label><Input value={form.name} onChange={set("name")} required /></div>
              <div className="grid gap-1.5"><Label>Price (₱)</Label><Input type="number" min="1" step="0.01" value={form.price} onChange={set("price")} required /></div>
              <div className="grid gap-1.5"><Label>Category</Label><Select value={form.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></div>
              <div className="grid gap-1.5"><Label>Description</Label><Input value={form.description} onChange={set("description")} /></div>
              <div className="grid gap-1.5"><Label>Emoji (shown when no image)</Label><Input value={form.emoji} onChange={set("emoji")} /></div>
              <div className="grid gap-1.5"><Label>Image URL (optional)</Label><Input value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://…" /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setForm(null)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
