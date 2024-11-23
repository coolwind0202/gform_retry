import { questionKinds, QuestionMetadata } from "./questionMetadata";

export const parseResponse = (question: QuestionMetadata) => {
  switch (question.kind) {
    case questionKinds["radio"]:
      const choice = document.querySelector(
        `input[name='entry.${question.id}']`
      );

      if (!(choice instanceof HTMLInputElement)) return;

      return {
        kind: question.kind,
        choice: choice.value,
      };
    case questionKinds["checkbox"]:
      const choices = Array.from(
        document.querySelectorAll(
          `div:has(+ input[name='entry.${question.id}']):has( div[aria-label=正解]) + input`
        )
      );

      const checkedChoices = choices
        .filter((choice) => choice instanceof HTMLInputElement)
        .filter((choice) => !choice.disabled)
        .map((choice) => choice.value);

      const response = {
        kind: question.kind,
        choices: checkedChoices,
      };
      return response;
  }
};
