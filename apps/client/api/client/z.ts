import { z } from "zod";
export { z };

export function parseWith<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const r = schema.safeParse(data);
  if (!r.success) {
    // In prod, you might log this instead
    throw new Error("Response validation failed: " + r.error.message);
  }
  return r.data;
}
