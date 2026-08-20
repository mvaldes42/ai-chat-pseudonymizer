import { AutoTokenizer, pipeline } from "@huggingface/transformers";
import { replaceTokens } from "./replaceTokens";

export async function piiDetectAndReplace(content: string) {
  content =
    "my name is Jane Smith and my email is jane.smith@example.com. My friend is Lou. I live in Paris and she lives in London.";
  const model = "onnx-community/bert-small-pii-detection-ONNX";

  const loadPipeline = pipeline as (
    task: "token-classification",
    model: string,
  ) => Promise<any>;

  const piiDetector = await loadPipeline("token-classification", model);
  const tokenizer = await AutoTokenizer.from_pretrained(model);

  const tokens = tokenizer
    .tokenize(content, { add_special_tokens: true })
    .map((word, index) => ({ index, word }));

  const piiTokens = await piiDetector(content);

  const replacedContent = replaceTokens({ content, tokens, piiTokens });

  console.log("tokens", tokens);
  console.log("result", piiTokens);
  console.log("replacedContent", replacedContent);

  return replacedContent;
}
