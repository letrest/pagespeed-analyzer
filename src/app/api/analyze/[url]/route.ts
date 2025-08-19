import { NextRequest, NextResponse } from 'next/server';
import { directAnalyze, psiAnalyze } from '@/../lib/helper/analyze'; // Import direct analysis function


export async function GET(request: NextRequest, { params }: { params: { url: string } }) {
  const { url } = await params

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }
  console.log('Received URL:', url);
  const protocol = url.startsWith('https') ? 'https://' : url.startsWith('http') ? 'http://' : 'http://'; // Ensure URL has protocol
  const domain = url.split('-')[1].replace(/[^a-zA-Z0-9.]/g, '') + '.' + url.split('-')[2].replace(/[^a-zA-Z0-9.]/g, ''); // Parsed Domain from URL
  const pathIndex = url.split('-',3).join('-').length; // Find the index of the second hyphen
  const pathName = url.slice(pathIndex).replaceAll('-', '/').replaceAll('//', '-'); // Parsed Path from URL
  const fullSite = protocol + domain; // Remove special characters from the URL
  const fullPath = fullSite + pathName; // Full URL with path
  console.log('Domain:', domain);
  console.log('Site URL:', fullSite);
  console.log('Path Name:', pathName);
  try {
    const directAnalyzeResult = await directAnalyze(fullPath);
    if (!directAnalyzeResult) {
      return NextResponse.json({ error: 'Failed to get direct analysis.' }, { status: 500 });
    }
    const { desktopScreenshotPath, mobileScreenshotPath } = directAnalyzeResult;
    // Fetch PageSpeed Insights data
    const psiResult = await psiAnalyze(fullPath);
    // console.log('PageSpeed Insights data:', JSON.stringify(psiResult));

    return NextResponse.json({
      desktopScreenshotUrl: desktopScreenshotPath ? desktopScreenshotPath : null,
      mobileScreenshotUrl: mobileScreenshotPath ? mobileScreenshotPath : null,
      pagespeedData: psiResult,
    });
  } catch (error) {
      console.error('Error in analyze endpoint:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return NextResponse.json({ error: 'Failed to analyze URL', details: errorMessage }, { status: 500 });
  }
}
