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
  
  // Form state
  const [formData, setFormData] = useState({
    name: initialUserData.name || '',
    email: initialUserData.email || '',
    amount: '',
    showOnLeaderboard: true,
    transactionCode: '',
    message: ''
  });
  
  // QR code placeholder
  const qrCodeUrl = "/esewaQR.jpg"; // Replace with actual QR code
  
  // Predefined donation amounts
  const donationAmounts = [25, 50, 100, 250, 500];
  const paymentDetails = {
    accountName: "Sashmin Adhikari",
    accountNumber: "9844568703",
    bankName: "eSewa"
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'amount' && type === 'number') {
      // Ensure amount is positive
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
      // Validate first step
      if (!formData.name || !formData.email || !formData.amount) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      setCurrentStep(2);
      return;
    }
    
    // Final submission
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
      // Handle structured error response
      if (data?.error) {
        throw new Error(
          typeof data.details === 'object' 
            ? Object.values(data.details).filter(Boolean).join(', ')
            : data.error
        );
      }
      throw new Error('Failed to submit donation');
    }
    
    // Success
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
    <div className="bg-zinc-800/50 rounded-lg shadow-lg border border-zinc-800 p-6">
      {currentStep === 1 && (
        <>
          <h2 className="text-2xl font-bold text-white mb-6">Make a Donation</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
                  Your Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2.5 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
                  Email Address*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2.5 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">
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
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Custom Amount"
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="1"
                  step="any"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-zinc-300 mb-1">
                Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Add a message with your donation"
                rows={3}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2.5 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showOnLeaderboard"
                name="showOnLeaderboard"
                checked={formData.showOnLeaderboard}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-zinc-600 text-green-600 focus:ring-green-500 bg-zinc-700"
              />
              <label htmlFor="showOnLeaderboard" className="ml-2 block text-sm text-zinc-300">
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
          <h2 className="text-2xl font-bold text-white mb-6">Complete Your Donation</h2>
          
          <div className="space-y-6">
            <div className="bg-zinc-700/50 rounded-lg p-4 border border-zinc-600">
              <div className="font-medium text-zinc-300 mb-2">Donation Summary</div>
              <div className="flex justify-between text-white">
                <span>Amount:</span>
                <span className="font-bold">${parseFloat(formData.amount).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="bg-zinc-700/50 rounded-lg p-4 border border-zinc-600">
              <div className="mb-4">
                <h3 className="font-medium text-zinc-300 mb-2 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Details
                </h3>
                
                <div className="space-y-2 text-white">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Account Name:</span>
                    <span>{paymentDetails.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Phone Number:</span>
                    <span>{paymentDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Bank/Wallet:</span>
                    <span>{paymentDetails.bankName}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="text-center">
                  <h4 className="text-zinc-300 mb-2 flex items-center justify-center">
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
                  <p className="text-zinc-300 mb-4">
                    Transfer the exact amount of ${parseFloat(formData.amount).toLocaleString()} using your banking app or website.
                  </p>
                  <p className="text-zinc-300 mb-2">
                    After completing the transfer, enter the transaction code or reference number from your bank statement below.
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="transactionCode" className="block text-sm font-medium text-zinc-300 mb-1">
                  Transaction Code / Reference Number*
                </label>
                <input
                  type="text"
                  id="transactionCode"
                  name="transactionCode"
                  value={formData.transactionCode}
                  onChange={handleInputChange}
                  placeholder="Enter the transaction code from your bank"
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2.5 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-zinc-400 mt-1">
                  This helps us verify your donation
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-lg font-medium transition-colors"
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
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Thank You for Your Donation!</h2>
          <p className="text-zinc-300 mb-6">
            Your contribution of ${parseFloat(formData.amount).toLocaleString()} will help support student investors.
          </p>
          
          <div className="bg-zinc-700/50 rounded-lg p-4 border border-zinc-600 text-left mb-6">
            <div className="font-medium text-zinc-300 mb-2">Transaction Details</div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Reference Code:</span>
              <div className="flex items-center">
                <span className="text-white font-mono mr-2">{formData.transactionCode}</span>
                <button
                  onClick={() => copyToClipboard(formData.transactionCode)}
                  className="text-zinc-400 hover:text-white"
                >
                  {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-zinc-400 text-sm">
            You will receive a confirmation email at {formData.email} shortly.
          </p>
        </div>
      )}
    </div>
  );
}