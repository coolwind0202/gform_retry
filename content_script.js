/**
 *
 * Models
 *
 */

class Problem {
  /**
   *
   * @param {number} id
   * @param {Answer} answer
   */
  constructor(id, answer) {
    this.id = id;
    this.answer = answer;
  }

  wasAnsweredCorrectly() {
    return this.answer.scoring.isPerfect();
  }

  wasAnsweredIncorrectly() {
    return !this.wasAnsweredCorrectly();
  }
}

class Answer {
  /**
   *
   * @param {number} id
   * @param {ScoringOfAnswer} scoring
   * @param {any} value
   */
  constructor(id, scoring, value) {
    this.id = id;
    this.scoring = scoring;
    this.value = value;
  }
}

class ScoringOfAnswer {
  /**
   *
   * @param {number} value
   * @param {number} max
   */
  constructor(value, max) {
    this.value = value;
    this.max = max;
  }

  isPerfect() {
    return this.value === this.max;
  }

  /**
   * @param {string} scoringText n/mという形式で表された採点結果テキスト
   * @returns 採点結果テキストを元にインスタンスを作成し、返却します。
   */
  static fromScoringText(scoringText) {
    const matching = scoringText.match(/(\d)\/(\d)/);
    if (!matching) return null;

    const value = Number.parseInt(matching[1] ?? "");
    const max = Number.parseInt(matching[2] ?? "");
    if (Number.isNaN(value) || Number.isNaN(max)) return null;

    const scoring = new ScoringOfAnswer(value, max);
    return scoring;
  }
}

class Problems {
  constructor() {
    /**
     * @type Problem[]
     */
    this.values = [];
  }

  getCorrectedAnswerQuery() {
    const query = this.values
      .filter((problem) => problem.wasAnsweredCorrectly())
      .map((problem) => `entry.${problem.id}=${problem.answer.value}`)
      .join("&");

    return query;
  }

  add(problem) {
    this.values.push(problem);
  }
}

/**
 *
 * Make model instances using DOM information
 *
 */

/**
 * @param {number} dataItemId
 */
const makeScroingOfAnswer = (dataItemId) => {
  const query = `div[data-item-id='${dataItemId}'] > div > div:last-child`;
  const scoringElement = document.querySelector(query);
  if (!scoringElement) return null;

  const scoringText = scoringElement.textContent;
  const scoring = ScoringOfAnswer.fromScoringText(scoringText);
  return scoring;
};

/**
 *
 * @param {number} dataItemId
 */
const makeAnswer = (dataItemId) => {
  const query = `div[data-item-id='${dataItemId}'] > div:nth-of-type(2n) > div`;
  const answerElement = document.querySelector(query);
  if (!answerElement) return null;

  const answerValue = answerElement.dataset.value;
  if (answerValue === undefined) return null;

  const scoring = makeScroingOfAnswer(dataItemId);
  if (!scoring) return null;

  const answer = new Answer(dataItemId, scoring, answerValue);
  return answer;
};

const makeProblem = (id, dataItemId) => {
  const answer = makeAnswer(dataItemId);
  const problem = new Problem(id, answer);

  if (!problem) return null;
  return problem;
};

/**
 *
 * parse FB_PUBLIC_LOAD_DATA_
 *
 */

const CARD_TYPE = {
  PROBLEM: 2,
};

class CardType {
  /**
   * @param {Array} cardDesc
   */
  constructor(cardDesc) {
    this.value = cardDesc[3];
  }

  isProblem() {
    return this.value === CARD_TYPE.PROBLEM;
  }
}

class Card {
  constructor(rawDesc) {
    this.problemId = rawDesc[4][0][0];
    this.dataItemId = rawDesc[0];
  }
}

/**
 * @param {Array} cardDescriptions
 */
const getProblems = (cardDescriptions) => {
  const problems = new Problems();

  for (const cardDesc of cardDescriptions) {
    const cardType = new CardType(cardDesc);
    if (!cardType.isProblem()) continue;

    const card = new Card(cardDesc);
    const problem = makeProblem(card.problemId, card.dataItemId);
    if (problem == null) continue;

    problems.add(problem);
  }

  return problems;
};

const getViewFormURL = () => {
  if (!URL.canParse("./viewform", document.location.href)) {
    return null;
  }

  return new URL("./viewform", document.location.href);
};

/**
 * @param {string} text ボタン内に表示するテキスト
 * @param {string} url ボタンに設定されたリンク先
 * @returns text, urlを元に作成したHTMLButtonElementを返します。
 */
const createButtonElement = (text, url) => {
  const button = document.createElement("button");
  const a = document.createElement("a");
  a.textContent = text;
  a.href = url;

  button.appendChild(a);
  return button;
};

/**
 * @param {Problem[]} problems
 */
const getRetryURL = (problems) => {
  const viewformURL = getViewFormURL();
  const query = problems.getCorrectedAnswerQuery();
  viewformURL.search = `?${query}`;

  return viewformURL;
};

const getSpotForButtonInsertion = () => {
  return document.querySelector("body > div > div:nth-of-type(2)");
};

const process = () => {
  if (typeof FB_PUBLIC_LOAD_DATA_ === "undefined") {
    return;
  }

  /**
   * @type {Array}
   */
  const cardDescriptions = FB_PUBLIC_LOAD_DATA_[1][1];
  const problems = getProblems(cardDescriptions);
  const retryURL = getRetryURL(problems);

  // Operation to DOM for displaying retry URL
  const button = createButtonElement("Retry", retryURL);
  const spot = getSpotForButtonInsertion();
  if (spot) {
    spot.insertBefore(button, spot.lastChild);
  }
};

process();
