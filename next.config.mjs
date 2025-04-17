/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverActions: true,
		serverComponentsExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
	},
};




export default nextConfig;
