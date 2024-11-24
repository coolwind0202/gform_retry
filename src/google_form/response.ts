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

export type ShortTextResponse = {
  kind: (typeof questionKinds)["shortText"];
  question: QuestionMetadata;
  content: string;
};

export type LongTextResponse = {
  kind: (typeof questionKinds)["longText"];
  question: QuestionMetadata;
  content: string;
};

export type QuestionResponse =
  | RadioResponse
  | CheckboxResponse
  | ShortTextResponse
  | LongTextResponse;

const getCorrectResponseChoices = (questionId: number) => {
  return Array.from(
    document.querySelectorAll(
      `div:has(+ [name='entry.${questionId}']):has( [aria-label=正解]) + input`
    )
  ).filter((element) => element instanceof HTMLInputElement);
};

const getResponseTextbox = (blockId: number) => {
  const element = document.querySelector(
    `[data-item-id='${blockId}'] [role=textbox]`
  );
  return element;
};

const hasCorrectTextbox = (blockId: number) => {
  return (
    document.querySelector(
      `[data-item-id='${blockId}']:has( [aria-label=正解])`
    ) != null
  );
};

export const parseResponse = (
  question: QuestionMetadata
): QuestionResponse | undefined => {
  switch (question.kind) {
    case questionKinds["radio"]:
    case questionKinds["checkbox"]:
      const choices = getCorrectResponseChoices(question.id);

      switch (question.kind) {
        case questionKinds["radio"]:
          const choice = choices.at(0);
          if (!choice) return;

          return {
            kind: question.kind,
            question,
            choice: choice.value,
          };

        case questionKinds["checkbox"]:
          const checkedChoices = choices
            .filter((choice) => !choice.disabled)
            .map((choice) => choice.value);

          const response = {
            kind: question.kind,
            question,
            choices: checkedChoices,
          };
          return response;
      }
    case questionKinds["shortText"]:
    case questionKinds["longText"]:
      const text = getResponseTextbox(question.blockId);
      if (text == null) return;

      switch (question.kind) {
        case questionKinds["shortText"]:
          const isCorrect = hasCorrectTextbox(question.blockId);
          if (!isCorrect) return;
      }

      const response = {
        kind: question.kind,
        question,
        content: text.textContent ?? "",
      };
      return response;
  }
};
