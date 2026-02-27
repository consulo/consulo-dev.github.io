<script setup lang="ts">
import { useData } from 'vitepress'

const { isDark } = useData()

function toggle() {
    isDark.value = !isDark.value
}
</script>

<template>
  <button class="theme-toggle" @click="toggle" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'" aria-label="Toggle color theme">
    <!-- Moon icon (visible in light mode) -->
    <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
    <!-- Sun icon (visible in dark mode) -->
    <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  </button>
</template>

<style>
.theme-toggle {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 100;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-toggle:hover {
    color: var(--vp-c-brand-1);
    border-color: var(--vp-c-brand-1);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

/* Light mode: show moon, hide sun */
.theme-toggle .icon-moon { display: block; }
.theme-toggle .icon-sun { display: none; }

/* Dark mode: show sun, hide moon */
.dark .theme-toggle .icon-moon { display: none; }
.dark .theme-toggle .icon-sun { display: block; }
</style>
