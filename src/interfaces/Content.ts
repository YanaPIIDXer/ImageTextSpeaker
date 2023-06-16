/**
 * ブロック単位
 */
export interface ContentBlock {
  paragraphs: ContentParagraph[];
}

/**
 * 座標用
 */
interface Vector {
  x: number;
  y: number;
}

/**
 * バウンディングボックス
 */
interface BoundingBox {
  vertices: Vector[];
}

/**
 * 段落単位
 */
export interface ContentParagraph {
  text: string
  boundingBox: BoundingBox;
}
