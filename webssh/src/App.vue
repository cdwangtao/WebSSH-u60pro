<template>
  <router-view />
</template>

<script setup lang="ts">

import { onBeforeMount, onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useGlobalStore } from "./stores/store";
import { useThemeStore } from "./stores/themeStore";


let router = useRouter();
let globalStore = useGlobalStore();
let themeStore = useThemeStore();

// 检查Wake Lock功能的支持情况
const isWakeLockSupported = "wakeLock" in navigator;

let wakeLock: WakeLockSentinel | null = null;

/**
 * 屏幕保持唤醒状态
 */
const requestScreenWakeLock = async () => {
  if (!isWakeLockSupported) return;
  
  try {
    wakeLock = await navigator.wakeLock.request("screen");
  } catch (error) {
    if ((error as Error).name !== 'NotAllowedError') {
      console.error(`WakeLock 错误：${(error as Error).message}`);
    }
  }
};

/**
 * 处理页面可见性变化
 */
const handleVisibilityChange = async () => {
  if (document.visibilityState === 'visible') {
    await requestScreenWakeLock();
  }
};

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (document.visibilityState === 'visible') {
    requestScreenWakeLock();
  }
});

/**
 * 检查系统是否已经初始化及运行模式
 */
onBeforeMount(async () => {
  // 初始化主题
  themeStore.initTheme();

  await axios.get<{ code: number; msg: string; data: { is_init: boolean } }>("/api/sys/is_init")
    .then((res) => {
      if (res.data.code === 0) {
        if (!res.data.data.is_init) {
          globalStore.isInit = false;
          globalStore.logout();
          localStorage.clear();
          router.push({ "name": "SysInit" })
          return;
        }
      } 
    }).catch((err) => {
      console.log("获取系统初始化状态异常:" + err);
    });
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  
  if (wakeLock) {
    wakeLock.release().then(() => {
      wakeLock = null;
    }).catch((error) => {
      console.error(`释放 WakeLock 错误：${error}`);
    });
  }
});

</script>

<style>
:root {
  --theme-bgi-color: rgba(0, 0, 0, 0.61);
  --theme-tag-color: rgba(0, 0, 0, 0.61);
  --theme-btn-color: hsl(201 100% 67% / 25.2%);
  --theme-title-color: hsl(201 100% 47% / 45.2%);
  --theme-btn-active-color: hsl(201 100% 47% / 45.2%);
  --theme-btn-disabled-color: hsl(201 0% 67% / 5.2%);
  --theme-text-color: rgb(0, 0, 0);
  --theme-text-gray: 0;
  --theme-blur-rate: 4px;
  --theme-primary-h: 201;
  --theme-primary-s: 100%;
  --theme-primary-l: 67%;
  --theme-primary-r: 0;
  --theme-primary-g: 97;
  --theme-primary-b: 255;
  --theme-primary-opacity: 0.61;
  --theme-bg-image: none;
  --theme-overlay-color: transparent;
}

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  background-color: var(--dark-bg-color);
  /* 移动端避免下拉/上拉时露出底层白色 */
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
}

.theme-settings-dialog {
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

/* 弹窗打开时背景毛玻璃遮罩 */
body:has(.theme-settings-dialog) .el-overlay {
  background: rgba(0, 0, 0, 0.55) !important;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.theme-settings-dialog .el-dialog__header {
  padding: 18px 22px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.03);
}

.theme-settings-dialog .el-dialog__title {
  color: #000;
  font-size: 17px;
  font-weight: 700;
}

.theme-settings-dialog .el-dialog__headerbtn {
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  transition: background 0.18s ease, transform 0.18s ease;
  color: rgba(0, 0, 0, 0.6);
}

.theme-settings-dialog .el-dialog__headerbtn:hover {
  background: rgba(0, 0, 0, 0.08);
  transform: rotate(90deg);
}

.theme-settings-dialog .el-dialog__body {
  padding: 18px 22px;
  color: #000;
}

.theme-settings-dialog .el-dialog__footer {
  padding: 14px 22px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.02);
}

.theme-settings-dialog .el-slider__button {
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.theme-settings-dialog .el-slider__bar {
  background: transparent !important;
}

.theme-settings-dialog .el-switch {
  --el-switch-on-color: var(--theme-btn-active-color, #409eff);
}

.theme-settings-dialog .el-input__wrapper {
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.06);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) inset;
}

.theme-settings-dialog .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2) inset;
}

.theme-settings-dialog .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--theme-btn-active-color, #409eff) inset;
}

.theme-settings-dialog .el-input__inner {
  color: #000;
}

.theme-settings-dialog .el-switch__label {
  color: rgba(0, 0, 0, 0.6);
}

.theme-settings-dialog .el-divider {
  border-top-color: rgba(0, 0, 0, 0.08);
}

.theme-settings-dialog .el-button {
  border-radius: 12px;
  font-weight: 600;
}

.theme-settings-dialog .el-button--primary {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  border: none;
}
</style>