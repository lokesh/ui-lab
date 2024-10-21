<script setup lang="ts">
import { Motion, Presence } from '@oku-ui/motion';
import { ref } from 'vue';

const refreshKey = ref(0);
const isModalOpen = ref(false)

// Function to force refresh
const forceRefresh = () => {
  refreshKey.value++;
};

const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value;
}
</script>

<template>
  <div class="controls">
    <pre>
      Todo:
      - [ ] Modal in and out
      - [ ] Staggered list
    </pre>
    <pre>
      Notes:
      :transition="{ duration: 1, repeat: 0 }"
    </pre>
    <div class="button-row">
      <button @click="forceRefresh">Refresh</button>
      <button @click="toggleModal">Toggle Modal</button>
    </div>
  </div>
  <div class="row">
    <Motion 
      :key="refreshKey"
      class="box" 
      :animate="{ x: 0 }" 
      :initial="{ x: -100 }"
    >
      Enter
    </Motion>
    <Presence :initial="true" :exitBeforeEnter="false">
      <Motion
        v-if="isModalOpen"
        class="box"
        :initial="{ opacity: 0, y: '50px' }"
        :animate="{ opacity: 1, y: 0 }"
        
        :exit="{ opacity: 0, y: '-50px' }"
      >
        Modal<br />
        <small>Enter and Exit</small>
        </Motion>
    </Presence>
  </div>
  <div class="row">
    <Motion class="box" :hover="{ scale: 0.8 }">
      Hover
    </Motion>
    <Motion class="box" :press="{ scale: 0.8 }">
      Press
    </Motion>
    <Motion
      class="box"
      :press="{
      scale: [1, 1.5, 1],
        rotate: [0, 180, 360],
      }"
      :transition="{
        duration: 1,
        times: [0, 0.5, 1],
        repeat: Infinity,
        repeatDelay: 0,
      }"
    >
      Press & hold
    </Motion>
  </div>
  <div class="row">
    ...
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  font-size: 12px;
  font-family: monospace;

}

.controls {
  margin-bottom: 16px;
}

button {
  background: #000;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
}

.row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.button-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.box {
  background: #ccc;
  border-radius: 16px;
  width: 100px;
  height: 100px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  text-align: center;
}

small {
  font-size: 10px;
  /* color: #666 */
}
</style>
