"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DollarSign, Copy, Check, CreditCard, QrCode } from "lucide-react";
import Image from "next/image";

interface DonateFormProps {
  initialUserData: { name: string; email: string };
}

function formatAmount(raw: string): string {
  const n = parseFloat(raw);
  if (!isFinite(n)) return "$0";
  return "$" + n.toLocaleString("en-US");
}

const AMOUNTS = [25, 50, 100, 250, 500];

const STEPS = ["Details", "Payment", "Done"];

export default function DonateForm({ initialUserData }: DonateFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: initialUserData.name || "",
    email: initialUserData.email || "",
    amount: "",
    show_on_leaderboard: true,
    transactionCode: "",
    message: "",
  });

  const qrUrl = "/esewaQR.jpg";
  const payment = { name: "Sashmin Adhikari", phone: "9844568703", wallet: "eSewa" };

  const setField = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!form.name || !form.email || !form.amount) {
        toast.error("Fill in name, email, and amount");
        return;
      }
      setStep(2);
      return;
    }

    if (!form.transactionCode) {
      toast.error("Transaction code is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/donations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          typeof data?.details === "object"
            ? Object.values(data.details).filter(Boolean).join(", ")
            : data?.error || "Failed to submit donation",
        );
      }
      toast.success(data?.message || "Thank you for your donation!");
      setStep(3);
    } catch (err) {
      console.error("Donation error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch {}
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="donate-form-card">
      <ol className="donate-steps">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={"donate-steps__item" + (i + 1 < step ? " donate-steps__item--done" : "") + (i + 1 === step ? " donate-steps__item--on" : "")}
          >
            <span className="donate-steps__num">{i + 1 < step ? "✓" : i + 1}</span>
            <span>{label}</span>
          </li>
        ))}
      </ol>

      {step === 1 && (
        <form onSubmit={submit} className="donate-form">
          <div className="donate-form__row">
            <label className="field">
              <span className="field__label">Name</span>
              <input
                type="text"
                className="input"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Email</span>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                required
              />
            </label>
          </div>

          <div className="field">
            <span className="field__label">Amount</span>
            <div className="donate-amount-chips">
              {AMOUNTS.map((amt) => {
                const on = form.amount === String(amt);
                return (
                  <button
                    key={amt}
                    type="button"
                    className={"chip" + (on ? " chip--on" : "")}
                    onClick={() => setField("amount", String(amt))}
                  >
                    ${amt}
                  </button>
                );
              })}
            </div>
            <div className="donate-custom-amount">
              <DollarSign size={14} className="donate-custom-amount__icon" />
              <input
                type="number"
                className="input"
                placeholder="Custom amount"
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
                min="1"
                step="any"
              />
            </div>
          </div>

          <label className="field">
            <span className="field__label">
              Message <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span>
            </span>
            <textarea
              className="input input--multi"
              value={form.message}
              onChange={(e) => setField("message", e.target.value)}
              rows={2}
              style={{ minHeight: 60 }}
            />
          </label>

          <label className="donate-checkbox">
            <input
              type="checkbox"
              checked={form.show_on_leaderboard}
              onChange={(e) => setField("show_on_leaderboard", e.target.checked)}
            />
            <span>Show my name on the leaderboard</span>
          </label>

          <button type="submit" className="btn btn--primary" style={{ width: "100%", height: 40 }}>
            Continue to payment
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submit} className="donate-form">
          <div className="donate-summary">
            <p className="donate-summary__label">Donation amount</p>
            <p className="donate-summary__amount">{formatAmount(form.amount)}</p>
          </div>

          <div className="donate-payment">
            <div className="donate-payment__head">
              <CreditCard size={14} />
              <span>Payment details</span>
            </div>
            <dl className="donate-payment__facts">
              <div><dt>Name</dt><dd>{payment.name}</dd></div>
              <div><dt>Phone</dt><dd>{payment.phone}</dd></div>
              <div><dt>Wallet</dt><dd>{payment.wallet}</dd></div>
            </dl>

            <div className="donate-qr">
              <div className="donate-qr__img-wrap">
                <Image src={qrUrl} alt="Payment QR code" width={160} height={160} className="donate-qr__img" />
              </div>
              <div>
                <p className="donate-qr__head">
                  <QrCode size={12} />
                  Scan or transfer
                </p>
                <p className="donate-qr__text">
                  Transfer exactly {formatAmount(form.amount)}. Then enter the transaction code below.
                </p>
              </div>
            </div>
          </div>

          <label className="field">
            <span className="field__label">
              Transaction code <span style={{ color: "var(--danger)" }}>*</span>
            </span>
            <input
              type="text"
              className="input"
              value={form.transactionCode}
              onChange={(e) => setField("transactionCode", e.target.value)}
              placeholder="From your bank statement"
              required
            />
          </label>

          <div className="donate-form__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? "Processing…" : "Complete donation"}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="donate-success">
          <span className="donate-success__icon">
            <Check size={24} />
          </span>
          <h3 className="donate-success__title">Thank you</h3>
          <p className="donate-success__desc">
            Your donation of {formatAmount(form.amount)} has been submitted. We review each one and email you at{" "}
            <strong>{form.email}</strong> once it&apos;s verified.
          </p>

          <div className="donate-success__tx">
            <span className="donate-success__tx-label">Reference code</span>
            <span className="donate-success__tx-code">{form.transactionCode}</span>
            <button type="button" className="row-icon-btn" onClick={() => copy(form.transactionCode)} aria-label="Copy">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
