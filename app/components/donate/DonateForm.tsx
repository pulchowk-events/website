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
    message: ''
  });

  const qrCodeUrl = "/esewaQR.jpg";

  const donationAmounts = [25, 50, 100, 250, 500];
  const paymentDetails = {
    accountName: "Sashmin Adhikari",
    accountNumber: "9844568703",
    bankName: "eSewa"
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (name === 'amount' && type === 'number') {
      const numValue = parseFloat(value);
      setFormData({
        ...formData,
        [name]: numValue < 0 ? '0' : value
      });
    } else if (name === 'showOnLeaderboard') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const selectAmount = (amount: number) => {
    setFormData({
      ...formData,
      amount: amount.toString()
    });
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to submit donation'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-card/50 rounded-lg shadow-lg border border-border p-6">
      {currentStep === 1 && (
        <>
          <h2 className="text-2xl font-bold text-foreground mb-6">Make a Donation</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Your Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email Address*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Select Amount*
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                {donationAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => selectAmount(amount)}
                    className={`py-3 rounded-lg text-center transition-colors ${
                      formData.amount === amount.toString()
                        ? 'bg-green-600 text-white'
                        : 'bg-secondary text-foreground hover:bg-accent'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Custom Amount"
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="1"
                  step="any"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Add a message with your donation"
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showOnLeaderboard"
                name="showOnLeaderboard"
                checked={formData.showOnLeaderboard}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-border text-green-600 focus:ring-green-500 bg-background"
              />
              <label htmlFor="showOnLeaderboard" className="ml-2 block text-sm text-foreground">
                Show my name on the leaderboard
              </label>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors shadow-lg flex items-center justify-center"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        </>
      )}

      {currentStep === 2 && (
        <>
          <h2 className="text-2xl font-bold text-foreground mb-6">Complete Your Donation</h2>

          <div className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <div className="font-medium text-foreground mb-2">Donation Summary</div>
              <div className="flex justify-between text-foreground">
                <span>Amount:</span>
                <span className="font-bold">${parseFloat(formData.amount).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <div className="mb-4">
                <h3 className="font-medium text-foreground mb-2 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Details
                </h3>

                <div className="space-y-2 text-foreground">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Name:</span>
                    <span>{paymentDetails.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone Number:</span>
                    <span>{paymentDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank/Wallet:</span>
                    <span>{paymentDetails.bankName}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="text-center">
                  <h4 className="text-foreground mb-2 flex items-center justify-center">
                    <QrCode className="h-5 w-5 mr-2" />
                    Scan QR Code
                  </h4>
                  <div className="bg-white p-2 rounded-lg inline-block">
                    <Image
                      src={qrCodeUrl}
                      alt="Payment QR Code"
                      width={200}
                      height={200}
                      className=""
                    />
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <p className="text-foreground mb-4">
                    Transfer the exact amount of ${parseFloat(formData.amount).toLocaleString()} using your banking app or website.
                  </p>
                  <p className="text-foreground mb-2">
                    After completing the transfer, enter the transaction code or reference number from your bank statement below.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="transactionCode" className="block text-sm font-medium text-foreground mb-1">
                  Transaction Code / Reference Number*
                </label>
                <input
                  type="text"
                  id="transactionCode"
                  name="transactionCode"
                  value={formData.transactionCode}
                  onChange={handleInputChange}
                  placeholder="Enter the transaction code from your bank"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This helps us verify your donation
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-secondary hover:bg-accent text-foreground py-3 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors shadow-lg flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    'Complete Donation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {currentStep === 3 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-500/20 mb-6">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">Thank You for Your Donation!</h2>
          <p className="text-foreground mb-6">
            Your contribution of ${parseFloat(formData.amount).toLocaleString()} will help support student investors.
          </p>

          <div className="bg-muted/50 rounded-lg p-4 border border-border text-left mb-6">
            <div className="font-medium text-foreground mb-2">Transaction Details</div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Reference Code:</span>
              <div className="flex items-center">
                <span className="text-foreground font-mono mr-2">{formData.transactionCode}</span>
                <button
                  onClick={() => copyToClipboard(formData.transactionCode)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground text-sm">
            You will receive a confirmation email at {formData.email} shortly.
          </p>
        </div>
      )}
    </div>
  );
}