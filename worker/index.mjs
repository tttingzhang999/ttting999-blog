import routes from '../.output/published-routes.json' with { type: 'json' };
import { handleViews } from './views-api.mjs';

export default {
  fetch(request, env) {
    return handleViews(request, env, routes);
  },
};
