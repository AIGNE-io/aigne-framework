import { app, server } from './src';

import('vite-plugin-blocklet').then(({ setupClient }) => {
  setupClient(app, {
    server,
  });
});
