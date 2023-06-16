/**
 * ブロック単位
 */
export interface ContentBlock {
  paragraphs: ContentParagraph[];
}

/**
 * 段落単位
 */
export interface ContentParagraph {
  text: string
}
