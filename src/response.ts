import { questionKinds, QuestionMetadata } from "./questionMetadata";

export type RadioResponse = {
  kind: (typeof questionKinds)["radio"];
  question: QuestionMetadata;
  choice: string;
};

export type CheckboxResponse = {
  kind: (typeof questionKinds)["checkbox"];
  question: QuestionMetadata;
  choices: string[];
};

export type QuestionResponse = RadioResponse | CheckboxResponse;

const getCorrectResponseElements = (questionId: number) => {
  return Array.from(
    document.querySelectorAll(
      `div:has(+ input[name='entry.${questionId}']):has( div[aria-label=正解]) + input`
    )
  );
};

export const parseResponse = (
  question: QuestionMetadata
): QuestionResponse | undefined => {
  const elements = getCorrectResponseElements(question.id);

  switch (question.kind) {
    case questionKinds["radio"]:
      const choice = elements?.[0];
      if (!(choice instanceof HTMLInputElement)) return;

      return {
        kind: question.kind,
        question,
        choice: choice.value,
      };
    case questionKinds["checkbox"]:
      const checkedChoices = elements
        .filter((choice) => choice instanceof HTMLInputElement)
        .filter((choice) => !choice.disabled)
        .map((choice) => choice.value);

      const response = {
        kind: question.kind,
        question,
        choices: checkedChoices,
      };
      return response;
  }
};
