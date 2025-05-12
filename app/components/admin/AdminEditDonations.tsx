'use client';

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Plus, 
  X, 
  Edit, 
  Save, 
  Search, 
  Trash 
} from 'lucide-react';
import { toast } from 'sonner';
import { error } from 'console';
import { DeleteConfirmationDialog } from '@/app/components/donate/DeleteConfirmationDialog';

interface Donation {
  id: string;
  name: string;
  email: string;
  amount: number;
  transaction_code: string;
  message?: string;
  created_at: string;
  show_on_leaderboard: boolean;
  verified: boolean;
  verified_at?: string;
  verified_by?: string;
}

interface PrizePool {
  id: string;
  current_amount: number;
  target_amount: number;
  last_updated: string;
}

export default function AdminEditDonations() {
  // State for donations list
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<string | null>(null);

    // Add to your component state
  const [editingPrizePool, setEditingPrizePool] = useState(false);
  const [editedPrizePool, setEditedPrizePool] = useState({
    current_amount: '',
    target_amount: ''
  });

  // State for prize pool
  const [prizePool, setPrizePool] = useState<PrizePool | null>(null);
  const [isEditingPool, setIsEditingPool] = useState(false);
  const [editedPoolValue, setEditedPoolValue] = useState(0);
  const [editedTargetValue, setEditedTargetValue] = useState(0);
  const [totalDonors, setTotalDonors] = useState(0);
  
  // State for manual donation entry
  const [isAddingDonation, setIsAddingDonation] = useState(false);
const [newDonation, setNewDonation] = useState({
  name: '',
  email: '',
  amount: '',
  transaction_code: '',
  message: '',
  show_on_leaderboard: true,
  use_admin_avatar: false // Add this new field
});
  
  // State for editing donation
  const [editingDonationId, setEditingDonationId] = useState<string | null>(null);
  const [editedDonation, setEditedDonation] = useState<Partial<Donation>>({});
  
  const itemsPerPage = 10;
  
  // Fetch donations and prize pool data
  useEffect(() => {
    fetchDonations();
    fetchPrizePool();
    fetchDonors();
  }, [currentPage]);
  
  // Apply search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = donations.filter(donation => 
        donation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.transaction_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDonations(filtered);
    } else {
      setFilteredDonations(donations);
    }
  }, [searchTerm, donations]);
  
const fetchDonations = async () => {
  setIsLoading(true);
  try {
    const response = await fetch(`/api/admin/donations?page=${currentPage}&limit=${itemsPerPage}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch donations');
    }
    
    const data = await response.json();
    // Ensure IDs are in correct format
    const formattedDonations = data.donations.map((donation: Donation) => ({
      ...donation,
      id: donation.id.toString() // Or format as UUID if needed
    }));
    
    setDonations(formattedDonations);
    setFilteredDonations(formattedDonations);
    setTotalPages(Math.ceil(data.total / itemsPerPage));
  } catch (error) {
    console.error('Error fetching donations:', error);
    toast.error('Failed to load donations');
  } finally {
    setIsLoading(false);
  }
};

const fetchDonors = async () => {
  try {
    const response = await fetch('/api/admin/donations/verified');
    if (!response.ok) throw new Error('Failed to fetch donors');
    const data = await response.json();
    setTotalDonors(data.total_donors);
    return data.total_donors; // ✅ Return the value
  } catch (error) {
    console.error('Error fetching donors:', error);
    toast.error('Failed to load donors');
    return null;
  }
};

  
  const fetchPrizePool = async () => {
    try {
      const response = await fetch('/api/admin/donations/prize-pool');
      
      if (!response.ok) {
        throw new Error('Failed to fetch prize pool data');
      }
      
      const data = await response.json();
      setPrizePool(data);
      setEditedPoolValue(data.current_amount);
      setEditedTargetValue(data.target_amount);
      setTotalDonors(data.total_donors);
    } catch (error) {
      console.error('Error fetching prize pool:', error);
      toast.error('Failed to load prize pool data');
    }
  };
  
const handleUpdatePrizePool = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    setIsLoading(true);
    
    const targetAmount = Number(editedTargetValue);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      throw new Error('Target amount must be a positive number');
    }
    
    const response = await fetch('/api/admin/donations/prize-pool', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_amount: targetAmount
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update target amount');
    }

    await fetchPrizePool();
    setIsEditingPool(false);
    toast.success('Target amount updated successfully');
  } catch (error) {
    console.error('Error updating target amount:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to update target amount');
  } finally {
    setIsLoading(false);
  }
};
  
  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
// In handleAddDonation function
const response = await fetch('/api/admin/donations/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...newDonation,
    transaction_code: newDonation.transaction_code,
    amount: parseFloat(newDonation.amount)
  }),
});
      
      if (!response.ok) {
        throw new Error('Failed to add donation');
      }
      
      await fetchDonations();
      await fetchPrizePool();
      
      // Reset form
      setNewDonation({
        name: '',
        email: '',
        amount: '',
        transaction_code: '',
        message: '',
        show_on_leaderboard: true,
        use_admin_avatar: false
      });
      
      setIsAddingDonation(false);
      toast.success('Donation added successfully');
    } catch (error) {
      console.error('Error adding donation:', error);
      toast.error('Failed to add donation');
    }
  };
  
  const startEditDonation = (donation: Donation) => {
    setEditingDonationId(donation.id);
    setEditedDonation({ ...donation });
  };
  
const handleUpdateDonation = async () => {
  if (!editingDonationId) {
    toast.error('No donation selected for editing');
    return;
  }

  try {
    const payload = {
      ...editedDonation,
      amount: typeof editedDonation.amount === 'string'
        ? parseFloat(editedDonation.amount)
        : editedDonation.amount,
      show_on_leaderboard: Boolean(editedDonation.show_on_leaderboard)
    };

    const response = await fetch(`/api/admin/donations/${editingDonationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.fieldErrors) {
        const errorMessages = result.fieldErrors.map((err: any) => 
          `${err.field}: ${err.message} (Received: ${err.received})`
        ).join('\n');
        
        toast.error(
          <div>
            <strong>Validation errors:</strong>
            <pre className="text-sm mt-2">{errorMessages}</pre>
            <p className="mt-2">Attempted changes:</p>
            <pre className="text-xs mt-1">{JSON.stringify(result.receivedData, null, 2)}</pre>
          </div>,
          { duration: 10000 }
        );
      } else {
        throw new Error(result.error || `Update failed with status ${response.status}`);
      }
      return;
    }

    // Refresh all data
    await Promise.all([
      fetchDonations(),
      fetchDonors(),
      fetchPrizePool()
    ]);

    toast.success(
      <div>
        <p>Donation updated successfully</p>
        <p className="text-sm mt-1">Changes applied:</p>
        <pre className="text-xs mt-1">{JSON.stringify(result.updatedFields, null, 2)}</pre>
      </div>
    );

    setEditingDonationId(null);

  } catch (error) {
    console.error('Update error:', error);
    let errorMessage = 'Failed to update donation';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error(errorMessage, { duration: 5000 });
  }
};

const handleDeleteDonation = async (id: string) => {
  setDonationToDelete(id);
  setDeleteDialogOpen(true);
};

const confirmDelete = async () => {
  if (!donationToDelete) return;
  
  try {
    const response = await fetch(`/api/admin/donations/${donationToDelete}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete donation');
    }
    
    await fetchDonations();
    await fetchPrizePool();
    
    toast.success('Donation deleted successfully');
  } catch (error) {
    console.error('Error deleting donation:', error);
    toast.error('Failed to delete donation');
  } finally {
    setDonationToDelete(null);
  }
};
  
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target as HTMLInputElement;
  
  if (type === 'checkbox') {
    setNewDonation({
      ...newDonation,
      [name]: (e.target as HTMLInputElement).checked
    });
  } else {
    setNewDonation({
      ...newDonation,
      [name]: value
    });
  }
};

  
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'show_on_leaderboard') {
      setEditedDonation({
        ...editedDonation,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else if (name === 'amount') {
      setEditedDonation({
        ...editedDonation,
        [name]: parseFloat(value)
      });
    } else {
      setEditedDonation({
        ...editedDonation,
        [name]: value
      });
    }
  };

const handleVerifyDonation = async (donationId: string, verify: boolean) => {
  try {
    setIsLoading(true);
    if (!donationId) {
      throw new Error('Invalid donation ID');
    }

    const response = await fetch(`/api/admin/donations/${donationId}/verify`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        verified: verify 
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update verification status');
    }

    const data = await response.json();
    toast.success(data.message);
    
    // Refresh all relevant data
    await Promise.all([
      fetchDonations(),
      fetchDonors(), // Fetch updated donors count
      fetchPrizePool() // Update prize pool with new donors count
    ]);

    // Update prize pool with new donors count
    const poolResponse = await fetch('/api/admin/donations/prize-pool', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_amount: prizePool?.current_amount || 0,
        target_amount: prizePool?.target_amount || 0,
        total_donors: totalDonors
      }),
    });

    if (!poolResponse.ok) {
      throw new Error('Failed to update prize pool with new donors count');
    }

  } catch (error) {
    console.error('Error verifying donation:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to update verification status');
  } finally {
    setIsLoading(false);
  }
};
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Manage Donations</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={() => { fetchDonations(); fetchPrizePool(); }}
            className="flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          
          <button
            onClick={() => setIsAddingDonation(!isAddingDonation)}
            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            {isAddingDonation ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Donation
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Prize Pool Management */}
      <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Prize Pool</h2>
        
        {prizePool ? (
          <>
            {isEditingPool ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Current Amount
                  </label>
                  <div className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white">
                    ${prizePool.current_amount.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Target Amount ($)
                  </label>
                  <input
                    type="number"
                    value={editedTargetValue}
                    onChange={(e) => setEditedTargetValue(parseFloat(e.target.value))}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Total Donors
                  </label>
                  <div className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white">
                    {totalDonors}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdatePrizePool}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsEditingPool(false);
                      setEditedPoolValue(prizePool.current_amount);
                      setEditedTargetValue(prizePool.target_amount);
                    }}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-700/50 p-4 rounded-lg">
                    <div className="text-zinc-400 text-sm">Current Amount</div>
                    <div className="text-2xl font-bold text-white">
                      ${prizePool.current_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div className="bg-zinc-700/50 p-4 rounded-lg">
                    <div className="text-zinc-400 text-sm">Target Amount</div>
                    <div className="text-2xl font-bold text-white">
                      ${prizePool.target_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div className="bg-zinc-700/50 p-4 rounded-lg">
                    <div className="text-zinc-400 text-sm">Progress</div>
                    <div className="text-2xl font-bold text-white">
                      {Math.min(100, (prizePool.current_amount / prizePool.target_amount * 100)).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-zinc-700/50 p-4 rounded-lg">
                    <div className="text-zinc-400 text-sm">Total Donors</div>
                    <div className="text-2xl font-bold text-white">
                      {totalDonors}
                    </div>
                    </div>
                </div>
                
                <button
                  onClick={() => setIsEditingPool(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Prize Pool
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading prize pool data...</p>
          </div>
        )}
      </div>
      
      {/* Add Donation Form */}
      {isAddingDonation && (
        <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Add New Donation</h2>
          
          <form onSubmit={handleAddDonation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
                  Donor Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newDonation.name}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
                  Email*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newDonation.email}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-zinc-300 mb-1">
                  Amount ($)*
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={newDonation.amount}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="transaction_code" className="block text-sm font-medium text-zinc-300 mb-1">
                  Transaction Code*
                </label>
                <input
                  type="text"
                  id="transaction_code"
                  name="transaction_code"
                  value={newDonation.transaction_code}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
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
                value={newDonation.message}
                onChange={handleInputChange}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="show_on_leaderboard"
                      name="show_on_leaderboard"
                      checked={newDonation.show_on_leaderboard}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-zinc-600 text-green-600 focus:ring-green-500 bg-zinc-700"
                    />
                    <label htmlFor="show_on_leaderboard" className="ml-2 block text-sm text-zinc-300">
                      Show on leaderboard
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="use_admin_avatar"
                      name="use_admin_avatar"
                      checked={newDonation.use_admin_avatar}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-zinc-600 text-green-600 focus:ring-green-500 bg-zinc-700"
                    />
                    <label htmlFor="use_admin_avatar" className="ml-2 block text-sm text-zinc-300">
                      Use admin profile picture
                    </label>
                  </div>
                </div>

            
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Donation
              </button>
              
              <button
                type="button"
                onClick={() => setIsAddingDonation(false)}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Donations List */}
      <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-white">Donations List</h2>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading donations...</p>
          </div>
        ) : filteredDonations.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-zinc-800 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 bg-zinc-800 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 bg-zinc-800 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 bg-zinc-800 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Transaction Code</th>
                    <th className="px-4 py-3 bg-zinc-800 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 bg-zinc-800 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Verification</th>
                    <th className="px-4 py-3 bg-zinc-800 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">Leaderboard</th>
                    <th className="px-4 py-3 bg-zinc-800 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {filteredDonations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-zinc-700/30">
                      {editingDonationId === donation.id ? (
                        // Edit mode
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              name="name"
                              value={editedDonation.name || ''}
                              onChange={handleEditInputChange}
                              className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="email"
                              name="email"
                              value={editedDonation.email || ''}
                              onChange={handleEditInputChange}
                              className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              name="amount"
                              value={editedDonation.amount || 0}
                              onChange={handleEditInputChange}
                              className="w-24 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white text-sm text-right"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              name="transaction_code"
                              value={editedDonation.transaction_code || ''}
                              onChange={handleEditInputChange}
                              className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 text-zinc-400 text-sm">
                            {new Date(donation.created_at).toLocaleDateString()}
                          </td>
                       <td className="px-4 py-4 text-left space-x-2">
                            <button
                              onClick={() => handleVerifyDonation(donation.id, !donation.verified)}
                              className={`${
                                donation.verified 
                                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                                  : 'bg-green-600 hover:bg-green-700'
                              } text-white px-3 py-1 rounded transition-colors`}
                            >
                              {donation.verified ? 'Unverify' : 'Verify'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              name="show_on_leaderboard"
                              checked={editedDonation.show_on_leaderboard || false}
                              onChange={handleEditInputChange}
                              className="h-4 w-4 rounded border-zinc-600 text-green-600 focus:ring-green-500 bg-zinc-700"
                            />
                          </td>
                          <td className="px-4 py-3 text-right space-x-1">
                            <button
                              onClick={handleUpdateDonation}
                              className="bg-green-600 hover:bg-green-700 text-white p-1 rounded"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingDonationId(null)}
                              className="bg-zinc-600 hover:bg-zinc-500 text-white p-1 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>

                        </>
                      ) : (
                        // View mode
                        <>
                          <td className="px-4 py-3 text-white">{donation.name}</td>
                          <td className="px-4 py-3 text-zinc-300 text-sm">{donation.email}</td>
                          <td className="px-4 py-3 text-right font-medium text-green-400">
                            ${donation.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-zinc-300 font-mono text-sm">{donation.transaction_code}</td>
                          <td className="px-4 py-3 text-zinc-400 text-sm">
                            {new Date(donation.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-zinc-400 text-sm">
                            {(donation.verified.valueOf() ? 'Verified' : 'Unverified') + (donation.verified_at ? ` (${new Date(donation.verified_at).toLocaleDateString()})` : '')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {donation.show_on_leaderboard ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500/20 rounded-full">
                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-zinc-500/20 rounded-full">
                                <span className="h-2 w-2 rounded-full bg-zinc-500"></span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right space-x-1">
                            <button
                              onClick={() => startEditDonation(donation)}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDonation(donation.id)}
                              className="bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-zinc-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-zinc-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-zinc-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-zinc-400">No donations found.</p>
          </div>
        )}
      </div>
      <DeleteConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Donation"
          description="Are you sure you want to delete this donation? This action cannot be undone."
        />
    </div>
  );
}