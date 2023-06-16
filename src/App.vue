<script setup lang="ts">
import FileUpload from "primevue/fileupload";
import { ref } from "vue";
import { type VisionRequest, callVisionRequest } from "./GoogleCloud/vision";

const loadedImage = ref("");

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
        let value = "";
        for (const paragraph of block.paragraphs) {
          for (const word of paragraph.words) {
            for (const symbol of word.symbols) {
              value += symbol.text;
            }
          }
        }
        console.log(value);
      }
    }
  } catch (error: any) {
    if (error.response) {
      console.log(error.response.data.error.message);
    }
  }
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
    </div>
  </div>
</template>

<style lang="sass" scoped>
.root
  position: relative

  .image
    position: absolute
</style>
