import { useSettings, type TextSize, type Theme } from "@/lib/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import { Moon, Sun, Monitor, Type } from "lucide-react";
import { cn } from "@/lib/utils";

const TEXT_OPTIONS: { value: TextSize; label: string; sample: string }[] = [
  { value: "small",   label: "Small",        sample: "15px" },
  { value: "normal",  label: "Normal",       sample: "17px (default)" },
  { value: "large",   label: "Large",        sample: "19px" },
  { value: "xlarge",  label: "Extra large",  sample: "21px" },
];

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light",  label: "Light",       icon: Sun },
  { value: "dark",   label: "Dark",        icon: Moon },
  { value: "system", label: "Use system",  icon: Monitor },
];

export function SettingsPanel() {
  const s = useSettings();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Type className="h-6 w-6" /> Text size</CardTitle>
          <CardDescription>Make everything bigger or smaller. Your choice is remembered on this computer.</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="radiogroup" aria-label="Text size" className="grid gap-3 sm:grid-cols-2">
            {TEXT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={s.textSize === opt.value}
                onClick={() => s.setTextSize(opt.value)}
                className={cn(
                  "flex items-center justify-between rounded-[var(--radius)] border-2 px-5 py-4 text-left transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  s.textSize === opt.value ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div>
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-sm text-muted-foreground">{opt.sample}</div>
                </div>
                <div className={cn("h-5 w-5 rounded-full border-2", s.textSize === opt.value ? "border-primary bg-primary" : "border-border")} />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Use light mode by day, dark mode at night to reduce eye strain.</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="radiogroup" aria-label="Theme" className="grid gap-3 sm:grid-cols-3">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={s.theme === value}
                onClick={() => s.setTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-[var(--radius)] border-2 px-5 py-6 transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  s.theme === value ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <Icon className="h-8 w-8" />
                <span className="text-base font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keyboard shortcuts</CardTitle>
          <CardDescription>Speed up daily work. These work everywhere in the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <Shortcut keys={["/"]}              describe="Jump to search" />
          <Shortcut keys={["Esc"]}            describe="Close a dialog or cancel" />
          <Shortcut keys={["Enter"]}          describe="Confirm the highlighted button" />
          <Shortcut keys={["Tab"]}            describe="Move to the next field" />
          <Shortcut keys={["Shift", "Tab"]}   describe="Move to the previous field" />
        </CardContent>
      </Card>
    </div>
  );
}

function Shortcut({ keys, describe }: { keys: string[]; describe: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <span className="text-base">{describe}</span>
      <span className="flex items-center gap-1">
        {keys.map((k, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-muted-foreground">+</span>}
            <Kbd>{k}</Kbd>
          </span>
        ))}
      </span>
    </div>
  );
}
