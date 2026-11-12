'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Plus, X, Edit, Save, Search, Trash, Check, Minus,
} from 'lucide-react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/app/components/donate/DeleteConfirmationDialog';
import { formatDateShort } from '@/app/lib/formatDate';

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

function formatUSD(n: number | null | undefined, withCents = false): string {
  const v = n || 0;
  return '$' + v.toLocaleString('en-US', {
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  });
}

const EMPTY_NEW_DONATION = {
  name: '',
  email: '',
  amount: '',
  transaction_code: '',
  message: '',
  show_on_leaderboard: true,
  use_admin_avatar: false,
};

export default function AdminEditDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<string | null>(null);

  const [prizePool, setPrizePool] = useState<PrizePool | null>(null);
  const [isEditingPool, setIsEditingPool] = useState(false);
  const [editedTargetValue, setEditedTargetValue] = useState(0);
  const [totalDonors, setTotalDonors] = useState(0);

  const [isAddingDonation, setIsAddingDonation] = useState(false);
  const [newDonation, setNewDonation] = useState({ ...EMPTY_NEW_DONATION });

  const [editingDonationId, setEditingDonationId] = useState<string | null>(null);
  const [editedDonation, setEditedDonation] = useState<Partial<Donation>>({});

  const itemsPerPage = 10;

  useEffect(() => {
    fetchDonations();
    fetchPrizePool();
    fetchDonors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = donations.filter((d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.transaction_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDonations(filtered);
    } else {
      setFilteredDonations(donations);
    }
  }, [searchTerm, donations]);

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        '/api/admin/donations?page=' + currentPage + '&limit=' + itemsPerPage
      );
      if (!response.ok) throw new Error('Failed to fetch donations');
      const data = await response.json();
      const formattedDonations = data.donations.map((donation: Donation) => ({
        ...donation,
        id: donation.id.toString(),
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
    } catch (error) {
      console.error('Error fetching donors:', error);
      toast.error('Failed to load donors');
    }
  };

  const fetchPrizePool = async () => {
    try {
      const response = await fetch('/api/admin/donations/prize-pool');
      if (!response.ok) throw new Error('Failed to fetch prize pool data');
      const data = await response.json();
      setPrizePool(data);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_amount: targetAmount }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update target amount');
      await fetchPrizePool();
      setIsEditingPool(false);
      toast.success('Target amount updated');
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
      const response = await fetch('/api/admin/donations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDonation,
          transaction_code: newDonation.transaction_code,
          amount: parseFloat(newDonation.amount),
        }),
      });
      if (!response.ok) throw new Error('Failed to add donation');
      await Promise.all([fetchDonations(), fetchPrizePool(), fetchDonors()]);
      setNewDonation({ ...EMPTY_NEW_DONATION });
      setIsAddingDonation(false);
      toast.success('Donation added');
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
        amount:
          typeof editedDonation.amount === 'string'
            ? parseFloat(editedDonation.amount)
            : editedDonation.amount,
        show_on_leaderboard: Boolean(editedDonation.show_on_leaderboard),
      };
      const response = await fetch('/api/admin/donations/' + editingDonationId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Update failed');
      }
      await Promise.all([fetchDonations(), fetchDonors(), fetchPrizePool()]);
      toast.success('Donation updated');
      setEditingDonationId(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update donation');
    }
  };

  const handleDeleteDonation = (id: string) => {
    setDonationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!donationToDelete) return;
    try {
      const response = await fetch('/api/admin/donations/' + donationToDelete, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete donation');
      await Promise.all([fetchDonations(), fetchPrizePool(), fetchDonors()]);
      toast.success('Donation deleted');
    } catch (error) {
      console.error('Error deleting donation:', error);
      toast.error('Failed to delete donation');
    } finally {
      setDonationToDelete(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setNewDonation({ ...newDonation, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setNewDonation({ ...newDonation, [name]: value });
    }
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    if (name === 'show_on_leaderboard') {
      setEditedDonation({ ...editedDonation, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === 'amount') {
      setEditedDonation({ ...editedDonation, [name]: parseFloat(value) });
    } else {
      setEditedDonation({ ...editedDonation, [name]: value });
    }
  };

  const handleVerifyDonation = async (donationId: string, verify: boolean) => {
    try {
      setIsLoading(true);
      if (!donationId) throw new Error('Invalid donation ID');
      const response = await fetch('/api/admin/donations/' + donationId + '/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: verify }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update verification status');
      }
      const data = await response.json();
      toast.success(data.message);
      await Promise.all([fetchDonations(), fetchDonors(), fetchPrizePool()]);
    } catch (error) {
      console.error('Error verifying donation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update verification status');
    } finally {
      setIsLoading(false);
    }
  };

  const progressPct = prizePool
    ? Math.min(100, (prizePool.current_amount / Math.max(prizePool.target_amount, 1)) * 100)
    : 0;

  return (
    <div className="admin-donations">
      <header className="admin-donations__toolbar">
        <p className="admin-donations__hint">
          Manage the prize pool target and every donation submission.
        </p>
        <div className="admin-donations__actions">
          <button
            type="button"
            onClick={() => {
              fetchDonations();
              fetchPrizePool();
              fetchDonors();
            }}
            className="btn btn--secondary"
          >
            <span className="btn__label">
              <RefreshCw size={14} style={{ marginRight: 8 }} />
              Refresh
            </span>
            <span className="btn__label btn__label--dup" aria-hidden="true">
              <RefreshCw size={14} style={{ marginRight: 8 }} />
              Refresh
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddingDonation((v) => !v)}
            className="btn btn--primary"
          >
            <span className="btn__label">
              {isAddingDonation ? (
                <>
                  <X size={14} style={{ marginRight: 8 }} />
                  Cancel
                </>
              ) : (
                <>
                  <Plus size={14} style={{ marginRight: 8 }} />
                  Add donation
                </>
              )}
            </span>
            <span className="btn__label btn__label--dup" aria-hidden="true">
              {isAddingDonation ? 'Cancel' : 'Add donation'}
            </span>
          </button>
        </div>
      </header>

      <section className="admin-panel">
        <header className="admin-panel__head">
          <h2 className="admin-panel__title">Prize pool</h2>
          <p className="admin-panel__desc">Public-facing totals shown on the donate page.</p>
        </header>
        <div className="admin-panel__body">
          {prizePool ? (
            isEditingPool ? (
              <form onSubmit={handleUpdatePrizePool} className="admin-donations__pool-form">
                <div className="admin-donations__pool-grid">
                  <div className="field">
                    <span className="field__label">Current amount</span>
                    <div className="admin-donations__readonly">
                      {formatUSD(prizePool.current_amount, true)}
                    </div>
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="pool-target">
                      Target amount (USD) <span className="field__label-req">*</span>
                    </label>
                    <input
                      id="pool-target"
                      type="number"
                      value={editedTargetValue}
                      onChange={(e) => setEditedTargetValue(parseFloat(e.target.value))}
                      className="input"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="field">
                    <span className="field__label">Total donors</span>
                    <div className="admin-donations__readonly">{totalDonors}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn--primary btn--sm">
                    <span className="btn__label">
                      <Save size={14} style={{ marginRight: 6 }} />
                      Save
                    </span>
                    <span className="btn__label btn__label--dup" aria-hidden="true">Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPool(false);
                      setEditedTargetValue(prizePool.target_amount);
                    }}
                    className="btn btn--secondary btn--sm"
                  >
                    <span className="btn__label">Cancel</span>
                    <span className="btn__label btn__label--dup" aria-hidden="true">Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                <dl className="admin-donations__pool-stats">
                  <div>
                    <dt>Current</dt>
                    <dd>{formatUSD(prizePool.current_amount, true)}</dd>
                  </div>
                  <div>
                    <dt>Target</dt>
                    <dd>{formatUSD(prizePool.target_amount, true)}</dd>
                  </div>
                  <div>
                    <dt>Progress</dt>
                    <dd>{progressPct.toFixed(1)}%</dd>
                  </div>
                  <div>
                    <dt>Donors</dt>
                    <dd>{totalDonors.toLocaleString('en-US')}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => setIsEditingPool(true)}
                  className="btn btn--secondary btn--sm"
                  style={{ marginTop: 16 }}
                >
                  <span className="btn__label">
                    <Edit size={14} style={{ marginRight: 6 }} />
                    Edit prize pool
                  </span>
                  <span className="btn__label btn__label--dup" aria-hidden="true">
                    <Edit size={14} style={{ marginRight: 6 }} />
                    Edit prize pool
                  </span>
                </button>
              </>
            )
          ) : (
            <div className="skeleton" style={{ height: 96 }} />
          )}
        </div>
      </section>

      {isAddingDonation && (
        <section className="admin-panel">
          <header className="admin-panel__head">
            <h2 className="admin-panel__title">Add donation</h2>
            <p className="admin-panel__desc">Directly insert a verified donation.</p>
          </header>
          <form onSubmit={handleAddDonation} className="admin-panel__body admin-donations__form">
            <div className="admin-donations__form-row">
              <div className="field">
                <label htmlFor="new-name" className="field__label">
                  Donor name <span className="field__label-req">*</span>
                </label>
                <input
                  id="new-name"
                  type="text"
                  name="name"
                  value={newDonation.name}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="new-email" className="field__label">
                  Email <span className="field__label-req">*</span>
                </label>
                <input
                  id="new-email"
                  type="email"
                  name="email"
                  value={newDonation.email}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="admin-donations__form-row">
              <div className="field">
                <label htmlFor="new-amount" className="field__label">
                  Amount (USD) <span className="field__label-req">*</span>
                </label>
                <input
                  id="new-amount"
                  type="number"
                  name="amount"
                  value={newDonation.amount}
                  onChange={handleInputChange}
                  className="input"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="new-tx" className="field__label">
                  Transaction code <span className="field__label-req">*</span>
                </label>
                <input
                  id="new-tx"
                  type="text"
                  name="transaction_code"
                  value={newDonation.transaction_code}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="new-message" className="field__label">
                Message <span style={{ color: 'var(--m)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="new-message"
                name="message"
                value={newDonation.message}
                onChange={handleInputChange}
                className="input input--multi"
                rows={3}
              />
            </div>

            <div className="admin-donations__checks">
              <label className="admin-donations__check">
                <input
                  type="checkbox"
                  name="show_on_leaderboard"
                  checked={newDonation.show_on_leaderboard}
                  onChange={handleInputChange}
                />
                <span>Show on leaderboard</span>
              </label>
              <label className="admin-donations__check">
                <input
                  type="checkbox"
                  name="use_admin_avatar"
                  checked={newDonation.use_admin_avatar}
                  onChange={handleInputChange}
                />
                <span>Use admin profile picture</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn--primary">
                <span className="btn__label">
                  <Plus size={14} style={{ marginRight: 8 }} />
                  Add donation
                </span>
                <span className="btn__label btn__label--dup" aria-hidden="true">
                  <Plus size={14} style={{ marginRight: 8 }} />
                  Add donation
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingDonation(false)}
                className="btn btn--secondary"
              >
                <span className="btn__label">Cancel</span>
                <span className="btn__label btn__label--dup" aria-hidden="true">Cancel</span>
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-panel">
        <header className="admin-panel__head">
          <div className="admin-donations__list-head">
            <div>
              <h2 className="admin-panel__title">Donations</h2>
              <p className="admin-panel__desc">All submissions, verified or pending.</p>
            </div>
            <div className="admin-donations__search">
              <Search size={14} />
              <input
                type="search"
                placeholder="Search name, email, or code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-donations__search-input"
                aria-label="Search donations"
              />
            </div>
          </div>
        </header>

        <div className="admin-donations__table-wrap">
          {isLoading ? (
            <div style={{ display: 'grid', gap: 8, padding: 16 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ height: 40 }} />
              ))}
            </div>
          ) : filteredDonations.length > 0 ? (
            <table className="admin-donations__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Code</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Public</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((donation) =>
                  editingDonationId === donation.id ? (
                    <tr key={donation.id} className="admin-donations__row admin-donations__row--editing">
                      <td>
                        <input
                          type="text"
                          name="name"
                          value={editedDonation.name || ''}
                          onChange={handleEditInputChange}
                          className="input"
                          style={{ height: 32, fontSize: 13 }}
                          aria-label="Name"
                        />
                      </td>
                      <td>
                        <input
                          type="email"
                          name="email"
                          value={editedDonation.email || ''}
                          onChange={handleEditInputChange}
                          className="input"
                          style={{ height: 32, fontSize: 13 }}
                          aria-label="Email"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="amount"
                          value={editedDonation.amount || 0}
                          onChange={handleEditInputChange}
                          className="input"
                          style={{ height: 32, fontSize: 13, textAlign: 'right' }}
                          min="0"
                          step="0.01"
                          aria-label="Amount"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="transaction_code"
                          value={editedDonation.transaction_code || ''}
                          onChange={handleEditInputChange}
                          className="input"
                          style={{ height: 32, fontSize: 13 }}
                          aria-label="Transaction code"
                        />
                      </td>
                      <td className="admin-donations__muted">{formatDateShort(donation.created_at)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleVerifyDonation(donation.id, !donation.verified)}
                          className="admin-donations__verify-btn"
                          data-on={donation.verified ? 'true' : 'false'}
                        >
                          {donation.verified ? 'Unverify' : 'Verify'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          name="show_on_leaderboard"
                          checked={editedDonation.show_on_leaderboard || false}
                          onChange={handleEditInputChange}
                          aria-label="Show on leaderboard"
                          style={{ accentColor: 'var(--g)' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={handleUpdateDonation}
                          className="admin-donations__icon-btn admin-donations__icon-btn--ok"
                          aria-label="Save changes"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDonationId(null)}
                          className="admin-donations__icon-btn"
                          aria-label="Cancel edit"
                        >
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={donation.id} className="admin-donations__row">
                      <td className="admin-donations__cell-strong">{donation.name}</td>
                      <td className="admin-donations__muted">{donation.email}</td>
                      <td className="admin-donations__amount">{formatUSD(donation.amount, true)}</td>
                      <td className="admin-donations__mono">{donation.transaction_code}</td>
                      <td className="admin-donations__muted">{formatDateShort(donation.created_at)}</td>
                      <td>
                        {donation.verified ? (
                          <span className="tag tag--event">
                            <Check size={10} />
                            Verified
                          </span>
                        ) : (
                          <span className="tag" style={{ '--c': 'var(--m)' } as React.CSSProperties}>
                            <Minus size={10} />
                            Pending
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {donation.show_on_leaderboard ? (
                          <span className="admin-donations__dot" data-on="true" aria-label="Visible" />
                        ) : (
                          <span className="admin-donations__dot" aria-label="Hidden" />
                        )}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => startEditDonation(donation)}
                          className="admin-donations__icon-btn"
                          aria-label="Edit donation"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDonation(donation.id)}
                          className="admin-donations__icon-btn admin-donations__icon-btn--danger"
                          aria-label="Delete donation"
                        >
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          ) : (
            <p className="admin-donations__empty">No donations found.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="admin-donations__pager">
            <span className="admin-donations__pager-label">
              Page {currentPage} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn btn--secondary btn--sm"
              >
                <span className="btn__label">Previous</span>
                <span className="btn__label btn__label--dup" aria-hidden="true">Previous</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn btn--secondary btn--sm"
              >
                <span className="btn__label">Next</span>
                <span className="btn__label btn__label--dup" aria-hidden="true">Next</span>
              </button>
            </div>
          </div>
        )}
      </section>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete donation"
        description="Are you sure you want to delete this donation? This action cannot be undone."
      />
    </div>
  );
}
