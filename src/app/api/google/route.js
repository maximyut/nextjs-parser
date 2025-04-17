import { NextResponse } from "next/server";
import { google } from "googleapis";
import { private_key } from "./service_key.json";
const auth = new google.auth.GoogleAuth({
	credentials: {
		client_email: "nextjs-parser@indigo-syntax-457109-a4.iam.gserviceaccount.com",
		private_key: private_key,
	},
	scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const spreadsheetId = "1j_GUygrH2GcxTYfXtg3KaCX32vab5VLQsw1V288aetY";
const sheetName = "Лист1";

async function saveToGoogleSheets(data) {
	const sheets = google.sheets({ version: "v4", auth });
	await sheets.spreadsheets.values.append({
		spreadsheetId,
		range: `${sheetName}!A:D`,
		valueInputOption: "USER_ENTERED",
		requestBody: {
			values: [[new Date().toLocaleString(), data.title, data.content, data.links.join("\n")]],
		},
	});
}
export async function POST(req) {
	const { data } = await req.json();
	console.log(data)
	// Конфигурация Google Sheets

	try {
		await saveToGoogleSheets(data);
		return NextResponse.json({
			...data,
			message: "Data saved to Google Sheets",
		});
	} catch (error) {
		console.log(error)
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
