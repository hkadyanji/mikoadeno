import { Router } from 'https://deno.land/x/oak/mod.ts';

import regionController from './controllers/region.ts';

const router = new Router();
router
  .use(
    '/',
    regionController.routes(),
    regionController.allowedMethods(),
  )

export default router;
