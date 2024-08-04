/**
 *
 * Models
 *
 */

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

  toQuery() {
    throw new TypeError("Not Implemented");
  }

  isCorrect() {
    return this.scoring.isPerfect();
  }
}

class RadioButtonAnswer extends Answer {
  toQuery() {
    return `entry.${this.id}=${this.value}`;
  }
}

class CheckboxAnswer extends Answer {
  toQuery() {
    /**
     * @type string[]
     */
    const answeredLabels = this.value;

    return answeredLabels.map((label) => `entry.${this.id}=${label}`).join("&");
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

/**
 *
 * parse FB_PUBLIC_LOAD_DATA_
 *
 */

/**
 * @param {number} dataItemId
 */

const CARD_TYPE = {
  RADIO: 2,
  CHECKBOX: 4,
};

class CardType {
  /**
   * @param {Array} cardDesc
   */
  constructor(cardDesc) {
    this.value = cardDesc[3];
  }

  isRadio() {
    return this.value === CARD_TYPE.RADIO;
  }

  isCheckbox() {
    return this.value === CARD_TYPE.CHECKBOX;
  }
}

class Card {
  constructor(rawDesc) {
    /**
     * @type {number}
     */
    this.problemId = rawDesc[4][0][0];
    /**
     * @type {number}
     */
    this.dataItemId = rawDesc[0];
  }

  get scoring() {
    const query = `div[data-item-id='${this.dataItemId}'] > div > div:last-child`;
    const scoringElement = document.querySelector(query);

    if (!scoringElement) return null;
    const scoringText = scoringElement.textContent;
    return ScoringOfAnswer.fromScoringText(scoringText);
  }
}

class RadioButtonCard extends Card {
  get answerValue() {
    const query = `div[data-item-id='${this.dataItemId}'] > div:nth-of-type(2n) > div`;
    const answerElement = document.querySelector(query);
    if (!answerElement) return null;

    const answerValue = answerElement.dataset.value;
    if (answerValue === undefined) return null;

    return answerValue;
  }

  get answer() {
    if (!this.scoring) return null;
    return new RadioButtonAnswer(
      this.problemId,
      this.scoring,
      this.answerValue
    );
  }
}

class CheckboxCard extends Card {
  get answerValue() {
    const query = `div[data-item-id='${this.dataItemId}'] > div[role='list'] div[role='checkbox']`;
    const checkboxes = Array.from(document.querySelectorAll(query));

    const answerValue = checkboxes
      .filter((checkbox) => checkbox.ariaChecked === "true")
      .map((checkbox) => checkbox.ariaLabel);
    return answerValue;
  }

  get answer() {
    if (!this.scoring) return null;
    return new CheckboxAnswer(this.problemId, scoring, this.answerValue);
  }
}

const getCard = (cardDesc) => {
  const cardType = new CardType(cardDesc);

  switch (cardType.value) {
    case CARD_TYPE.CHECKBOX:
      return new CheckboxCard(cardDesc);
    case CARD_TYPE.RADIO:
      return new RadioButtonCard(cardDesc);
    default:
      return null;
  }
};

/**
 * @param {Array} cardDescriptions
 */
const getCards = (cardDescriptions) =>
  cardDescriptions.map(getCard).filter((cardOrNull) => cardOrNull != null);

/**
 * @param {Card[]} cards
 * @returns
 */
const makeCorrectedAnswersQuery = (cards) =>
  cards
    .filter((card) => card.answer?.isCorrect())
    .map((card) => card.answer.toQuery())
    .join("&");

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
 * @param {Card[]} cards
 */
const getRetryURL = (cards) => {
  const viewformURL = getViewFormURL();
  const query = makeCorrectedAnswersQuery(cards);
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
  const cards = getCards(cardDescriptions);
  const retryURL = getRetryURL(cards);

  // Operation to DOM for displaying retry URL
  const button = createButtonElement("Retry", retryURL);
  const spot = getSpotForButtonInsertion();
  if (spot) {
    spot.insertBefore(button, spot.lastChild);
  }
};

process();
