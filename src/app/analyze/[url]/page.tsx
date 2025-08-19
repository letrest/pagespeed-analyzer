import { notFound } from 'next/navigation';
import Image from 'next/image';
import { NextRequest, NextResponse } from 'next/server';

interface PageSpeedResult {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pagespeedData: {
        id: string;
        analysisUTCTimestamp: string;
        loadingExperience: {
            metrics: {
                LARGEST_CONTENTFUL_PAINT_MS: {percentile: number};
                INTERACTION_TO_NEXT_PAINT: {percentile: number};
                CUMULATIVE_LAYOUT_SHIFT_SCORE: {percentile: number};
                FIRST_CONTENTFUL_PAINT_MS: {percentile: number};
                EXPERIMENTAL_TIME_TO_FIRST_BYTE: {percentile: number};
            };
        };
        lighthouseResult: {
            categories: {
                performance: { score: number };
            };
        };
    };
    desktopScreenshotUrl: string;
    mobileScreenshotUrl: string;
}

async function getPageSpeedData(url: string): Promise<PageSpeedResult | null> {
    const res = await fetch(`${process.env.SERVER_URL}/api/analyze/${ url}`);
    if (!res.ok) return null;
    return res.json();
}

export default async function AnalyzePage({ params }: { params: { url: string } }) {
    const { url } = await params

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    const data = await getPageSpeedData(url);

    if (!data) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">PageSpeed Insights Report for {data.pagespeedData.id}</h1>
            <div className='mb-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Image
                    src={`/${data.desktopScreenshotUrl}`}
                    alt={`Screenshot of ${url}`}
                    width={800}
                    height={600}
                    className="rounded-lg shadow-md"
                />
                <Image
                    src={`/${data.mobileScreenshotUrl}`}
                    alt={`Screenshot of ${url}`}
                    width={300}
                    height={600}
                    className="rounded-lg shadow-md"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Performance</h2>
                    <p className="text-lg">{data.pagespeedData.lighthouseResult.categories.performance.score*100}%</p>
                </div>
                <div className="p-4 border rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Accessibility</h2>
                    <p className="text-lg">{data.accessibility}%</p>
                </div>
                <div className="p-4 border rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Best Practices</h2>
                    <p className="text-lg">{data.bestPractices}%</p>
                </div>
                <div className="p-4 border rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">SEO</h2>
                    <p className="text-lg">{data.seo}%</p>
                </div>
            </div>
            <div className="mt-6 p-4 border rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Core Web Vitals</h2>
                <ul className="list-disc pl-5">
                <li>Largest Contentful Paint: {data.pagespeedData.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile} s</li>
                <li>Interaction to Next Paint: {data.pagespeedData.loadingExperience.metrics.INTERACTION_TO_NEXT_PAINT.percentile} ms</li>
                <li>Cumulative Layout Shift: {data.pagespeedData.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile}</li>
                <li>First Contentful Paint: {data.pagespeedData.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.percentile} ms</li>
                <li>Time to First Byte: {data.pagespeedData.loadingExperience.metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE.percentile} ms</li>
                </ul>
            </div>
            <div className="mt-6 p-4 border rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Analysis run on</h2>
                <p>{new Date(data.pagespeedData.analysisUTCTimestamp).toLocaleString()}</p>
            </div>
        </div>
    );
}