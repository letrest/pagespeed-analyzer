import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }
  console.log('Received URL:', url);
  const fileNameUrl = url.split('//')[1].replace(/[^a-zA-Z0-9.]/g, ''); // Remove special characters from the URL
  console.log('File Name URL:', fileNameUrl);  
  let browser;
  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 }); // Set desktop viewport size

    // Navigate to the URL and take a desktop screenshot
    await page.goto(url, { waitUntil: 'networkidle0' });
    const desktopScreenshotPath = path.join(fileNameUrl + '_desktop.png');
    await page.screenshot({ path: path.join('public',desktopScreenshotPath) });

    await page.setViewport({ width: 360, height: 800 }); // Set mobile viewport size

    // Navigate to the URL and take a mobile screenshot
    await page.goto(url, { waitUntil: 'networkidle0' });
    const mobileScreenshotPath = path.join(fileNameUrl + '_mobile.png');
    await page.screenshot({ path: path.join('public',mobileScreenshotPath) });
    await page.close();
    

    // Fetch PageSpeed Insights data
    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) {
      console.error('PAGESPEED_API_KEY is not set.');
      return NextResponse.json({ error: 'PageSpeed API key is not configured.' }, { status: 500 });
    }
    const pagespeedApiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=DESKTOP`; // Added DESKTOP strategy
    const pagespeedResponse = await fetch(pagespeedApiUrl);
    const pagespeedData = await pagespeedResponse.json();

    if (pagespeedResponse.status !== 200) {
      console.error('Error fetching PageSpeed Insights data:', pagespeedData);
      return NextResponse.json({ error: 'Failed to fetch PageSpeed Insights data', details: pagespeedData }, { status: pagespeedResponse.status });
    }
    console.log('PageSpeed Insights data:', JSON.stringify(pagespeedData));
    // Save screenshots to public directory
    return NextResponse.json({
      desktopScreenshotUrl: desktopScreenshotPath,
      mobileScreenshotUrl: mobileScreenshotPath,
      pagespeedData,
    });
  } catch (error) {
    console.error('Error in analyze endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to analyze URL', details: errorMessage }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
