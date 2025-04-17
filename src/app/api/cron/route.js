import { NextResponse } from "next/server";
import { google } from "googleapis";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { private_key } from "../google/service_key.json";

const auth = new google.auth.GoogleAuth({
	credentials: {
		client_email: "nextjs-parser@indigo-syntax-457109-a4.iam.gserviceaccount.com",
		private_key: private_key,
	},
	scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const spreadsheetId = process.env.SPREADSHEET_ID;

export async function GET() {
	let browser;
	try {
		// Инициализация Puppeteer
		browser = await puppeteer.launch({
			args: chromium.args,
			executablePath: await chromium.executablePath(),
			headless: chromium.headless,
		});

		const page = await browser.newPage();
		await page.goto(process.env.TARGET_URL || "https://mosplitka.ru/", {
			waitUntil: "domcontentloaded",
		});

		// Получение данных
		const data = await page.evaluate(() => ({
			title: document.title,
			content: document.body.innerText.slice(0, 500) + "...",
			links: Array.from(document.querySelectorAll("a")).map((a) => a.href),
		}));

		// Запись в Google Sheets
		const sheets = google.sheets({ version: "v4", auth });
		await sheets.spreadsheets.values.append({
			spreadsheetId,
			range: "Лист1!A:D",
			valueInputOption: "USER_ENTERED",
			requestBody: {
				values: [
					[new Date().toLocaleString(), data.title, data.content, data.links.join("\n")],
				],
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: `Cron job failed: ${error.message}` }, { status: 500 });
	} finally {
		if (browser) await browser.close();
	}
}
