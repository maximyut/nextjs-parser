import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export async function POST(req) {
	const { url } = await req.json();

	if (!url) {
		return NextResponse.json({ error: "URL is required" }, { status: 400 });
	}

	let browser;
	try {
		browser = await puppeteer.launch({
			args: chromium.args,
			executablePath: await chromium.executablePath(),
			headless: chromium.headless,
		});

		const page = await browser.newPage();
		await page.goto(url, { waitUntil: "domcontentloaded" });

		// Пример извлечения данных
		const data = await page.evaluate(() => ({
			title: document.title,
			content: document.body.innerText.slice(0, 500) + "...",
			links: Array.from(document.querySelectorAll("a")).map((a) => a.href),
		}));

		return NextResponse.json(data);
	} catch (error) {
		console.log(error);
		return NextResponse.json({ error: `Scraping failed: ${error.message}` }, { status: 500 });
	} finally {
		if (browser) await browser.close();
	}
}
