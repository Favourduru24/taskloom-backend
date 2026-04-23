import {Logger } from '@nestjs/common';

export async function handle<T>(
  logger: Logger,
  fn: () => Promise<T>,
  context?: string,
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (err?.status && err?.response) throw err;
    logger.error(
      `[${context ?? 'handler'}] ${err?.message ?? err}`,
      err?.stack,
    );
    throw err;
  }
}


export const successResponseExample = <T>(
  data: T,
  message: string,
  code = 200,
) => ({
  status: 'success',
  code,
  message,
  data,
});

export const createdResponseExample = <T>(data: T, message: string) =>
  successResponseExample(data, message, 201);
