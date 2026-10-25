'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, ExternalLink, Trash2, Flag } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

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
    author: {
      name: string;
      email: string;
    };
  };
  reporter: {
    name: string;
    email: string;
  };
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/lounge/posts/report');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      setReports(data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/lounge/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');

      toast.success('Post deleted successfully');
      fetchReports();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const toggleExpand = (reportId: string) => {
    const newExpanded = new Set(expandedReports);
    if (expandedReports.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Flag className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
        <h2 className="text-lg font-semibold text-foreground">Reported Posts</h2>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No reports found
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-card/50 border border-border rounded-lg overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-500">
                        {report.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(report.created_at))} ago
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {report.post.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Reporter: {report.reporter.name}</span>
                      <span>Author: {report.post.author.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/lounge/${report.post_id}`}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      target="_blank"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDeletePost(report.post_id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => toggleExpand(report.id)}
                  className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedReports.has(report.id) ? 'Show less' : 'Show more'}
                </button>

                {expandedReports.has(report.id) && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">
                        Report Reason
                      </h4>
                      <p className="text-sm text-muted-foreground">{report.reason}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">
                        Post Content
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {report.post.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}