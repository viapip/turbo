/// <reference types="node" />

import { Readable } from 'stream';
import { Codec } from 'codecs';
import * as mutexify from 'mutexify/promise';
import { Entry, Source, Session } from 'hypercore';

declare class Key {
  constructor(seq: number, value: Buffer);
  seq: number;
  value: Buffer;
}

declare class Child {
  constructor(seq: number, offset: number, value: TreeNode | null);
  seq: number;
  offset: number;
  value: TreeNode | null;
}

declare class TreeNode {
  constructor(block: BlockEntry, keys: Key[], children: Child[], offset: number);
  block: BlockEntry;
  offset: number;
  keys: Key[];
  children: Child[];
  changed: boolean;
  insertKey(key: Key, value: Buffer, child: TreeNode | null, node: any, encoding: { key: Codec | null; value: Codec | null }, cas: ((prev: { seq: number; key: Buffer; value: Buffer | null }) => Promise<boolean>) | null): Promise<boolean>;
  removeKey(index: number): void;
  siblings(parent: TreeNode): Promise<{ left: TreeNode | null; index: number; right: TreeNode | null }>;
  merge(node: TreeNode, median: Key): void;
  split(): Promise<{ left: TreeNode; median: Key; right: TreeNode }>;
  getKeyNode(index: number): Promise<BlockEntry>;
  getChildNode(index: number): Promise<TreeNode>;
  getKey(index: number): Promise<Buffer>;
  indexChanges(index: any[], seq: number): number;
  updateChildren(seq: number, block: BlockEntry): void;
  static create(block: BlockEntry | null): TreeNode;
}

declare class BlockEntry {
  constructor(seq: number, tree: Hyperbee, entry: any);
  seq: number;
  tree: Hyperbee;
  index: Pointers | null;
  key: Buffer;
  value: Buffer | null;
  isTarget(key: Buffer): boolean;
  isDeletion(): boolean;
  final(encoding: { key: Codec | null; value: Codec | null }): { seq: number; key: Buffer; value: Buffer | null };
  getTreeNode(offset: number): TreeNode;
}

declare class BatchEntry extends BlockEntry {
  constructor(seq: number, tree: Hyperbee, key: Buffer, value: Buffer | null, index: any[]);
  pendingIndex: any[];
  isTarget(key: Buffer): boolean;
  getTreeNode(offset: number): TreeNode;
}

declare class Hyperbee extends ReadyResource {
  constructor(core: Source, opts?: {
    keyEncoding?: string | Codec;
    valueEncoding?: string | Codec;
    extension?: boolean;
    metadata?: any;
    lock?: mutexify.MutexifyPromise;
    sep?: Buffer;
    readonly?: boolean;
    prefix?: Buffer | null;
    alwaysDuplicate?: boolean;
    checkout?: number;
    sessions?: boolean;
  });
  feed: Source;
  core: Source;
  keyEncoding: Codec | null;
  valueEncoding: Codec | null;
  extension: Extension | null;
  metadata: any;
  sep: Buffer;
  readonly: boolean;
  prefix: Buffer | null;
  alwaysDuplicate: boolean;
  version: number;
  id: Buffer;
  key: Buffer;
  discoveryKey: Buffer;
  writable: boolean;
  readable: boolean;
  replicate(isInitiator: boolean, opts?: any): any;
  update(opts?: any): Promise<void>;
  peek(range: any, opts?: any): Promise<{ key: Buffer; value: Buffer } | null>;
  createRangeIterator(range: any, opts?: any): RangeIterator;
  createReadStream(range: any, opts?: any): Readable;
  createHistoryStream(opts?: any): Readable;
  createDiffStream(right: Hyperbee | number, range: any, opts?: any): Readable;
  get(key: Buffer, opts?: any): Promise<{ key: Buffer; value: Buffer | null } | null>;
  getBySeq(seq: number, opts?: any): Promise<{ key: Buffer; value: Buffer | null } | null>;
  put(key: Buffer, value: Buffer, opts?: any): Promise<void>;
  batch(opts?: any): Batch;
  del(key: Buffer, opts?: any): Promise<void>;
  watch(range: any, opts?: any): Watcher;
  getAndWatch(key: Buffer, opts?: any): Promise<EntryWatcher>;
  checkout(version: number, opts?: { keyEncoding?: string | Codec; valueEncoding?: string | Codec; reuseSession?: boolean }): Hyperbee;
  snapshot(opts?: { keyEncoding?: string | Codec; valueEncoding?: string | Codec }): Hyperbee;
  sub(prefix: string | Buffer, opts?: { sep?: Buffer | string; keyEncoding?: string | Codec; valueEncoding?: string | Codec }): Hyperbee;
  getHeader(opts?: any): Promise<Header | null>;
  static isHyperbee(core: Source, opts?: any): Promise<boolean>;
}

declare class Batch {
  constructor(tree: Hyperbee, core: Source, batchLock: mutexify.MutexifyPromise | null, cache: boolean, options?: any);
  tree: Hyperbee;
  feed: Source;
  core: Source;
  index: number;
  blocks: Map<number, BatchEntry> | null;
  autoFlush: boolean;
  rootSeq: number;
  root: TreeNode | null;
  length: number;
  options: any;
  locked: (() => void) | null;
  batchLock: mutexify.MutexifyPromise | null;
  onseq: (seq: number) => void;
  appending: Buffer[] | null;
  isSnapshot: boolean;
  shouldUpdate: boolean;
  updating: Promise<void> | null;
  encoding: { key: Codec | null; value: Codec | null };
  lock(): Promise<void>;
  version: number;
  getRoot(ensureHeader: boolean): Promise<TreeNode | null>;
  getKey(seq: number): Promise<Buffer>;
  getBlock(seq: number): Promise<BlockEntry>;
  peek(range: any, opts?: any): Promise<{ key: Buffer; value: Buffer } | null>;
  createRangeIterator(range: any, opts?: any): RangeIterator;
  createReadStream(range: any, opts?: any): Readable;
  getBySeq(seq: number, opts?: any): Promise<{ key: Buffer; value: Buffer | null }>;
  get(key: Buffer, opts?: any): Promise<{ key: Buffer; value: Buffer | null } | null>;
  put(key: Buffer, value: Buffer, opts?: any): Promise<void>;
  del(key: Buffer, opts?: any): Promise<void>;
  close(): Promise<void>;
  destroy(): void;
  toBlocks(): Buffer[];
  flush(): Promise<void>;
}

declare class EntryWatcher extends ReadyResource {
  constructor(bee: Hyperbee, key: Buffer, opts?: { keyEncoding?: string | Codec; valueEncoding?: string | Codec; updateOnce?: boolean });
  keyEncoding: Codec | null;
  valueEncoding: Codec | null;
  index: number;
  bee: Hyperbee;
  key: Buffer;
  node: { seq: number; key: Buffer; value: Buffer | null } | null;
  on(event: 'update', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: string, listener: (...args: any[]) => void): this;
}

declare class Watcher extends ReadyResource {
  constructor(bee: Hyperbee, range: any, opts?: {
    keyEncoding?: string | Codec;
    valueEncoding?: string | Codec;
    map?: (snapshot: Hyperbee) => any;
    differ?: (currentSnap: Hyperbee, previousSnap: Hyperbee, opts: any) => AsyncIterable<any>;
    eager?: boolean;
    updateOnce?: boolean;
    onchange?: () => Promise<void>;
  });
  keyEncoding: Codec | null;
  valueEncoding: Codec | null;
  index: number;
  bee: Hyperbee;
  core: Source;
  latestDiff: number;
  range: any;
  map: (snapshot: Hyperbee) => any;
  current: Hyperbee | null;
  previous: Hyperbee | null;
  currentMapped: any;
  previousMapped: any;
  stream: AsyncIterable<any> | null;
  Symbol.asyncIterator: AsyncIterableIterator<[any, any]>;
  next(): Promise<{ value: [any, any]; done: boolean }>;
  return(): Promise<{ done: true }>;
  on(event: 'update', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: string, listener: (...args: any[]) => void): this;
  close(): Promise<void>;
  destroy(): Promise<void>;
}
declare function iteratorToStream(ite: AsyncIterableIterator<any>, signal: AbortSignal | null): Readable;
declare function iteratorPeek(ite: AsyncIterableIterator<any>): Promise<{ value: any; done: boolean }>;
declare function encRange(e: Codec | null, opts: any): any;
declare function prefixEncoding(prefix: Buffer, keyEncoding: Codec | null): { encode: (key: Buffer | string) => Buffer; decode: (key: Buffer) => any };
declare function defaultDiffer(currentSnap: Hyperbee, previousSnap: Hyperbee, opts: any): AsyncIterable<any>;
declare module 'hypercore' {
  interface Source {
    isAutobase?: boolean;
    core?: { tree: { length: number } };
    _source?: { originalCore: Source };
    flush?: () => Session;
  }
}
export = Hyperbee;
