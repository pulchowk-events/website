'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { DollarSign, Copy, Check, CreditCard, QrCode } from 'lucide-react';
import Image from 'next/image';

interface DonateFormProps {
  initialUserData: {
    name: string;
    email: string;
  };
}

function formatAmount(raw: string): string {
  const n = parseFloat(raw);
  if (!isFinite(n)) return '$0';
  return '$' + n.toLocaleString('en-US');
}

export default function DonateForm({ initialUserData }: DonateFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [formData, setFormData] = useState({
    name: initialUserData.name || '',
    email: initialUserData.email || '',
    amount: '',
    showOnLeaderboard: true,
    transactionCode: '',
    message: '',
  });

  const qrCodeUrl = '/esewaQR.jpg';
  const donationAmounts = [25, 50, 100, 250, 500];
  const paymentDetails = {
    accountName: 'Sashmin Adhikari',
    accountNumber: '9844568703',
    bankName: 'eSewa',
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (name === 'amount' && type === 'number') {
      const numValue = parseFloat(value);
      setFormData({ ...formData, [name]: numValue < 0 ? '0' : value });
    } else if (name === 'showOnLeaderboard') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const selectAmount = (amount: number) => {
    setFormData({ ...formData, amount: amount.toString() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.amount) {
        toast.error('Please fill in all required fields');
        return;
      }
      setCurrentStep(2);
      return;
    }

    try {
      setIsLoading(true);
      if (!formData.transactionCode) {
        toast.error('Please enter the transaction code');
        return;
      }

      const response = await fetch('/api/donations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (data?.error) {
          throw new Error(
            typeof data.details === 'object'
              ? Object.values(data.details).filter(Boolean).join(', ')
              : data.error
          );
        }
        throw new Error('Failed to submit donation');
      }

      toast.success(data?.message || 'Thank you for your donation!');
      setCurrentStep(3);
    } catch (error) {
      console.error('Donation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit donation');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
        } catch {
          /* ignore */
        }
        ta.remove();
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="card">
      {currentStep === 1 && (
        <>
          <h2 className="donate-form__title">Make a donation</h2>

          <form onSubmit={handleSubmit} className="donate-form__stack">
            <div className="donate-form__row">
              <div className="donate-form__field">
                <label htmlFor="name" className="donate-form__label">
                  Your name <span className="donate-form__req">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="input"
                  required
                />
              </div>

              <div className="donate-form__field">
                <label htmlFor="email" className="donate-form__label">
                  Email address <span className="donate-form__req">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="donate-form__field">
              <p className="donate-form__label">
                Select amount <span className="donate-form__req">*</span>
              </p>
              <div className="donate-form__amounts">
                {donationAmounts.map((amount) => {
                  const on = formData.amount === amount.toString();
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => selectAmount(amount)}
                      className={
                        'donate-form__amount' + (on ? ' donate-form__amount--on' : '')
                      }
                    >
                      ${amount}
                    </button>
                  );
                })}
              </div>

              <div className="donate-form__custom">
                <DollarSign size={16} className="donate-form__custom-icon" />
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Custom amount"
                  className="input"
                  min="1"
                  step="any"
                />
              </div>
            </div>

            <div className="donate-form__field">
              <label htmlFor="message" className="donate-form__label">
                Message <span className="donate-form__muted">(optional)</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Add a message with your donation"
                rows={3}
                className="input input--multi"
              />
            </div>

            <label className="donate-form__check">
              <input
                type="checkbox"
                name="showOnLeaderboard"
                checked={formData.showOnLeaderboard}
                onChange={handleInputChange}
              />
              <span>Show my name on the leaderboard</span>
            </label>

            <button type="submit" className="btn btn--primary donate-form__cta">
              <span className="btn__label">Continue to payment</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">
                Continue to payment
              </span>
            </button>
          </form>
        </>
      )}

      {currentStep === 2 && (
        <>
          <h2 className="donate-form__title">Complete your donation</h2>

          <div className="donate-form__stack">
            <div className="donate-form__panel">
              <p className="donate-form__panel-title">Donation summary</p>
              <div className="donate-form__summary-row">
                <span>Amount</span>
                <span>{formatAmount(formData.amount)}</span>
              </div>
            </div>

            <div className="donate-form__panel">
              <p className="donate-form__panel-title">
                <CreditCard size={14} />
                Payment details
              </p>
              <div className="donate-form__summary-row">
                <span>Account name</span>
                <span>{paymentDetails.accountName}</span>
              </div>
              <div className="donate-form__summary-row">
                <span>Phone number</span>
                <span>{paymentDetails.accountNumber}</span>
              </div>
              <div className="donate-form__summary-row">
                <span>Bank / wallet</span>
                <span>{paymentDetails.bankName}</span>
              </div>

              <div className="donate-form__qr-row">
                <div className="donate-form__qr-wrap">
                  <Image
                    src={qrCodeUrl}
                    alt="Payment QR code"
                    width={180}
                    height={180}
                    className="donate-form__qr-img"
                  />
                </div>
                <div>
                  <p className="donate-form__qr-head">
                    <QrCode size={14} />
                    Scan QR code
                  </p>
                  <p className="donate-form__qr-text">
                    Transfer exactly {formatAmount(formData.amount)} using your banking app.
                    After the transfer, enter the transaction code from your bank statement below.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="donate-form__stack">
              <div className="donate-form__field">
                <label htmlFor="transactionCode" className="donate-form__label">
                  Transaction code / reference number <span className="donate-form__req">*</span>
                </label>
                <input
                  type="text"
                  id="transactionCode"
                  name="transactionCode"
                  value={formData.transactionCode}
                  onChange={handleInputChange}
                  placeholder="Enter the transaction code from your bank"
                  className="input"
                  required
                />
                <p className="donate-form__hint">This helps us verify your donation.</p>
              </div>

              <div className="donate-form__actions">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn btn--secondary"
                >
                  <span className="btn__label">Back</span>
                  <span className="btn__label btn__label--dup" aria-hidden="true">Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn--primary"
                >
                  <span className="btn__label">
                    {isLoading ? 'Processing…' : 'Complete donation'}
                  </span>
                  <span className="btn__label btn__label--dup" aria-hidden="true">
                    {isLoading ? 'Processing…' : 'Complete donation'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {currentStep === 3 && (
        <div className="donate-form__success">
          <span className="donate-form__success-icon">
            <Check size={28} />
          </span>

          <h2 className="donate-form__success-title">Thank you for your donation!</h2>
          <p className="donate-form__success-desc">
            Your contribution of {formatAmount(formData.amount)} will help support student
            investors.
          </p>

          <div className="donate-form__panel" style={{ textAlign: 'left', marginBottom: 16 }}>
            <p className="donate-form__panel-title">Transaction details</p>
            <div className="donate-form__summary-row">
              <span>Reference code</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                  {formData.transactionCode}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(formData.transactionCode)}
                  className="donate-form__copy"
                  aria-label="Copy transaction code"
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </span>
            </div>
          </div>

          <p className="donate-form__hint">
            You&apos;ll receive a confirmation email at {formData.email} shortly.
          </p>
        </div>
      )}
    </div>
  );
}
