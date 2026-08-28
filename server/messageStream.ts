import { EventEmitter } from "node:events";
import type { MessageChunkType } from "./types";

type StreamRecord = {
  emitter: EventEmitter;
  buffer: MessageChunkType[];
  done: boolean;
};

const streams = new Map<string, StreamRecord>();

function getOrCreateStream(streamId: string): StreamRecord {
  let record = streams.get(streamId);
  if (!record) {
    record = {
      emitter: new EventEmitter(),
      buffer: [],
      done: false,
    };
    streams.set(streamId, record);
  }
  return record;
}

export function publishChunk(streamId: string, chunk: MessageChunkType) {
  const record = getOrCreateStream(streamId);
  if (record.done) {
    return;
  }
  record.buffer.push(chunk);
  if (chunk.done) {
    record.done = true;
    setTimeout(() => {
      streams.delete(streamId);
    }, 60_000);
  }
  record.emitter.emit("chunk");
}

export async function* iterateChunks(
  streamId: string,
): AsyncGenerator<MessageChunkType> {
  const record = getOrCreateStream(streamId);
  let index = 0;

  const waitForChunk = () =>
    new Promise<void>((resolve) => {
      if (index < record.buffer.length || record.done) {
        resolve();
        return;
      }
      record.emitter.once("chunk", () => resolve());
      if (index < record.buffer.length || record.done) {
        resolve();
      }
    });

  while (true) {
    if (index < record.buffer.length) {
      yield record.buffer[index++];
      continue;
    }
    if (record.done) {
      return;
    }
    await waitForChunk();
  }
}
