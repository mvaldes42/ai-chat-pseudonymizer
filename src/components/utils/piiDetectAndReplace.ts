import { pipeline } from '@huggingface/transformers'
import { replaceTokens } from './replaceTokens'
import { PiiMappingType, PiiOccurrenceCountType } from '../../types'

export async function piiDetectAndReplace({
  content,
  piiOccurrencesCount,
  piiMappingList,
}: {
  content: string
  piiOccurrencesCount: PiiOccurrenceCountType[]
  piiMappingList: PiiMappingType[]
}) {
  const model = 'onnx-community/bert-small-pii-detection-ONNX'

  const loadPipeline = pipeline as (
    task: 'token-classification',
    model: string,
  ) => Promise<any>

  const piiTokensPipeline = await loadPipeline('token-classification', model)

  const piiTokens = await piiTokensPipeline(content)

  const { result, mapping } = replaceTokens({
    content,
    piiTokens,
    piiOccurrencesCount,
    piiMappingList,
  })

  return { result, mapping }
}
