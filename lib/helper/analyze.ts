import puppeteer from 'puppeteer';
import path from 'path';
import example_json from '@/../example_data/example_json.json' // Import example JSON for testing;
import { NextResponse } from 'next/dist/server/web/spec-extension/response';

export async function directAnalyze(url: string) {
  // Direct puppeteer analysis logic goes here
    let browser;
    try {
        // Launch Puppeteer
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 }); // Set desktop viewport size

        console.log('Navigating to URL:', url);
        // Navigate to the URL and take a desktop screenshot
        await page.goto(url, { waitUntil: 'networkidle0' });
        const desktopScreenshotPath = path.join(url.replace("://", "_") + '_desktop.png');
        await page.screenshot({ path: path.join('public',desktopScreenshotPath) });

        await page.setViewport({ width: 360, height: 800 }); // Set mobile viewport size

        // Navigate to the URL and take a mobile screenshot
        await page.goto(url, { waitUntil: 'networkidle0' });
        const mobileScreenshotPath = path.join(url.replace("://", "_")  + '_mobile.png');
        await page.screenshot({ path: path.join('public',mobileScreenshotPath) });
        await page.close();
        if (browser) {
            await browser.close();
        }
        console.log('Screenshots taken successfully');
        return {
            desktopScreenshotPath,
            mobileScreenshotPath
        };
    } catch (error) {
        console.error('Error during Puppeteer analysis:', error);
    }
    finally {
    if (browser) {
      await browser.close();
    }
  }
}
export async function psiAnalyze(url: string) {
    // PageSpeed Insights analysis logic goes here
    try {
        // const apiKey = process.env.PAGESPEED_API_KEY;
        // if (!apiKey) {
        //     console.error('PAGESPEED_API_KEY is not set.');
        //     return NextResponse.json({ error: 'PageSpeed API key is not configured.' }, { status: 500 });
        // }
        // const desktopPagespeedApiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=DESKTOP`; // Added DESKTOP strategy
        // const pagespeedResponse = await fetch(desktopPagespeedApiUrl);
        // const pagespeedData = await pagespeedResponse.json();
        

        // if (pagespeedResponse.status !== 200) {
        //   console.error('Error fetching PageSpeed Insights data:', pagespeedData);
        //   if(pagespeedResponse.status === 500 && pagespeedData.error && pagespeedData.error.errors) {
        //     const errorDetails = pagespeedData.error.errors.map((error: any) => error.message).join(', ');
        //     console.error('PageSpeed Insights error details:', errorDetails);
        //     return NextResponse.json({ error: 'Failed to fetch PageSpeed Insights data', details: errorDetails }, { status: 500 });
        //   }
        //   return NextResponse.json({ error: 'Failed to fetch PageSpeed Insights data', details: pagespeedData }, { status: pagespeedResponse.status });
        // }
        const pagespeedData = example_json; // Use example JSON for testing
        return pagespeedData;

    }
    catch (error) {
        console.error('Error fetching PageSpeed Insights data:', error);
        return NextResponse.json({ error: 'Failed to fetch PageSpeed Insights data', details: error.message }, { status: 500 });
    }
}