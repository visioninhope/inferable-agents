import { z } from "zod";

export const versionedTexts = z.object({
  current: z.object({
    version: z.string(),
    content: z.string(),
  }),
  history: z.array(
    z.object({
      version: z.string(),
      content: z.string(),
    }),
  ),
});

export type VersionedTexts = z.infer<typeof versionedTexts>;

export const getLatestVersionedText = (texts: unknown) => {
  if (!texts) {
    return null;
  }

  const parsed = versionedTexts.safeParse(texts);

  if (!parsed.success) {
    return null;
  }

  return parsed.data.current;
};
