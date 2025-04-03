import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            '/auth': {
                target: 'https://54.37.191.105:1215',
                changeOrigin: true,
                secure: false,
            },
            //'/auth/info': {
            //    target: 'https://54.37.191.105:1215',
            //    changeOrigin: true,
            //    secure: false,
            //},
            '/nodes': {
                target: 'https://54.37.191.105:1215',
                changeOrigin: true,
                secure: false,
            },
            '/daemon/status': { // Ajoutez cette règle
                target: 'https://54.37.191.105:1215',
                changeOrigin: true,
                secure: false,
            },
            '/sse': {
                target: 'https://54.37.191.105:1215',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/sse/, '/node/name/localhost/daemon/event'), // Réécriture comme dans setupProxy
                configure: (proxy, options) => {
                    proxy.on('proxyReq', (proxyReq, req) => {
                        console.log('🔄 Proxy: Sending SSE request to backend...');
                        const urlParams = new URLSearchParams(req.url.split('?')[1]);
                        const authToken = urlParams.get('token');
                        console.log('authToken:', authToken);
                        if (authToken) {
                            proxyReq.setHeader('Authorization', `Bearer ${authToken}`);
                        } else {
                            console.error('❌ No authentication token found!');
                        }
                        proxyReq.setHeader('Content-Type', 'text/event-stream');
                    });

                    proxy.on('proxyRes', (proxyRes) => {
                        console.log('📥 Proxy: Received SSE response:', proxyRes.statusCode);
                    });

                    proxy.on('error', (err) => {
                        console.error('❌ Proxy Error:', err);
                    });
                },
            },
        },
    },
});