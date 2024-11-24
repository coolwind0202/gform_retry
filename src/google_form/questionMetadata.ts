import { z } from "zod";

export const questionKinds = {
  shortText: 0,
  longText: 1,
  radio: 2,
  checkbox: 4,
} as const;

export const PublicLoadData = z
  .tuple([
    z.unknown(),
    z
      .tuple([
        z.unknown(),
        z.array(
          z
            .tuple([
              z.number(),
              z.string(),
              z.unknown(),
              z.number(), // Block Kind
              z.nullable(
                z.tuple([
                  z
                    .tuple([
                      z.number(), // Question Id (If exists)
                    ])
                    .rest(z.unknown()),
                ])
              ),
            ])
            .rest(z.unknown())
        ),
      ])
      .rest(z.unknown()),
  ])
  .rest(z.unknown());

export type PublicLoadData = z.infer<typeof PublicLoadData>;

export type QuestionKind = (typeof questionKinds)[keyof typeof questionKinds];

const QuestionMetadata = z.object({
  id: z.number(),
  blockId: z.number(),
  kind: z.nativeEnum(questionKinds),
});

export type QuestionMetadata = z.infer<typeof QuestionMetadata>;

export const parseQuestionMetadataList = (
  publicLoadData: PublicLoadData
): QuestionMetadata[] => {
  const blocks = publicLoadData[1][1];

  return blocks
    .map((block) => ({
      kind: block[3],
      id: block[4]?.[0]?.[0],
      blockId: block[0],
    }))
    .map((block) => QuestionMetadata.safeParse(block))
    .filter((parsing) => parsing.success)
    .map((parsing) => parsing.data);
};
