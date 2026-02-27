import DefaultTheme from 'vitepress/theme'
import GitHubCorner from './GitHubCorner.vue'
import ThemeToggle from './ThemeToggle.vue'
import './custom.css'
import { h } from 'vue'

export default {
    extends: DefaultTheme,
    Layout() {
        return h(DefaultTheme.Layout, null, {
            'layout-top': () => h(GitHubCorner),
            'layout-bottom': () => h(ThemeToggle)
        })
    }
}
