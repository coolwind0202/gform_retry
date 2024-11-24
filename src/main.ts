import { buildURL, insertPrefillRetryButtons } from "./prefill";
import { parseQuestionMetadataList, PublicLoadData } from "./questionMetadata";
import { parseResponse } from "./response";

// @ts-expect-error
const data = PublicLoadData.parse(FB_PUBLIC_LOAD_DATA_);

const metadataList = parseQuestionMetadataList(data);
console.log(metadataList);

const responses = metadataList
  .map(parseResponse)
  .filter((response) => response != undefined);

const prefillURL = buildURL(responses);
insertPrefillRetryButtons(prefillURL);
