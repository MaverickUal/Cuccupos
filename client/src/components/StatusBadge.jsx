import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/format";

const STYLE = {
  pending_payment: "border-transparent bg-neutral-200 text-neutral-600",
  paid: "border-transparent bg-sky-100 text-sky-700",
  preparing: "border-transparent bg-amber-100 text-amber-700",
  ready: "border-transparent bg-green-100 text-green-700",
  completed: "border-transparent bg-lime-200 text-lime-900",
  cancelled: "border-transparent bg-red-100 text-red-700",
};

export default function StatusBadge({ status, className }) {
  return <Badge className={cn(STYLE[status], className)}>{STATUS_LABEL[status] || status}</Badge>;
}
