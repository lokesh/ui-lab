<script lang="ts" setup>
import { animate, spring } from '@motionone/dom'

const root = ref<HTMLElement | null>(null)
let springScheduled = false

let initialX: number
let initialY: number

function startSpring(e: any) {
  springScheduled = false
  animate(
    root.value!,
    { x: e.pageX - 50 - initialX, y: e.pageY - 50 - initialY },
    {
      easing: spring({
        stiffness: 300,
        damping: 100,
      }),
    },
  )
}

function handleMove(e: any) {
  !springScheduled && requestAnimationFrame(() => startSpring(e))
  springScheduled = true
}

function stopDrag() {
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('mousemove', handleMove)
}

function startDrag(e: MouseEvent) {
  initialX = e.clientX
  initialY = e.clientY
  
  window.addEventListener('mousemove', handleMove)
  window.addEventListener('mouseup', stopDrag)
}
</script>

<template>
  <div
    ref="root"
    @mousedown="startDrag"
  >
    Drag
  </div>
</template>
