// Design tokens for the Trip Plan app
// Beige (background) + colorful category accents

export const gradients = {
  primary: ['#8BC34A', '#689F38', '#558B2F'] as const,
  accent: ['#8BC34A', '#689F38'] as const,
  category: {
    transport: ['#60A5FA', '#3B82F6'] as const, // blue
    accommodation: ['#F472B6', '#EC4899'] as const, // pink
    food: ['#FBBF24', '#F59E0B'] as const, // yellow
    activity: ['#22D3EE', '#06B6D4'] as const, // light blue
    other: ['#BDBDBD', '#9E9E9E'] as const, // grey
  },
  reservation: {
    flight: ['#60A5FA', '#3B82F6'] as const, // blue
    hotel: ['#F472B6', '#EC4899'] as const, // pink
    rental_car: ['#34D399', '#10B981'] as const, // green
    restaurant: ['#FBBF24', '#F59E0B'] as const, // yellow
    activity: ['#22D3EE', '#06B6D4'] as const, // light blue
    other: ['#BDBDBD', '#9E9E9E'] as const, // grey
  },
} as const;

export const colors = {
  text: {
    primary: '#2D2A24',
    secondary: '#4A4639',
    tertiary: '#827A6C',
    quaternary: '#ADA494',
  },
  background: {
    primary: '#F5F0E6',
    card: '#FFFDF7',
    elevated: '#ECE6D9',
  },
  border: {
    primary: '#DDD6C6',
    secondary: '#ECE6D9',
  },
  category: {
    transport: '#3B82F6', // blue
    accommodation: '#EC4899', // pink
    food: '#F59E0B', // yellow
    activity: '#06B6D4', // light blue
    other: '#9E9E9E', // grey
  },
  reservation: {
    flight: '#3B82F6', // blue
    hotel: '#EC4899', // pink
    rental_car: '#10B981', // green
    restaurant: '#F59E0B', // yellow
    activity: '#06B6D4', // light blue
    other: '#9E9E9E', // grey
  },
  semantic: {
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  accent: '#7CB342',
  accentLight: '#F1F8E9',
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  whiteAlpha80: 'rgba(255, 255, 255, 0.8)',
  whiteAlpha30: 'rgba(255, 255, 255, 0.3)',
} as const;

export const typography = {
  fontSizes: {
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 15,
    xl: 16,
    '2xl': 18,
    '3xl': 20,
    '4xl': 24,
    '5xl': 28,
  },
  fontWeights: {
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 6,
  md: 8,
  base: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
  '3xl': 20,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#558B2F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#558B2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#558B2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  fab: {
    shadowColor: '#558B2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;
