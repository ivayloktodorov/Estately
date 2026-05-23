const AUTH_PERF_LOGS_ENABLED =
  process.env.NODE_ENV === 'development' || process.env.AUTH_PERF_LOGS === '1';

export function authTimer(label: string) {
  const start = performance.now();
  let previous = start;

  return {
    mark(step: string) {
      if (!AUTH_PERF_LOGS_ENABLED) {
        return;
      }

      const now = performance.now();
      console.info(
        `[auth-perf] ${label}:${step} +${Math.round(now - previous)}ms total=${Math.round(now - start)}ms`,
      );
      previous = now;
    },
    end() {
      if (!AUTH_PERF_LOGS_ENABLED) {
        return;
      }

      console.info(`[auth-perf] ${label}:total ${Math.round(performance.now() - start)}ms`);
    },
  };
}
