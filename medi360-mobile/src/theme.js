/**
 * Shared UI Theme Constants
 * Apple Health / Fitbit inspired design tokens
 */

export const COLORS = {
  // Primary palette
  primary: '#4F46E5',        // Indigo-600
  primaryLight: '#818CF8',   // Indigo-400
  primaryDark: '#3730A3',    // Indigo-800
  primaryBg: '#EEF2FF',     // Indigo-50

  // Accent colors
  orange: '#F97316',
  orangeLight: '#FFF7ED',
  emerald: '#10B981',
  emeraldLight: '#ECFDF5',
  blue: '#3B82F6',
  blueLight: '#EFF6FF',
  purple: '#8B5CF6',
  purpleLight: '#F5F3FF',
  red: '#EF4444',
  redLight: '#FEF2F2',
  yellow: '#F59E0B',
  yellowLight: '#FFFBEB',
  teal: '#14B8A6',
  tealLight: '#F0FDFA',

  // Neutrals
  white: '#FFFFFF',
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  placeholder: '#CBD5E1',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Gradients (start, end)
  gradientPrimary: ['#4F46E5', '#7C3AED'],
  gradientHealth: ['#3B82F6', '#6366F1'],
  gradientOrange: ['#F97316', '#FB923C'],
  gradientEmerald: ['#10B981', '#34D399'],
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
};

export const FONTS = {
  regular: { fontSize: 14, color: COLORS.text },
  medium: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  semibold: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  bold: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  h1: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  h4: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textSecondary },
  small: { fontSize: 11, color: COLORS.textMuted },
};
