/**
 * Calculate reading time for blog articles
 * Supports mixed Chinese and English content with different reading speeds
 */

import type { ParsedContent } from '@nuxt/content'

/**
 * Extract text content from Nuxt Content AST body
 * @param body - Nuxt Content parsed body (AST)
 * @returns Plain text string
 */
function extractTextFromBody(body: any): string {
  if (!body) return ''

  // If body is already a string, return it
  if (typeof body === 'string') return body

  // Convert AST to JSON and extract text
  // This includes all text content from paragraphs, headings, lists, etc.
  const jsonString = JSON.stringify(body)

  // Remove JSON structure characters but keep the actual content
  return jsonString
    .replace(/[{}\[\]"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculate reading time based on content with separate handling for Chinese and English
 *
 * Reading speeds:
 * - Chinese characters (CJK): ~500 characters per minute
 * - English words: ~200 words per minute
 *
 * @param body - Nuxt Content parsed body (AST)
 * @returns Reading time in minutes (minimum 1 minute)
 */
export function useReadingTime(body: any): number {
  const text = extractTextFromBody(body)

  if (!text) return 1

  // Count Chinese characters (including Traditional Chinese, Simplified Chinese, Japanese Kanji)
  // Unicode ranges:
  // - \u4e00-\u9fff: CJK Unified Ideographs
  // - \u3400-\u4dbf: CJK Extension A
  // - \uf900-\ufaff: CJK Compatibility Ideographs
  const chineseChars = text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g)
  const chineseCount = chineseChars ? chineseChars.length : 0

  // Count English words (sequences of letters)
  const englishWords = text.match(/[a-zA-Z]+/g)
  const englishCount = englishWords ? englishWords.length : 0

  // Calculate reading time with different speeds
  const chineseReadingTime = chineseCount / 500 // 500 chars per minute
  const englishReadingTime = englishCount / 200 // 200 words per minute

  const totalMinutes = chineseReadingTime + englishReadingTime

  // Round up and ensure minimum 1 minute
  return Math.max(Math.ceil(totalMinutes), 1)
}

/**
 * Composable wrapper for reactive reading time calculation
 *
 * @param article - Article with parsed content body
 * @returns Computed reading time in minutes
 */
export function useArticleReadingTime(article: Ref<ParsedContent | null> | ParsedContent | null) {
  return computed(() => {
    const content = unref(article)
    if (!content?.body) return 1
    return useReadingTime(content.body)
  })
}
