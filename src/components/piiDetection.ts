import { pipeline } from "@huggingface/transformers";

export async function piiDetectAndReplace(content: string) {
  const piiDetector = await pipeline(
    "token-classification",
    "onnx-community/bert-small-pii-detection-ONNX",
  );

  const result = await piiDetector(content);

  console.log(result);
  return result;
}
