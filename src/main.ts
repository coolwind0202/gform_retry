import { parseQuestionMetadataList, PublicLoadData } from "./questionMetadata";
import { parseResponse } from "./response";

// @ts-expect-error
const data = PublicLoadData.parse(FB_PUBLIC_LOAD_DATA_);

const metadataList = parseQuestionMetadataList(data);
console.log(metadataList);

console.log(metadataList.map(parseResponse));
