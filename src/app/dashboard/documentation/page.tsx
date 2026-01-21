'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Upload,
  Eye,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react';
import { EmptyState } from '@/components';
import { getClientBranding } from '@/config/branding';
import { authenticatedFetch } from '@/lib/api/client';
import type {
  DocumentationArticle,
  DocumentationStats,
  ApiResponse,
} from '@/types/api';

export default function DocumentationPage() {
  const [docs, setDocs] = useState<DocumentationArticle[]>([]);
  const [stats, setStats] = useState<DocumentationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const branding = getClientBranding();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [docsRes, statsRes] = await Promise.all([
        authenticatedFetch('/api/documentation'),
        authenticatedFetch('/api/documentation/stats'),
      ]);

      const [docsData, statsData]: [
        ApiResponse<DocumentationArticle[]>,
        ApiResponse<DocumentationStats>
      ] = await Promise.all([docsRes.json(), statsRes.json()]);

      if (docsData.success && docsData.data) {
        // Sort by most recent update
        const sortedDocs = docsData.data.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setDocs(sortedDocs);
      }

      if (statsData.success && statsData.data) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching documentation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    alert('Upload documentation functionality coming soon!\n\nYou will be able to:\n- Upload markdown files\n- Create articles in the editor\n- Import from external sources');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const calculateAIEnablement = (viewCount: number, maxViews: number) => {
    // Calculate AI enablement based on engagement
    // Higher view count = better AI training
    return Math.min(Math.round((viewCount / maxViews) * 100), 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  // Show empty state if no docs
  if (docs.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documentation</h1>
            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <Upload className="w-4 h-4" />
              Upload Documentation
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Access and manage your knowledge base, FAQs, and support documentation.
          </p>
        </div>

        <EmptyState
          icon={BookOpen}
          title="No Documentation Yet"
          description="Upload your first documentation article to build your AI-powered knowledge base. Articles help train the AI and provide instant answers to customer questions."
        />
      </div>
    );
  }

  const maxViews = stats
    ? Math.max(...stats.categories.map((c) => c.viewCount))
    : 1000;
  const topCategories = stats ? stats.categories.slice(0, 4) : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documentation</h1>
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: branding.primaryColor }}
          >
            <Upload className="w-4 h-4" />
            Upload Documentation
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Access and manage your knowledge base, FAQs, and support documentation.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && topCategories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {topCategories.map((category, index) => {
            const aiEnablement = calculateAIEnablement(
              category.viewCount,
              maxViews
            );

            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${branding.primaryColor}15` }}
                  >
                    <BookOpen
                      className="w-5 h-5"
                      style={{ color: branding.primaryColor }}
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {category.count}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">articles</p>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {category.name}
                </h3>

                {/* AI Enablement Progress Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">AI Enabled</span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: branding.primaryColor }}
                    >
                      {aiEnablement}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${aiEnablement}%`,
                        backgroundColor: branding.primaryColor,
                      }}
                    ></div>
                  </div>
                </div>

                {/* View Count */}
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-3">
                  <Eye className="w-3 h-3" />
                  <span>{category.viewCount.toLocaleString()} views</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overall Stats Summary */}
      {stats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${branding.primaryColor}15` }}
              >
                <BookOpen
                  className="w-5 h-5"
                  style={{ color: branding.primaryColor }}
                />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalArticles}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Articles</p>
              </div>
            </div>

            <div className="h-12 w-px bg-gray-200 dark:bg-gray-700"></div>

            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${branding.primaryColor}15` }}
              >
                <Eye
                  className="w-5 h-5"
                  style={{ color: branding.primaryColor }}
                />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalViews.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
              </div>
            </div>

            <div className="h-12 w-px bg-gray-200 dark:bg-gray-700"></div>

            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${branding.primaryColor}15` }}
              >
                <TrendingUp
                  className="w-5 h-5"
                  style={{ color: branding.primaryColor }}
                />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.categories.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Documentation Articles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Recent Documentation
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() =>
                alert(
                  `Documentation Article\n\nID: ${doc.id}\nTitle: ${doc.title}\n\n(Full article viewer coming soon)`
                )
              }
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left Section */}
                <div className="flex-1 min-w-0">
                  {/* Title and Category */}
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {doc.title}
                    </h3>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      {doc.category}
                    </span>
                  </div>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      <span className="font-medium">Author:</span> {doc.author}
                    </span>
                    <span>
                      <span className="font-medium">Updated:</span>{' '}
                      {formatDate(doc.updatedAt)}
                    </span>
                    <span className="font-medium">ID: {doc.id}</span>
                  </div>

                  {/* Tags */}
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {doc.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Content Preview */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {doc.content}
                  </p>
                </div>

                {/* Right Section - Stats */}
                <div className="flex lg:flex-col gap-4 lg:gap-2 lg:items-end">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">
                      {doc.viewCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="font-medium">
                      {doc.helpfulCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
