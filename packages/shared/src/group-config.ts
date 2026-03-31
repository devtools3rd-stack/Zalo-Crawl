import { z } from 'zod';

export const GroupConfigSchema = z.object({
  id: z.string(),
  zaloGroupKey: z.string(),
  name: z.string(),
  isPinned: z.boolean(),
  defaultReply: z.string(),
  keywordRules: z.array(z.string()),
  patternRules: z.array(z.string())
});

export type GroupConfig = z.infer<typeof GroupConfigSchema>;
