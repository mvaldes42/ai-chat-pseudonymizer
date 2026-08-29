import { pipeline } from '@huggingface/transformers'
import { replaceTokens } from './replaceTokens'
import { PiiMappingType, PiiOccurrenceCountType, NerTokenType } from '../../types'

const MODEL = 'onnx-community/bert-small-pii-detection-ONNX'

type TokenClassificationPipeline = (text: string) => Promise<NerTokenType[]>

const loadPipeline = pipeline as (
  task: 'token-classification',
  model: string,
) => Promise<TokenClassificationPipeline>

let pipelinePromise: Promise<TokenClassificationPipeline> | null = null

export function preloadPiiPipeline() {
  if (!pipelinePromise) {
    pipelinePromise = loadPipeline('token-classification', MODEL).catch(
      (error) => {
        pipelinePromise = null
        throw error
      },
    )
  }
  return pipelinePromise
}

export async function piiDetectAndReplace({
  content,
  piiOccurrencesCount,
  piiMappingList,
}: {
  content: string
  piiOccurrencesCount: PiiOccurrenceCountType[]
  piiMappingList: PiiMappingType[]
}) {
  const piiTokensPipeline = await preloadPiiPipeline()
  const piiTokens = await piiTokensPipeline(content)

  const { result, mapping } = replaceTokens({
    content,
    piiTokens,
    piiOccurrencesCount,
    piiMappingList,
  })

  return { result, mapping }
}
