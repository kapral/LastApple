import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
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
	plugins: [sveltekit(), svelteTesting()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/setup.ts'],
		include: ['tests/**/*.test.ts'],
		alias: {
			$lib: new URL('./src/lib', import.meta.url).pathname
		}
	}
});
