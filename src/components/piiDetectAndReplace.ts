import { pipeline } from "@huggingface/transformers";
import { replaceTokens } from "./replaceTokens";

export async function piiDetectAndReplace(content: string) {
  content =
    "my name is Jane Smith and my email is jane.smith@example.com. My friend is Lou. I live in Paris and she lives in London.";
  const model = "onnx-community/bert-small-pii-detection-ONNX";

  const loadPipeline = pipeline as (
    task: "token-classification",
    model: string,
  ) => Promise<any>;

  const piiTokensPipeline = await loadPipeline("token-classification", model);

  const piiTokens = await piiTokensPipeline(content);

  const { result, mapping } = replaceTokens({ content, piiTokens });

  return { result, mapping };
}
