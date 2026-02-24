/**
 * Throttle ฟังก์ชัน — จำกัดความถี่ในการเรียก
 * ใช้กับ updateClusterLabels เพื่อลดการ re-render เมื่อ pan/zoom แผนที่
 */

export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let last = 0;
  let rafId: number | null = null;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= delayMs) {
      last = now;
      fn(...args);
    } else if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        rafId = null;
        last = Date.now();
        fn(...args);
      });
    }
  };
}
