<script setup lang="ts">
import FileUpload from "primevue/fileupload";
import { nextTick, ref } from "vue";
import { type VisionRequest, callVisionRequest } from "./GoogleCloud/vision";
import type { ContentBlock, ContentParagraph } from "./interfaces/Content";
import { type SpeechRequest, callSpeechRequest } from "./GoogleCloud/speech";

interface Content {
  block: ContentBlock;
  voice: string;
}

const loadedImage = ref("");
const contents = ref<Content[]>([]);

const currentVoice = ref("");
const audioRef = ref<HTMLAudioElement | null>();

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
        let voice = "";
        try {
          const speechRequest: SpeechRequest = {
            input: {
              text: blockValue.paragraphs.reduce((t, p) => t += p.text, ""),
            },
            voice: {
              languageCode: "ja-JP",
              name: "ja-JP-Neural2-B",
              ssmlGender: "FEMALE",
            },
            audioConfig: {
              audioEncoding: "MP3",
            }
          }
          voice = await callSpeechRequest(speechRequest);
        } catch (error) {
          console.error(error);
        }
        contents.value.push({
          block: blockValue,
          voice,
        });
      }
    }
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.data.error.message);
    }
  }
}

/**
 * コンテンツの読み上げ
 * @param block 読み上げるコンテンツ
 */
const onSpeechBlock = async (content: Content): Promise<void> => {
  if (!audioRef.value) { return; }

  audioRef.value.pause();
  currentVoice.value = content.voice;
  nextTick(() => {
    if (!audioRef.value) { return; }
    audioRef.value.currentTime = 0;
    audioRef.value.play();
  })
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
      <template v-for="(content, contentIndex) in contents" :key="contentIndex">
        <template
          v-for="(paragraph, paragraphIndex) in content.block.paragraphs"
          :key="paragraphIndex"
        >
          <div
            class="textArea"
            @click="onSpeechBlock(content)"
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
    <audio :src="currentVoice" ref="audioRef" />
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
