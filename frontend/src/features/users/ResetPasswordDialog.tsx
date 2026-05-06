import { useState } from "react";
import { api } from "#/lib/api";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "#/components/ui/dialog";

interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface Props {
  user: UserListItem;
  open: boolean;
  onClose: () => void;
}

export function ResetPasswordDialog({ user, open, onClose }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`users/${user.id}/reset-password`, {
        json: { newPassword, confirmNewPassword: confirmPassword },
      }).json();
      setDone(true);
    } catch (err: any) {
      const msg = err?.response?.json ? (await err.response.json()).detail ?? err.message : err.message;
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setDone(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reset Password: {user.fullName}</DialogTitle>
          {!done && (
            <DialogDescription>
              This will sign out {user.fullName} from all devices immediately.
            </DialogDescription>
          )}
        </DialogHeader>

        {done ? (
          <div className="space-y-4 mt-4">
            <p className="text-green-600 font-medium">Password changed for {user.fullName}.</p>
            <p className="text-sm text-muted-foreground">All existing sessions have been signed out.</p>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div>
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Password must be:</p>
              <ul className="list-disc pl-4">
                <li>At least 12 characters</li>
                <li>Uppercase + lowercase + digit + special character</li>
              </ul>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Resetting…" : "Reset Password"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
