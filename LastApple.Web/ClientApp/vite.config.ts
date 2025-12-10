import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 3000,
		proxy: {
			// Proxy API calls to ASP.NET Core backend during development
			'/api': {
				target: 'https://localhost:5001',
				changeOrigin: true,
				secure: false
			},
			'/hubs': {
				target: 'https://localhost:5001',
				changeOrigin: true,
				secure: true,
				ws: true
			}
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom'
	}
});
