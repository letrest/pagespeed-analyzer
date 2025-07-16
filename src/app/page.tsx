'use client';

import { useState, FormEvent } from 'react';
import Image from "next/image";

interface PageSpeedData {
  lighthouseResult?: {
    categories?: {
      performance?: {
        score?: number;
      };
      accessibility?: {
        score?: number;
      };
      seo?: {
        score?: number;
      };
      'best-practices'?: {
        score?: number;
      };
    };
    audits?: {
      'final-screenshot'?: {
        details?: {
          data?: string;
        };
      };
    };
    requestedUrl?: string;
    finalUrl?: string;
  };
  loadingExperience?: {
    metrics?: {
      CUMULATIVE_LAYOUT_SHIFT_SCORE?: {
        percentile?: number;
        category?: string;
      };
      FIRST_CONTENTFUL_PAINT_MS?: {
        percentile?: number;
        category?: string;
      };
      LARGEST_CONTENTFUL_PAINT_MS?: {
        percentile?: number;
        category?: string;
      };
    };
  };
}

interface ReportData {
  desktopScreenshotUrl: string;
  mobileScreenshotUrl: string;
  pagespeedData: PageSpeedData;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze URL');
      }

      const data: ReportData = await response.json();
      setReport(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderScore = (score: number | undefined) => {
    if (score === undefined) return 'N/A';
    const value = Math.round(score * 100);
    let color = 'text-gray-700';
    if (value >= 90) color = 'text-green-500';
    else if (value >= 50) color = 'text-yellow-500';
    else color = 'text-red-500';
    return <span className={color}>{value}</span>;
  };

  const renderMetric = (metric: { percentile?: number; category?: string } | undefined, unit: string = '') => {
    if (!metric || metric.percentile === undefined) return 'N/A';
    let categoryColor = 'text-gray-700';
    if (metric.category === 'FAST') categoryColor = 'text-green-500';
    else if (metric.category === 'AVERAGE') categoryColor = 'text-yellow-500';
    else if (metric.category === 'SLOW') categoryColor = 'text-red-500';
    return <span className={categoryColor}>{metric.percentile}{unit} ({metric.category})</span>;
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-12">
        <h1 className="text-4xl font-bold text-center text-gray-800 w-full">PageSpeed Analyzer</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white p-8 rounded-lg shadow-md mb-12">
        <div className="mb-6">
          <label htmlFor="urlInput" className="block mb-2 text-sm font-medium text-gray-700">
            Enter URL to Analyze
          </label>
          <input
            type="url"
            id="urlInput"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-gray-400"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {isLoading && (
        <div className="mt-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Fetching report, this may take a moment...</p>
        </div>
      )}

      {error && (
        <div className="mt-8 p-6 bg-red-100 text-red-700 rounded-lg shadow-md w-full max-w-xl">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      )}

      {report && (
        <div className="mt-8 w-full max-w-5xl bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800 border-b pb-4">
            Analysis Report for: <a href={report.pagespeedData.lighthouseResult?.requestedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{report.pagespeedData.lighthouseResult?.requestedUrl}</a>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-700">Screenshot</h3>
              {report.desktopScreenshotUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={report.desktopScreenshotUrl + `?t=${new Date().getTime()}`} 
                  alt="Website Desktop screenshot" 
                  className="rounded-lg border border-gray-300 shadow-md"
                />
              )}
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-700">Performance Scores</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-600">Performance:</span>
                  {renderScore(report.pagespeedData.lighthouseResult?.categories?.performance?.score)}
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-600">Accessibility:</span>
                  {renderScore(report.pagespeedData.lighthouseResult?.categories?.accessibility?.score)}
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-600">Best Practices:</span>
                  {renderScore(report.pagespeedData.lighthouseResult?.categories?.['best-practices']?.score)}
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-600">SEO:</span>
                  {renderScore(report.pagespeedData.lighthouseResult?.categories?.seo?.score)}
                </div>
              </div>

              <h3 className="text-2xl font-semibold mt-8 mb-4 text-gray-700">Core Web Vitals</h3>
              <div className="space-y-3">
                 <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-600">Largest Contentful Paint (LCP):</span>
                  {renderMetric(report.pagespeedData.loadingExperience?.metrics?.LARGEST_CONTENTFUL_PAINT_MS, 'ms')}
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-600">First Contentful Paint (FCP):</span>
                  {renderMetric(report.pagespeedData.loadingExperience?.metrics?.FIRST_CONTENTFUL_PAINT_MS, 'ms')}
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-600">Cumulative Layout Shift (CLS):</span>
                  {renderMetric(report.pagespeedData.loadingExperience?.metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE)}
                </div>
              </div>
            </div>
          </div>

          {report.pagespeedData.lighthouseResult?.finalUrl && report.pagespeedData.lighthouseResult.finalUrl !== report.pagespeedData.lighthouseResult.requestedUrl && (
            <p className="mt-6 text-sm text-gray-600">
              Note: The analysis was performed on the final URL after redirects: 
              <a href={report.pagespeedData.lighthouseResult.finalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{report.pagespeedData.lighthouseResult.finalUrl}</a>
            </p>
          )}
        </div>
      )}
    </main>
  );
}
