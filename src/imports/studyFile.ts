import type { ReviewCard, QuizQuestion } from './App'

export interface StudyFileData {
  fileName: string
  title: string
  fileType: string
  sizeLabel: string
  text: string
  keyPoints: string[]
  cards: ReviewCard[]
  questions: QuizQuestion[]
}

function cleanText(text: string) {
  return text
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractSentences(text: string) {
  const blocks = text
    .split(/\n+|(?<=[.!?])\s+/)
    .map(item => item.replace(/^[-*#\d.)\s]+/, '').trim())
    .filter(item => item.length >= 28)

  return [...new Set(blocks)].slice(0, 30)
}

function conceptFromSentence(sentence: string) {
  const labelled = sentence.match(/^([^:–—-]{2,48})\s*[:–—-]\s*(.{15,})$/)
  if (labelled) return { concept: labelled[1].trim(), definition: labelled[2].trim() }

  const words = sentence.replace(/[^\p{L}\p{N}\s'-]/gu, '').split(/\s+/)
  const concept = words.slice(0, Math.min(6, words.length)).join(' ')
  return { concept, definition: sentence }
}

function buildCards(sentences: string[]): ReviewCard[] {
  return sentences.slice(0, 12).map((sentence, index) => {
    const { concept, definition } = conceptFromSentence(sentence)
    return { id: index + 1, concept, definition }
  })
}

function buildQuestions(cards: ReviewCard[]): QuizQuestion[] {
  if (cards.length < 2) return []

  return cards.slice(0, 10).map((card, index) => {
    const distractors = cards
      .filter(other => other.id !== card.id)
      .slice(index, index + 3)
      .map(other => other.definition)

    if (distractors.length < 3) {
      distractors.push(
        ...cards
          .filter(other => other.id !== card.id && !distractors.includes(other.definition))
          .map(other => other.definition),
      )
    }

    const options = [card.definition, ...distractors.slice(0, 3)]
    const shift = index % options.length
    const rotated = [...options.slice(shift), ...options.slice(0, shift)]

    return {
      id: index + 1,
      question: `Which statement best explains “${card.concept}”?`,
      options: rotated,
      correct: rotated.indexOf(card.definition),
      explanation: card.definition,
    }
  })
}

async function readPdf(file: File) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const document = await pdfjs.getDocument({ data: await file.arrayBuffer(), disableWorker: true }).promise
  const pages: string[] = []

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const content = await page.getTextContent()
    pages.push(content.items.map(item => ('str' in item ? item.str : '')).join(' '))
  }

  return pages.join('\n\n')
}

async function readDocx(file: File) {
  const mammoth = await import('mammoth/mammoth.browser')
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
  return result.value
}

export async function parseStudyFile(file: File): Promise<StudyFileData> {
  const extension = file.name.split('.').pop()?.toLowerCase()
  let rawText = ''

  if (extension === 'pdf') rawText = await readPdf(file)
  else if (extension === 'docx') rawText = await readDocx(file)
  else rawText = await file.text()

  const text = cleanText(rawText)
  if (!text) throw new Error('No readable text was found in this file.')

  const sentences = extractSentences(text)
  if (!sentences.length) throw new Error('This file does not contain enough readable text to build a study set.')

  const cards = buildCards(sentences)
  const title = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')

  return {
    fileName: file.name,
    title,
    fileType: extension?.toUpperCase() ?? 'FILE',
    sizeLabel: file.size < 1_000_000 ? `${Math.max(1, Math.round(file.size / 1000))} KB` : `${(file.size / 1_000_000).toFixed(1)} MB`,
    text,
    keyPoints: sentences.slice(0, 8),
    cards,
    questions: buildQuestions(cards),
  }
}
