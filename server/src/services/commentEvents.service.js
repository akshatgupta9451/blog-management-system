import { EventEmitter } from 'node:events';

// In-process pub/sub keyed by blog id. Every open SSE stream for a blog subscribes to it.
// This works for a single server process; running several instances would need a shared
// broker (e.g. Redis pub/sub) behind the same two functions.
const emitter = new EventEmitter();
emitter.setMaxListeners(0); // one listener per connected viewer

export const publishCommentEvent = (blogId, event, data) => {
  emitter.emit(String(blogId), { event, data });
};

export const subscribeToComments = (blogId, listener) => {
  const channel = String(blogId);
  emitter.on(channel, listener);
  return () => emitter.off(channel, listener);
};
