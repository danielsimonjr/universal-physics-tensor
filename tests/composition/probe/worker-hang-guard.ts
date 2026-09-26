/**
 * The time limit for tests that launch a REAL worker process and do not test the timeout itself.
 *
 * The worker's own start-up counts against its time limit (see `runBackendWorker`). Start-up is
 * about 60 ms on an idle host, but it measured 843–4307 ms on a loaded one, and a 1000 ms limit
 * lost that race. The NDJSON protocol has no start-up signal, so a real-process test cannot be made
 * independent of start-up time; the limit here is only a guard against a hung worker. It stays
 * below the vitest test timeout (60 s) so that a real hang fails with the harness's own message.
 *
 * Tests of the timeout path use a hanging worker and a short limit instead: load can only make that
 * test time out sooner.
 */
export const REAL_WORKER_HANG_GUARD_MS = 30_000;
