"use client";
import { useState } from "react";

export default function Home() {
	const [url, setUrl] = useState("");
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch("/api/scrape", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url }),
			});
			const data = await response.json();
			setResult(data);
		} catch (error) {
			setResult({ error: error.message });
		}
		setLoading(false);
	};
	const handleSave = async () => {
		setGoogleLoading(true);

		try {
			const response = await fetch("/api/google", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ data:result }),
			});

			const data = await response.json();
			// console.log(data);
		} catch (error) {
			console.log(error);
		}
		setGoogleLoading(false);
	};

	return (
		<div style={{ padding: "20px" }}>
			<form onSubmit={handleSubmit}>
				<input
					type="url"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="Enter URL to scrape"
					required
					style={{ width: "300px", marginRight: "10px" }}
				/>
				<button type="submit" disabled={loading}>
					{loading ? "Scraping..." : "Scrape"}
				</button>
				<button type="button" onClick={handleSave} disabled={googleLoading}>
					{googleLoading ? "Saving to Google Sheets..." : "Save to Google Sheets"}
				</button>
			</form>

			{result && (
				<div style={{ marginTop: "20px" }}>
					{result.error ? (
						<p style={{ color: "red" }}>Error: {result.error}</p>
					) : (
						<>
							<h2>Results:</h2>
							<h3>Title: {result.title}</h3>
							<p>Content: {result.content}</p>
							<h4>Links ({result.links.length}):</h4>
							<ul>
								{result.links.slice(0, 5).map((link, i) => (
									<li key={i}>{link}</li>
								))}
							</ul>
						</>
					)}
				</div>
			)}
		</div>
	);
}
