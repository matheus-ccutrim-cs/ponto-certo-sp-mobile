import { createOlhoVivo } from '../lib/olho-vivo.js';
import { handleRequest } from '../lib/request.js';

const token = process.env.SPTRANS_TOKEN?.trim();
const query = token ? createOlhoVivo(token) : null;

export default {
  fetch(request) {
    return handleRequest(request, query);
  }
};
