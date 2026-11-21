/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        'sidebar-bg': 'var(--color-sidebar-bg)',

        // Text
        text: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        'on-dark': 'var(--color-text-on-dark)',
        'on-primary': 'var(--color-text-on-primary)',
        'on-accent': 'var(--color-text-on-accent)',

        // Actions
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          hover: 'var(--color-danger-hover)',
        },
        info: 'var(--color-info)',

        // Borders & Focus
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        'focus-ring': 'var(--color-focus-ring)',
        'focus-offset': 'var(--color-focus-offset)',

        // Status
        'status-submitted': {
          bg: 'var(--status-submitted-bg)',
          fg: 'var(--status-submitted-fg)',
          border: 'var(--status-submitted-border)',
        },
        'status-under-review': {
          bg: 'var(--status-under-review-bg)',
          fg: 'var(--status-under-review-fg)',
          border: 'var(--status-under-review-border)',
        },
        'status-in-progress': {
          bg: 'var(--status-in-progress-bg)',
          fg: 'var(--status-in-progress-fg)',
          border: 'var(--status-in-progress-border)',
        },
        'status-resolved': {
          bg: 'var(--status-resolved-bg)',
          fg: 'var(--status-resolved-fg)',
          border: 'var(--status-resolved-border)',
        },
        'status-rejected': {
          bg: 'var(--status-rejected-bg)',
          fg: 'var(--status-rejected-fg)',
          border: 'var(--status-rejected-border)',
        },
        'status-overdue': {
          DEFAULT: 'var(--status-overdue)',
          bg: 'var(--status-overdue-bg)',
          fg: 'var(--status-overdue-fg)',
          border: 'var(--status-overdue-border)',
        },

        // Charts
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      },
      zIndex: {
        sidebar: 'var(--z-sidebar)',
        overlay: 'var(--z-overlay)',
      },
      width: {
        sidebar: 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-width-collapsed)',
      },
    },
  },
  plugins: [],
}
