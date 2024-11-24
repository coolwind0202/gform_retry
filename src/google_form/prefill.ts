import DOMPurify from "dompurify";

import { questionKinds } from "./questionMetadata";
import { QuestionResponse } from "./response";

import { TrustedTypesWindow } from "trusted-types/lib";

const buildParam = (response: QuestionResponse): [string, string][] => {
  const entryId = `entry.${response.question.id}`;
  switch (response.kind) {
    case questionKinds["radio"]:
      return [[entryId, response.choice]];
    case questionKinds["checkbox"]:
      return response.choices.map((choice) => [entryId, choice]);
    case questionKinds["shortText"]:
    case questionKinds["longText"]:
      return [[entryId, response.content]];
  }
};

const buildQuery = (responses: QuestionResponse[]): string => {
  const params = responses.flatMap(buildParam);
  return new URLSearchParams(params).toString();
};

const getViewformURL = () => {
  return new URL("./viewform", document.location.href);
};

export const buildURL = (responses: QuestionResponse[]): string =>
  `${getViewformURL()}?${buildQuery(responses)}`;

const sanitize = (html: string) => {
  const ttWindow = window as unknown as TrustedTypesWindow;

  if (!ttWindow.trustedTypes) {
    return DOMPurify.sanitize(html);
  }
  return DOMPurify.sanitize(html, { RETURN_TRUSTED_TYPE: true });
};

export const insertPrefillRetryButtons = (prefillURL: string) => {
  const spots = document.querySelectorAll("div[role=list]:last-child");

  const html = `
  <div style="padding-bottom: 0.5rem;">
    <a href=${prefillURL} style="font-size: 1.3rem;">
      Retry
    </a>
  </div>
  `;

  for (const spot of spots) {
    const trustedHTML = sanitize(html);

    // @ts-expect-error insertAdjancentHTMLがTrustedHTMLを受け付けないため型エラーを抑制
    spot.insertAdjacentHTML("beforeend", trustedHTML);
  }
};
