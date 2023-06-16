<script setup lang="ts">
import FileUpload from "primevue/fileupload";
import { ref } from "vue";
import { type VisionRequest, callVisionRequest } from "./GoogleCloud/vision";
import type { ContentBlock, ContentParagraph } from "./interfaces/Content";

const loadedImage = ref("");
const blocks = ref<ContentBlock[]>([]);

/**
 * アップロードした
 */
const onUpload = (e: any) => {
  const file = e.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const base64 = (reader.result as string).replace("\n", "");
    loadedImage.value = base64;
    fetchText();
  }

  reader.readAsDataURL(file);
}

/**
 * テキスト取得
 */
const fetchText = async () => {
  const request: VisionRequest = {
    requests: [
      {
        image: {
          content: loadedImage.value.split(",")[1],
        },
        features: [
          {
            type: "TEXT_DETECTION",
            maxResults: 30,
          }
        ],
        imageContext: {
          textDetectionParams: {
            disableTextAnnotations: true,
          }
        }
      },
    ]
  };

  try {
    const response = await callVisionRequest(request);
    for (const page of response.pages) {
      for (const block of page.blocks) {
        const blockValue: ContentBlock = { paragraphs: [] };
        for (const paragraph of block.paragraphs) {
          let paragraphValue: ContentParagraph = {
            text: "",
            boundingBox: { vertices: paragraph.boundingBox.vertices },
          };
          for (const word of paragraph.words) {
            let wordValue = "";
            for (const symbol of word.symbols) {
              wordValue += symbol.text;
            }
            paragraphValue.text += wordValue;
          }
          blockValue.paragraphs.push(paragraphValue);
        }
        blocks.value.push(blockValue);
      }
    }
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.data.error.message);
    }
  }
}

/**
 * ブロックの読み上げ
 * @param block 読み上げるブロック
 */
const onSpeechBlock = (block: ContentBlock): void => {
  const text = block.paragraphs.reduce((t, p) => t += p.text, "");
  alert(text);
}
</script>

<template>
  <FileUpload
    accept="image/*"
    :auto="true"
    :custom-upload="true"
    @uploader="onUpload"
  />
  <div class="root">
    <div v-if="loadedImage">
      <img class="image" :src="loadedImage" />
      <template v-for="(block, blockIndex) in blocks" :key="blockIndex">
        <template
          v-for="(paragraph, paragraphIndex) in block.paragraphs"
          :key="paragraphIndex"
        >
          <div
            class="textArea"
            @click="onSpeechBlock(block)"
            :style="{
              left: `${paragraph.boundingBox.vertices[0].x}px`,
              top: `${paragraph.boundingBox.vertices[0].y}px`,
              width: `${paragraph.boundingBox.vertices[2].x - paragraph.boundingBox.vertices[0].x}px`,
              height: `${paragraph.boundingBox.vertices[2].y - paragraph.boundingBox.vertices[0].y}px`,
            }"
          >
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.root
  position: relative

  .image
    position: absolute

  .textArea
    position: absolute
    background: #FF00FF
    animation: flash 2s linear infinite

    @keyframes flash
      0%, 100%
        opacity: 0.4
      50%
        opacity: 0
</style>
