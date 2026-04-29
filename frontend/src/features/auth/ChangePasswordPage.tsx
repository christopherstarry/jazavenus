import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { HTTPError } from "ky";

/* Mirrors backend ChangePasswordValidator (12+ chars, upper/lower/digit/symbol). */
const Schema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z
    .string()
    .min(12, "At least 12 characters")
    .regex(/[A-Z]/, "Add an uppercase letter (A–Z)")
    .regex(/[a-z]/, "Add a lowercase letter (a–z)")
    .regex(/[0-9]/, "Add a number (0–9)")
    .regex(/[^A-Za-z0-9]/, "Add a symbol (e.g. ! @ # $)"),
  confirmPassword: z.string().min(1, "Type the new password again"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "The two new passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof Schema>;

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = form;

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await api.post("auth/change-password", {
        json: { currentPassword: values.currentPassword, newPassword: values.newPassword },
      });
      setSuccess(true);
      reset();
    } catch (err) {
      if (err instanceof HTTPError) {
        try {
          const body = (await err.response.clone().json()) as { errors?: string[] };
          if (body.errors?.length) {
            setServerError(body.errors.join(" "));
            return;
          }
        } catch { /* ignore JSON parse errors */ }
        if (err.response.status === 401) {
          setServerError("Your current password is incorrect.");
          return;
        }
      }
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>
            Pick a new password — at least 12 characters, with an uppercase letter, a lowercase letter,
            a number, and a symbol.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-md border-2 border-success bg-success/10 p-4 text-success">
                <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Password changed</div>
                  <div className="text-base">
                    Your password was updated. You can keep using the app — you'll only need the
                    new password the next time you sign in.
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setSuccess(false)}>Change again</Button>
                <Button variant="outline" onClick={() => navigate("/")}>Back to dashboard</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {serverError && (
                <div className="flex items-start gap-3 rounded-md border-2 border-destructive bg-destructive/10 p-4 text-destructive">
                  <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
                  <div className="text-base">{serverError}</div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword" required>Current password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={!!errors.currentPassword}
                    {...register("currentPassword")}
                  />
                  <PasswordToggle show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} />
                </div>
                {errors.currentPassword && <FieldError msg={errors.currentPassword.message!} />}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" required>New password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    autoComplete="new-password"
                    aria-invalid={!!errors.newPassword}
                    {...register("newPassword")}
                  />
                  <PasswordToggle show={showNew} onToggle={() => setShowNew((v) => !v)} />
                </div>
                {errors.newPassword && <FieldError msg={errors.newPassword.message!} />}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" required>Type the new password again</Label>
                <Input
                  id="confirmPassword"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <FieldError msg={errors.confirmPassword.message!} />}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Update password"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {msg}
    </p>
  );
}
