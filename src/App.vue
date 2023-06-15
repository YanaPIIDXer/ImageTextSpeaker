<script setup lang="ts">
import FileUpload from "primevue/fileupload";
import { ref } from "vue";

const loadedImage = ref("");

/**
 * アップロードした
 */
const onUpload = (e: any) => {
  const file = e.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const base64 = reader.result as string;
    loadedImage.value = base64;
  }

  reader.readAsDataURL(file);
}
</script>

<template>
  <FileUpload
    accept="image/*"
    :auto="true"
    :custom-upload="true"
    @uploader="onUpload"
  />
  <img v-if="loadedImage" :src="loadedImage" />
</template>

<style lang="sass" scoped>
</style>
