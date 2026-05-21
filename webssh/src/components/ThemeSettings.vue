<template>
  <el-dialog
    title="主题设置"
    v-model="visible"
    :width="'95%'"
    :style="{ maxWidth: '520px' }"
    custom-class="theme-settings-dialog"
    :destroy-on-close="true"
    center
  >
    <div class="theme-settings">
      <div class="setting-item">
        <div class="setting-header">
          <span class="setting-label">主题色</span>
          <span class="setting-value">{{ themeHexColor }}</span>
        </div>
        <div class="slider-track hue-track">
          <el-slider v-model="huePer" :min="0" :max="100" :show-tooltip="false" @input="onHueChange" />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-header">
          <span class="setting-label">饱和度</span>
          <span class="setting-value">{{ Math.round(saturationPer) }}%</span>
        </div>
        <div class="slider-track saturation-track">
          <el-slider v-model="saturationPer" :min="0" :max="100" :show-tooltip="false" @input="onSaturationChange" />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-header">
          <span class="setting-label">亮度</span>
          <span class="setting-value">{{ Math.round(brightnessPer) }}%</span>
        </div>
        <div class="slider-track brightness-track">
          <el-slider v-model="brightnessPer" :min="0" :max="100" :show-tooltip="false" @input="onBrightnessChange" />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-header">
          <span class="setting-label">透明度</span>
          <span class="setting-value">{{ Math.round(opacityPer) }}%</span>
        </div>
        <div class="slider-track opacity-track">
          <el-slider v-model="opacityPer" :min="0" :max="100" :show-tooltip="false" @input="onOpacityChange" />
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-header">
          <span class="setting-label">字体颜色 (黑-白)</span>
          <span class="setting-value">{{ textColorPer }}%</span>
        </div>
        <div class="slider-track textcolor-track">
          <el-slider v-model="textColorPer" :min="0" :max="100" :show-tooltip="false" @input="onTextColorChange" />
        </div>
      </div>

      <el-divider />

      <div class="setting-item switch-row">
        <span class="setting-label">主页毛玻璃</span>
        <el-switch v-model="themeStore.blurEnabled" active-text="开" inactive-text="关" />
      </div>

      <div class="setting-item switch-row">
        <span class="setting-label">背景遮罩颜色</span>
        <el-switch v-model="themeStore.overlayEnabled" active-text="开" inactive-text="关" />
      </div>

      <div class="setting-item switch-row">
        <span class="setting-label">首页悬浮动画</span>
        <el-switch v-model="themeStore.hoverAnimationEnabled" active-text="开" inactive-text="关" />
      </div>

      <div class="setting-item switch-row">
        <span class="setting-label">信号表格横向滚动</span>
        <el-switch v-model="themeStore.tableScrollEnabled" active-text="开" inactive-text="关" />
      </div>

      <el-divider />

      <div class="setting-item switch-row">
        <span class="setting-label">启用背景图片</span>
        <el-switch v-model="bgEnabled" active-text="开" inactive-text="关" />
      </div>

      <div class="setting-item" v-if="bgEnabled">
        <div class="setting-header">
          <span class="setting-label">图片地址</span>
        </div>
        <el-input v-model="bgUrl" placeholder="输入图片URL" clearable class="bg-url-input" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer theme-footer">
        <el-button @click="resetTheme">重置主题</el-button>
        <el-button type="primary" @click="visible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useThemeStore } from "@/stores/themeStore"

const themeStore = useThemeStore()
const visible = ref(false)

const huePer = ref(67)
const saturationPer = ref(100)
const brightnessPer = ref(54)
const opacityPer = ref(20)
const textColorPer = ref(100)
const bgEnabled = ref(false)
const bgUrl = ref("")

function onHueChange(val: number) {
  themeStore.hue = (val / 100) * 300
}
function onSaturationChange(val: number) {
  themeStore.saturation = val / 100
}
function onBrightnessChange(val: number) {
  themeStore.brightness = val / 100
}
function onOpacityChange(val: number) {
  themeStore.opacity = val / 100
}
function onTextColorChange(val: number) {
  themeStore.textColorValue = val
}

watch(bgEnabled, (val) => {
  themeStore.backgroundEnabled = val
})
watch(bgUrl, (val) => {
  themeStore.backgroundUrl = val
})

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let r = 0, g = 0, b = 0
  if (hp >= 0 && hp < 1) { r = c; g = x; b = 0 }
  else if (hp >= 1 && hp < 2) { r = x; g = c; b = 0 }
  else if (hp >= 2 && hp < 3) { r = 0; g = c; b = x }
  else if (hp >= 3 && hp < 4) { r = 0; g = x; b = c }
  else if (hp >= 4 && hp < 5) { r = x; g = 0; b = c }
  else if (hp >= 5 && hp <= 6) { r = c; g = 0; b = x }
  const m = v - c
  const rr = Math.round((r + m) * 255)
  const gg = Math.round((g + m) * 255)
  const bb = Math.round((b + m) * 255)
  return `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`
}

const themeHexColor = computed(() => {
  return hsvToHex(themeStore.hue, themeStore.saturation, themeStore.brightness)
})

function resetTheme() {
  themeStore.resetTheme()
  huePer.value = 67
  saturationPer.value = 100
  brightnessPer.value = 54
  opacityPer.value = 20
  textColorPer.value = 100
  bgEnabled.value = false
  bgUrl.value = ""
}

function open() {
  huePer.value = Math.round((themeStore.hue / 300) * 100)
  saturationPer.value = Math.round(themeStore.saturation * 100)
  brightnessPer.value = Math.round(themeStore.brightness * 100)
  opacityPer.value = Math.round(themeStore.opacity * 100)
  textColorPer.value = themeStore.textColorValue
  bgEnabled.value = themeStore.backgroundEnabled
  bgUrl.value = themeStore.backgroundUrl
  visible.value = true
}

defineExpose({ open })
</script>

<style scoped>
.theme-settings {
  padding: 4px 0;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.setting-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.setting-value {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
  font-weight: 500;
  min-width: 60px;
  text-align: right;
  font-family: monospace;
}

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bg-url-input {
  margin-top: 8px;
}

.slider-track {
  padding: 0 2px;
}

.slider-track :deep(.el-slider__bar) {
  display: none !important;
}

.slider-track :deep(.el-slider__runway) {
  height: 6px;
  border-radius: 3px;
}

.hue-track :deep(.el-slider__runway) {
  background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
}

.saturation-track :deep(.el-slider__runway) {
  background: linear-gradient(to right, #808080 0%, #ff0000 100%);
}

.brightness-track :deep(.el-slider__runway) {
  background: linear-gradient(to right, #000 0%, #fff 100%);
}

.opacity-track :deep(.el-slider__runway) {
  background: linear-gradient(to right, rgba(128,128,128,0.1) 0%, rgba(128,128,128,0.9) 100%);
}

.textcolor-track :deep(.el-slider__runway) {
  background: linear-gradient(to right, #000 0%, #fff 100%);
}

.theme-footer {
  display: flex;
  justify-content: space-between;
}
</style>
