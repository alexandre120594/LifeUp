export const TRT_PI_PLAN_ID = "trt-pi-150";
export const TRT_PI_PLAN_TOTAL_DAYS = 150;

export function isTrtPiPlanId(value: unknown): value is typeof TRT_PI_PLAN_ID {
  return value === TRT_PI_PLAN_ID;
}
