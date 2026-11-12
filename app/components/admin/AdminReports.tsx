'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { DeleteConfirmationDialog } from '@/app/components/donate/DeleteConfirmationDialog';

interface Report {
  id: string;
  post_id: string;
  reported_by: string;
  reason: string;
  type: string;
  created_at: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  post: {
    title: string;
    content: string;
    author: { name: string; email: string };
  };
  reporter: { name: string; email: string };
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPostId, setPendingPostId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/lounge/posts/report');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch reports');
      setReports(data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (postId: string) => {
    setPendingPostId(postId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingPostId) return;
    const postId = pendingPostId;
    setPendingPostId(null);

    try {
      const response = await fetch('/api/lounge/posts/' + postId, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete post');
      toast.success('Post deleted');
      fetchReports();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const toggleExpand = (reportId: string) => {
    setExpandedReports((prev) => {
      const next = new Set(prev);
      if (next.has(reportId)) next.delete(reportId);
      else next.add(reportId);
      return next;
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" style={{ height: 132, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">No open reports.</p>
        <p className="empty-state__desc">
          Reported lounge posts appear here for review.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-reports">
        {reports.map((report) => {
          const expanded = expandedReports.has(report.id);
          return (
            <article key={report.id} className="admin-report">
              <header className="admin-report__head">
                <div className="admin-report__meta">
                  <span className="tag" style={{ '--c': 'var(--a)' } as React.CSSProperties}>
                    <AlertTriangle size={10} />
                    {report.type}
                  </span>
                  <span className="admin-report__time" suppressHydrationWarning>
                    {formatDistanceToNow(new Date(report.created_at))} ago
                  </span>
                </div>
                <div className="admin-report__actions">
                  <Link
                    href={'/lounge/' + report.post_id}
                    target="_blank"
                    className="admin-report__icon-btn"
                    aria-label="Open post"
                  >
                    <ExternalLink size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => requestDelete(report.post_id)}
                    className="admin-report__icon-btn admin-report__icon-btn--danger"
                    aria-label="Delete post"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </header>

              <h3 className="admin-report__title">{report.post.title}</h3>

              <dl className="admin-report__who">
                <div>
                  <dt>Reporter</dt>
                  <dd>{report.reporter.name}</dd>
                </div>
                <div>
                  <dt>Author</dt>
                  <dd>{report.post.author.name}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => toggleExpand(report.id)}
                className="admin-report__toggle"
                aria-expanded={expanded}
              >
                {expanded ? 'Show less' : 'Show details'}
              </button>

              {expanded && (
                <div className="admin-report__details">
                  <section className="admin-report__block">
                    <p className="admin-report__block-title">Reason</p>
                    <p className="admin-report__block-text">{report.reason}</p>
                  </section>
                  <section className="admin-report__block">
                    <p className="admin-report__block-title">Post content</p>
                    <p className="admin-report__block-text admin-report__block-text--pre">
                      {report.post.content}
                    </p>
                  </section>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <DeleteConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete post"
        description="Delete this post and all its comments? This cannot be undone."
      />
    </>
  );
}
