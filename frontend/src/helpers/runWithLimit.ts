/**
 * Limited parallelism of promise execution
 * @param tasks array tasks
 * @param limit Max number of simultaneously executing promises
 */
export async function runWithLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const currentIndex = index++;
      try {
        results[currentIndex] = await tasks[currentIndex]();
      } catch (err) {
        console.warn("Task failed at index", currentIndex, err);
        results[currentIndex] = undefined as unknown as T;
      }
    }
  }

  const workers = Array(Math.min(limit, tasks.length))
    .fill(null)
    .map(() => worker());

  await Promise.all(workers);
  return results;
}