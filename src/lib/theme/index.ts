/**
 * Theme system for Expression Editor
 * Supports CSS variables, theme props, and class-based overrides
 */

export { createEditorTheme } from './createTheme';
export { defaultTheme } from './defaultTheme';
export { darkTheme, lightTheme, n8nTheme } from './presets';
export { EDITOR_CLASS_NAMES, CSS_VARIABLES } from './types';
export type { ThemeConfig, ThemeColors, ThemeTypography, ThemeSpacing, ThemeBorder } from './types';
