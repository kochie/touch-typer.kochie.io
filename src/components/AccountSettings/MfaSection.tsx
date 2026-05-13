"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/lib/supabase-provider";
import { Input, Label } from "@headlessui/react";
import { toast } from "react-toastify";
import { Notification } from "../Notification";
import { Button } from "@/components/ui/Button";

type Factor = { id: string; friendly_name?: string; factor_type: string };

export function MfaSection() {
  const supabase = useSupabaseClient();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [unenrolling, setUnenrolling] = useState<string | null>(null);

  const loadFactors = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const list = data?.all?.filter((f) => f.factor_type === "totp") ?? [];
    setFactors(list);
    setLoading(false);
  };

  useEffect(() => {
    loadFactors();
  }, [supabase]);

  const handleEnrollStart = async () => {
    setEnrolling(true);
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
    setVerifyCode("");
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator app",
      });
      if (error) throw error;
      if (data?.totp) {
        setQrCode(data.totp.qr_code ?? null);
        setSecret(data.totp.secret ?? null);
        setFactorId(data.id);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start enrollment";
      toast(Notification, { type: "error", data: { title: "Error", message, type: "error" } });
    } finally {
      setEnrolling(false);
    }
  };

  const handleEnrollVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || !verifyCode.trim()) return;
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode.trim(),
      });
      if (verifyError) throw verifyError;
      toast(Notification, {
        type: "success",
        data: { title: "MFA enabled", message: "Two-factor authentication is now on.", type: "success" },
      });
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setVerifyCode("");
      await loadFactors();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed";
      toast(Notification, { type: "error", data: { title: "Error", message, type: "error" } });
    }
  };

  const handleUnenroll = async (f: Factor) => {
    setUnenrolling(f.id);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: f.id });
      if (error) throw error;
      toast(Notification, {
        type: "success",
        data: { title: "MFA disabled", message: "Two-factor authentication has been turned off.", type: "success" },
      });
      await loadFactors();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to disable MFA";
      toast(Notification, { type: "error", data: { title: "Error", message, type: "error" } });
    } finally {
      setUnenrolling(null);
    }
  };

  const cancelEnroll = () => {
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
    setVerifyCode("");
  };

  return (
    <div className="divide-y divide-border overflow-hidden bg-bg border border-border rounded-xl">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-base font-semibold leading-7 text-fg">Two-factor authentication</h3>
        <p className="mt-1 text-sm text-fg/60">
          Add an extra layer of security with an authenticator app.
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6 space-y-6">
        {loading ? (
          <p className="text-sm text-fg/60">Loading...</p>
        ) : (
          <>
            {factors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-fg mb-2">Active factors</p>
                <ul className="space-y-2">
                  {factors.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between rounded-md bg-bg-elevated border border-border px-3 py-2 text-sm"
                    >
                      <span>{f.friendly_name ?? f.factor_type ?? f.id}</span>
                      <button
                        type="button"
                        onClick={() => handleUnenroll(f)}
                        disabled={unenrolling === f.id}
                        className="text-bad hover:text-bad/80 text-sm font-medium disabled:opacity-50"
                      >
                        {unenrolling === f.id ? "Disabling..." : "Disable"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!factorId ? (
              factors.length === 0 && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleEnrollStart}
                  disabled={enrolling}
                >
                  {enrolling ? "Starting..." : "Enable two-factor authentication"}
                </Button>
              )
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-fg/80">
                  Scan this QR code with your authenticator app (e.g. Google Authenticator, Authy), then enter the code below.
                </p>
                {qrCode && (
                  <div className="flex justify-center">
                    <img src={qrCode} alt="QR code" className="w-48 h-48" />
                  </div>
                )}
                {secret && (
                  <p className="text-xs text-fg/60 break-all font-mono">
                    Or enter this secret manually: {secret}
                  </p>
                )}
                <form onSubmit={handleEnrollVerify} className="space-y-2">
                  <Label htmlFor="mfa-code" className="block text-sm font-medium text-fg">
                    Verification code
                  </Label>
                  <Input
                    id="mfa-code"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="block w-full max-w-xs rounded-md border border-border bg-bg py-1.5 text-fg shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="md">
                      Verify and enable
                    </Button>
                    <Button type="button" variant="secondary" size="md" onClick={cancelEnroll}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
