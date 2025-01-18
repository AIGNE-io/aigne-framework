// import compression from 'compression';
// import { Router } from 'express';

// import { memoryRoutes } from './memory';
// import { vectorRoutes } from './vectors';

// export function createMiddleware({ path }: { path: string }) {
//   const router = Router();

//   router.use(compression());

//   router.use('/aigne-memory', memoryRoutes(router, path));
//   router.use('/aigne-memory/vectors', vectorRoutes(router, path));

//   return router;
// }
