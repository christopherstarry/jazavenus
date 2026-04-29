import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export function PlaceholderPage({ icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <EmptyState icon={icon} title={title} description={description} />
      </CardContent>
    </Card>
  );
}
