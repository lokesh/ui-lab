<script setup lang="ts">
import { Motion, Presence } from '@oku-ui/motion';
import { ref } from 'vue';

const refreshKey = ref(0);
const listRefreshKey = ref(0);
const isModalOpen = ref(false)

// Function to force refresh
const forceRefresh = () => {
  refreshKey.value++;
};

const forceListRefresh = () => {
  listRefreshKey.value++;
};

const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value;
}

const log = (e: any) => {
  console.log(e.type);
}
</script>

<template>
  <div class="controls">
    <div class="button-row">
      <button @click="forceRefresh">↩ Enter</button>
      <button @click="forceListRefresh">↩ List</button>
      <button @click="toggleModal">◉ Modal</button>
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
    <PresenceGroup :key="listRefreshKey" :exitBeforeEnter="false" :initial="true">
      <template v-for="item, index in [1, 2, 3, 4]" :key="item">
        <Motion
          class="box"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ delay: index * 0.5 }"
          :exit="{ opacity: 0 }">
          Item {{ index }}
        </Motion>
      </template>
    </PresenceGroup>
  </div>
  <div class="row">
    <Motion class="box" :hover="{ scale: 1.2 }">
      Hover
    </Motion>
    <Motion class="box" :press="{ scale: 0.9 }">
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
    <SpringMouse class="box" />
  </div>
  <div class="row">
    <Motion class="box"
      :initial="{ scale: 0.8 }"
      :in-view="{ scale: 1 }"
    >
      In view
    </Motion>
    <Motion
      class="box"
      :initial="{ opacity: 0, scale: 0.8 }"
      :hover="{ scale: 1.2 }"
      :press="{ scale: 0.9 }"
      :in-view="{ scale: 1, opacity: 1 }"
      :transition="{ duration: 1 }"
      @hoverstart="log"
      @hoverend="log"
      @pressstart="log"
      @pressend="log"
      @viewenter="log"
      @viewleave="log"
      @motioncomplete="log"
      @motionstart="log"
    >Logger</Motion>
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
