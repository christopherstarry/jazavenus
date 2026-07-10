import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { LookupDialog, type LookupItem, type LookupType } from "#/features/common/LookupDialog";

export interface LookupFieldInputProps {
  label: string;
  type: LookupType;
  code: string;
  name?: string;
  onSelect: (item: LookupItem) => void;
  onClear?: () => void;
  division?: string;
  disabled?: boolean;
  required?: boolean;
  /** Registers this field so a header-level F4 can open the "primary" lookup field's dialog. */
  primary?: boolean;
  onRegisterOpen?: (open: () => void) => void;
}

/**
 * Legacy `Text1` (code) + `Label1` (name) + magnifier pattern: a read-only code field that fills
 * from the universal LookupDialog, with the resolved name shown alongside. See
 * docs/modules/shared/ui-foundation/lookup-browse-dialog.md "Trigger patterns".
 */
export function LookupFieldInput({
  label,
  type,
  code,
  name,
  onSelect,
  onClear,
  division,
  disabled,
  required,
}: LookupFieldInputProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <Input value={code} readOnly placeholder="—" className="font-mono w-32" disabled={disabled} />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          aria-label={`Browse ${label}`}
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>
        <span className="flex-1 truncate text-sm text-muted-foreground">{name ?? ""}</span>
        {code && onClear && !disabled && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            ×
          </Button>
        )}
      </div>
      <LookupDialog
        type={type}
        open={open}
        onOpenChange={setOpen}
        division={division}
        onSelect={onSelect}
      />
    </div>
  );
}
