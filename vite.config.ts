import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/trace-draw/',
    server: {
        port: 3100,
        strictPort: false, // make it true, if you don't want to take next free port but fail
    },
    build: {
        outDir: 'dist',
        sourcemap: true, // build "*.map" files for JS sources
        manifest: false, // create a manifest.json for further processing of generated assets
    },
});
