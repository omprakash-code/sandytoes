export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  if (process.env.NODE_ENV === "development") {
    return;
  }

  const loadServerModule = new Function(
    "specifier",
    "return import(specifier)"
  ) as <T>(specifier: string) => Promise<T>;

  const [{ startCouponSweepScheduler }, { startSlotSyncScheduler }] =
    await Promise.all([
      loadServerModule<typeof import("@/services/coupon/coupon-sweep.scheduler")>(
        "@/services/coupon/coupon-sweep.scheduler"
      ),
      loadServerModule<typeof import("@/services/slot/slot-sync.scheduler")>(
        "@/services/slot/slot-sync.scheduler"
      ),
    ]);

  startCouponSweepScheduler();
  startSlotSyncScheduler();
}
