import { ref, watch } from "vue"
import { defineStore } from "pinia"
import axios from "axios"

export interface ThemeState {
  hue: number
  saturation: number
  brightness: number
  opacity: number
  textColorValue: number
  blurEnabled: boolean
  overlayEnabled: boolean
  backgroundEnabled: boolean
  backgroundUrl: string
  hoverAnimationEnabled: boolean
  tableScrollEnabled: boolean
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
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
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) }
}

function hsvToHsl(h: number, s: number, v: number): { h: number; s: number; l: number } {
  const l = v * (1 - s / 2)
  const sv = (l === 0 || l === 1) ? 0 : (v - l) / Math.min(l, 1 - l)
  return { h, s: sv * 100, l: l * 100 }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

export const useThemeStore = defineStore(
  "theme",
  () => {
    const hue = ref(201)
    const saturation = ref(1)
    const brightness = ref(0.54)
    const opacity = ref(0.2)
    const textColorValue = ref(100)
    const blurEnabled = ref(true)
    const overlayEnabled = ref(true)
    const backgroundEnabled = ref(false)
    const backgroundUrl = ref("")
    const hoverAnimationEnabled = ref(true)
    const tableScrollEnabled = ref(false)

    function getGrayscaleText(): string {
      const gray = Math.round((textColorValue.value / 100) * 255)
      return `rgb(${gray}, ${gray}, ${gray})`
    }

    function applyTheme() {
      const { r, g, b } = hsvToRgb(hue.value, saturation.value, brightness.value)
      const { h, s, l } = hsvToHsl(hue.value, saturation.value, brightness.value)

      const lighterL = Math.min(l + 20, 100)
      const btnBaseOpacity = Math.min(opacity.value * 1.2, 1)

      const btnColor = `hsl(${Math.round(h)} ${s.toFixed(1)}% ${lighterL.toFixed(1)}% / ${(btnBaseOpacity * 100).toFixed(2)}%)`

      let activeS: number, activeL: number
      if (lighterL > 80) {
        activeS = Math.min(s * 1.8, 100)
        activeL = Math.max(lighterL - 25, 20)
      } else {
        activeS = Math.min(s * 1.6, 100)
        activeL = Math.min(lighterL + 20, 60)
        activeL = Math.max(activeL, 20)
      }

      const btnActiveOpacity = Math.min(btnBaseOpacity + 0.2, 1)
      const btnActiveColor = `hsl(${Math.round(h)} ${activeS.toFixed(1)}% ${activeL.toFixed(1)}% / ${(btnActiveOpacity * 100).toFixed(2)}%)`

      const btnDisabledOpacity = Math.max(btnBaseOpacity - 0.2, 0.1)
      const btnDisabledColor = `hsl(${Math.round(h)} 0% ${lighterL.toFixed(1)}% / ${(btnDisabledOpacity * 100).toFixed(2)}%)`

      const color = `rgba(${r}, ${g}, ${b}, ${opacity.value})`

      const root = document.documentElement
      root.style.setProperty('--theme-bgi-color', color)
      root.style.setProperty('--theme-tag-color', color)
      root.style.setProperty('--theme-btn-color', btnColor)
      root.style.setProperty('--theme-title-color', btnActiveColor)
      root.style.setProperty('--theme-btn-active-color', btnActiveColor)
      root.style.setProperty('--theme-btn-disabled-color', btnDisabledColor)
      root.style.setProperty('--theme-text-color', getGrayscaleText())
      root.style.setProperty('--theme-blur-rate', blurEnabled.value ? "4px" : "0")

      const textGray = Math.round((textColorValue.value / 100) * 255)
      root.style.setProperty('--theme-text-gray', String(textGray))

      root.style.setProperty('--theme-primary-h', String(Math.round(h)))
      root.style.setProperty('--theme-primary-s', `${s.toFixed(1)}%`)
      root.style.setProperty('--theme-primary-l', `${lighterL.toFixed(1)}%`)
      root.style.setProperty('--theme-primary-r', String(r))
      root.style.setProperty('--theme-primary-g', String(g))
      root.style.setProperty('--theme-primary-b', String(b))
      root.style.setProperty('--theme-primary-opacity', String(opacity.value))

      if (backgroundEnabled.value && backgroundUrl.value) {
        root.style.setProperty('--theme-bg-image', `url(${backgroundUrl.value})`)
      } else {
        root.style.setProperty('--theme-bg-image', 'none')
      }

      root.style.setProperty('--theme-overlay-color',
        overlayEnabled.value ? color : 'transparent'
      )

      root.style.setProperty('--theme-hover-y', hoverAnimationEnabled.value ? '' : '0px')

      // 统一通过 CSS 变量管理主题背景色：把当前主题色的深色版写入 --dark-bg-color，
      // 让 body / html 的背景跟随主题切换，避免在 JS 中直接覆盖样式造成冲突
      const darkL = Math.max(Math.min(l * 0.45, 18), 6)
      root.style.setProperty('--dark-bg-color', `hsl(${Math.round(h)}, ${s.toFixed(1)}%, ${darkL.toFixed(1)}%)`)
      root.style.setProperty('--dark-bg-color-transparent', `hsla(${Math.round(h)}, ${s.toFixed(1)}%, ${darkL.toFixed(1)}%, 0.68)`)
      root.style.setProperty('--dark-bgi-color', `hsla(${Math.round(h)}, ${s.toFixed(1)}%, ${darkL.toFixed(1)}%, 0.61)`)
    }

    function saveToServer() {
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        const data = {
          hue: hue.value,
          saturation: saturation.value,
          brightness: brightness.value,
          opacity: opacity.value,
          textColorValue: textColorValue.value,
          blurEnabled: blurEnabled.value,
          overlayEnabled: overlayEnabled.value,
          backgroundEnabled: backgroundEnabled.value,
          backgroundUrl: backgroundUrl.value,
          hoverAnimationEnabled: hoverAnimationEnabled.value,
          tableScrollEnabled: tableScrollEnabled.value,
        }
        axios.post('/api/theme', data).catch(() => {})
      }, 500)
    }

    async function loadFromServer() {
      try {
        const resp = await axios.get<{ code: number; data: ThemeState | null }>('/api/theme')
        if (resp.data.code === 0 && resp.data.data) {
          const d = resp.data.data
          hue.value = d.hue ?? 201
          saturation.value = d.saturation ?? 1
          brightness.value = d.brightness ?? 0.54
          opacity.value = d.opacity ?? 0.2
          textColorValue.value = d.textColorValue ?? 100
          blurEnabled.value = d.blurEnabled ?? true
          overlayEnabled.value = d.overlayEnabled ?? true
          backgroundEnabled.value = d.backgroundEnabled ?? false
          backgroundUrl.value = d.backgroundUrl ?? ""
          hoverAnimationEnabled.value = d.hoverAnimationEnabled ?? true
          tableScrollEnabled.value = d.tableScrollEnabled ?? false
          applyTheme()
        }
      } catch {
        // 服务端没有主题文件，使用默认值
      }
    }

    function initTheme() {
      loadFromServer()
      applyTheme()
    }

    function resetTheme() {
      hue.value = 201
      saturation.value = 1
      brightness.value = 0.54
      opacity.value = 0.2
      textColorValue.value = 100
      blurEnabled.value = true
      overlayEnabled.value = true
      backgroundEnabled.value = false
      backgroundUrl.value = ""
      hoverAnimationEnabled.value = true
      tableScrollEnabled.value = false
      applyTheme()
      saveToServer()
    }

    watch([hue, saturation, brightness, opacity, textColorValue, blurEnabled, overlayEnabled, backgroundEnabled, backgroundUrl, hoverAnimationEnabled, tableScrollEnabled], () => {
      applyTheme()
      saveToServer()
    })

    return {
      hue, saturation, brightness, opacity, textColorValue,
      blurEnabled, overlayEnabled, backgroundEnabled, backgroundUrl, hoverAnimationEnabled, tableScrollEnabled,
      applyTheme, initTheme, resetTheme, getGrayscaleText, saveToServer, loadFromServer
    }
  }
)
