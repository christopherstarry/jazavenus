import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, LoginError } from "#/lib/auth";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { LockKeyhole, Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react";

const schema = z.object({
  username: z.string().min(1, "Please enter your username or email."),
  password: z.string().min(1, "Please enter your password."),
  mfaCode: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [needsMfa, setNeedsMfa] = useState(false);

  const { register, handleSubmit, formState, setFocus } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", mfaCode: "" },
  });

  const onSubmit = async (v: FormValues) => {
    setServerError(null);
    try {
      await login({
        username: v.username,
        password: v.password,
        mfaCode: needsMfa ? v.mfaCode : undefined,
      });
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof LoginError) {
        if (err.code === "mfa_required") {
          setNeedsMfa(true);
          setServerError(null);
          setTimeout(() => setFocus("mfaCode"), 0);
          return;
        }
        if (err.code === "mfa_setup_required") {
          setServerError("Your account requires multi-factor authentication. Please ask the super admin to help you enrol.");
          return;
        }
        if (err.code === "account_locked") {
          setServerError("Your account is locked because of too many wrong tries. Please wait a few minutes and try again.");
          return;
        }
        if (err.code === "invalid_totp") {
          setServerError("That authenticator code wasn't right. Try the next code from your app.");
          return;
        }
        if (err.code === "invalid_credentials") {
          setServerError("That sign-in and password don't match. Please try again.");
          return;
        }
        setServerError(err.message);
        return;
      }
      setServerError("Something went wrong. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-slate-900 dark:to-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <LockKeyhole className="h-7 w-7" />
            </div>
            <div>
              <CardTitle>Welcome to Jaza Venus</CardTitle>
              <CardDescription>Sign in to start your warehouse work.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="username" required>Username or email</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="e.g. didi@jaza.local"
                autoFocus
                aria-invalid={!!formState.errors.username}
                aria-describedby={formState.errors.username ? "username-err" : undefined}
                {...register("username")}
              />
              {formState.errors.username && (
                <p id="username-err" className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> {formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" required>Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  className="pr-14"
                  aria-invalid={!!formState.errors.password}
                  aria-describedby={formState.errors.password ? "pwd-err" : undefined}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((x) => !x)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formState.errors.password && (
                <p id="pwd-err" className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> {formState.errors.password.message}
                </p>
              )}
            </div>

            {needsMfa && (
              <div className="space-y-2 rounded-[var(--radius)] border-2 border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-base font-semibold">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Authenticator code
                </div>
                <Label htmlFor="mfaCode" className="text-sm text-muted-foreground">
                  Open your authenticator app and type the 6-digit code.
                </Label>
                <Input
                  id="mfaCode"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="123456"
                  {...register("mfaCode")}
                />
              </div>
            )}

            {serverError && (
              <div role="alert" className="flex items-start gap-2 text-base text-destructive bg-destructive/10 border-2 border-destructive/30 rounded-[var(--radius)] p-3">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <Button type="submit" size="lg" disabled={formState.isSubmitting} className="w-full">
              {formState.isSubmitting ? "Signing in…" : needsMfa ? "Verify and sign in" : "Sign in"}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Forgot your password? Ask the super admin to reset it.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
