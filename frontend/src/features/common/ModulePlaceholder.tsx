import { Link } from "react-router";
import { Hammer, ArrowLeft, Home } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Button } from "#/components/ui/button";
import { type ModuleNode } from "#/app/modules";

/**
 * Friendly "coming soon" placeholder for any module that doesn't have a
 * real component yet. Used by ModulePage as a fallback so nothing 404s.
 *
 * Tone is calm and reassuring for older users — no scary "404" or
 * "page not found" wording.
 */
export function ModulePlaceholder({ node }: { node: ModuleNode }) {
  return (
    <Card>
      <CardContent className="py-10 sm:py-14">
        <div className="mx-auto max-w-xl text-center space-y-5">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Hammer className="h-8 w-8" aria-hidden />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">{node.label}</h2>
            {node.description && (
              <p className="mt-2 text-base sm:text-lg text-muted-foreground">{node.description}</p>
            )}
          </div>
          <p className="text-base text-muted-foreground">
            We're building this screen. It will be ready in an upcoming update.
            <br />
            For now, please use the menu on the left to find another screen, or head back to the
            dashboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild>
              <Link to="/">
                <Home className="h-5 w-5" />
                Go to dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="..">
                <ArrowLeft className="h-5 w-5" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
