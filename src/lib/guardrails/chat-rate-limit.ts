// Back-compat shim. The chat route handler still imports from this path
// (Phase 4 territory — owned by another agent). The implementation lives in
// `./rate-limit` alongside the other generalized checkers.
export { checkChatRateLimit } from './rate-limit';
