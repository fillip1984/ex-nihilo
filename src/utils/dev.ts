/**
 *
 * @param ms Useful for delaying things that work too fast during development
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
