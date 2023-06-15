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
  }

  reader.readAsDataURL(file);
}

/**
 * テキスト取得
 */
const onFetchText = async () => {
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
        ]
      },
    ]
  };

  try {
    const response = await callVisionRequest(request);
    console.log(response);
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
  <div v-if="loadedImage">
    <img :src="loadedImage" /><br />
    <PrimeButton label="テキスト取得" @click="onFetchText" />
  </div>
</template>

<style lang="sass" scoped>
</style>
