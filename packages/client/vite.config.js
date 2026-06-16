import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import path from 'path';
export default defineConfig({
    plugins: [react(), wasm()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:3001',
        },
    },
    optimizeDeps: {
        exclude: ['opencascade.js'],
    },
});
