import { defineConfig, definePlugin } from '@pandacss/dev'
import { animationStyles } from './theme/animation-styles'
import { colors as colorPalettes } from './theme/colors'
import { conditions } from './theme/conditions'
import { globalCss } from './theme/global-css'
import { keyframes } from './theme/keyframes'
import { layerStyles } from './theme/layer-styles'
import { recipes, slotRecipes } from './theme/recipes'
import { textStyles } from './theme/text-styles'
import { colors } from './theme/tokens/colors'
import { durations } from './theme/tokens/durations'
import { shadows } from './theme/tokens/shadows'
import { zIndex } from './theme/tokens/z-index'

// preset-panda ships its own default color tokens, which would shadow the
// Park UI palette below, so drop them before they're merged.
const removePandaColors = definePlugin({
  name: 'Remove Panda Preset Colors',
  hooks: {
    'preset:resolved': ({ utils, preset, name }) =>
      name === '@pandacss/preset-panda'
        ? utils.omit(preset, ['theme.tokens.colors', 'theme.semanticTokens.colors'])
        : preset,
  },
})

export default defineConfig({
  preflight: true,
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  plugins: [removePandaColors],
  jsxFramework: 'react',
  include: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  exclude: [],
  conditions,
  globalCss,
  theme: {
    extend: {
      animationStyles,
      recipes,
      slotRecipes,
      keyframes,
      layerStyles,
      textStyles,
      tokens: {
        colors,
        durations,
        zIndex,
      },
      semanticTokens: {
        colors: {
          ...colorPalettes,
          gray: colorPalettes.neutral,
          fg: {
            default: { value: { _light: '{colors.gray.12}', _dark: '{colors.gray.12}' } },
            muted: { value: { _light: '{colors.gray.11}', _dark: '{colors.gray.11}' } },
            subtle: { value: { _light: '{colors.gray.10}', _dark: '{colors.gray.10}' } },
          },
          canvas: { value: { _light: '{colors.gray.1}', _dark: '{colors.gray.1}' } },
          border: { value: { _light: '{colors.gray.4}', _dark: '{colors.gray.4}' } },
          error: { value: { _light: '{colors.red.9}', _dark: '{colors.red.9}' } },
        },
        shadows,
        radii: {
          l1: { value: '{radii.xs}' },
          l2: { value: '{radii.sm}' },
          l3: { value: '{radii.md}' },
        },
      },
    },
  },
  outdir: 'styled-system',
})
