const tokens = {
  "aspectRatios.square": {
    "value": "1 / 1",
    "variable": "var(--aspect-ratios-square)"
  },
  "aspectRatios.landscape": {
    "value": "4 / 3",
    "variable": "var(--aspect-ratios-landscape)"
  },
  "aspectRatios.portrait": {
    "value": "3 / 4",
    "variable": "var(--aspect-ratios-portrait)"
  },
  "aspectRatios.wide": {
    "value": "16 / 9",
    "variable": "var(--aspect-ratios-wide)"
  },
  "aspectRatios.ultrawide": {
    "value": "18 / 5",
    "variable": "var(--aspect-ratios-ultrawide)"
  },
  "aspectRatios.golden": {
    "value": "1.618 / 1",
    "variable": "var(--aspect-ratios-golden)"
  },
  "borders.none": {
    "value": "none",
    "variable": "var(--borders-none)"
  },
  "easings.default": {
    "value": "cubic-bezier(0.4, 0, 0.2, 1)",
    "variable": "var(--easings-default)"
  },
  "easings.linear": {
    "value": "linear",
    "variable": "var(--easings-linear)"
  },
  "easings.in": {
    "value": "cubic-bezier(0.4, 0, 1, 1)",
    "variable": "var(--easings-in)"
  },
  "easings.out": {
    "value": "cubic-bezier(0, 0, 0.2, 1)",
    "variable": "var(--easings-out)"
  },
  "easings.in-out": {
    "value": "cubic-bezier(0.4, 0, 0.2, 1)",
    "variable": "var(--easings-in-out)"
  },
  "radii.xs": {
    "value": "0.125rem",
    "variable": "var(--radii-xs)"
  },
  "radii.sm": {
    "value": "0.25rem",
    "variable": "var(--radii-sm)"
  },
  "radii.md": {
    "value": "0.375rem",
    "variable": "var(--radii-md)"
  },
  "radii.lg": {
    "value": "0.5rem",
    "variable": "var(--radii-lg)"
  },
  "radii.xl": {
    "value": "0.75rem",
    "variable": "var(--radii-xl)"
  },
  "radii.2xl": {
    "value": "1rem",
    "variable": "var(--radii-2xl)"
  },
  "radii.3xl": {
    "value": "1.5rem",
    "variable": "var(--radii-3xl)"
  },
  "radii.4xl": {
    "value": "2rem",
    "variable": "var(--radii-4xl)"
  },
  "radii.full": {
    "value": "9999px",
    "variable": "var(--radii-full)"
  },
  "fontWeights.thin": {
    "value": "100",
    "variable": "var(--font-weights-thin)"
  },
  "fontWeights.extralight": {
    "value": "200",
    "variable": "var(--font-weights-extralight)"
  },
  "fontWeights.light": {
    "value": "300",
    "variable": "var(--font-weights-light)"
  },
  "fontWeights.normal": {
    "value": "400",
    "variable": "var(--font-weights-normal)"
  },
  "fontWeights.medium": {
    "value": "500",
    "variable": "var(--font-weights-medium)"
  },
  "fontWeights.semibold": {
    "value": "600",
    "variable": "var(--font-weights-semibold)"
  },
  "fontWeights.bold": {
    "value": "700",
    "variable": "var(--font-weights-bold)"
  },
  "fontWeights.extrabold": {
    "value": "800",
    "variable": "var(--font-weights-extrabold)"
  },
  "fontWeights.black": {
    "value": "900",
    "variable": "var(--font-weights-black)"
  },
  "lineHeights.none": {
    "value": "1",
    "variable": "var(--line-heights-none)"
  },
  "lineHeights.tight": {
    "value": "1.25",
    "variable": "var(--line-heights-tight)"
  },
  "lineHeights.snug": {
    "value": "1.375",
    "variable": "var(--line-heights-snug)"
  },
  "lineHeights.normal": {
    "value": "1.5",
    "variable": "var(--line-heights-normal)"
  },
  "lineHeights.relaxed": {
    "value": "1.625",
    "variable": "var(--line-heights-relaxed)"
  },
  "lineHeights.loose": {
    "value": "2",
    "variable": "var(--line-heights-loose)"
  },
  "fonts.sans": {
    "value": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"",
    "variable": "var(--fonts-sans)"
  },
  "fonts.serif": {
    "value": "ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif",
    "variable": "var(--fonts-serif)"
  },
  "fonts.mono": {
    "value": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
    "variable": "var(--fonts-mono)"
  },
  "letterSpacings.tighter": {
    "value": "-0.05em",
    "variable": "var(--letter-spacings-tighter)"
  },
  "letterSpacings.tight": {
    "value": "-0.025em",
    "variable": "var(--letter-spacings-tight)"
  },
  "letterSpacings.normal": {
    "value": "0em",
    "variable": "var(--letter-spacings-normal)"
  },
  "letterSpacings.wide": {
    "value": "0.025em",
    "variable": "var(--letter-spacings-wide)"
  },
  "letterSpacings.wider": {
    "value": "0.05em",
    "variable": "var(--letter-spacings-wider)"
  },
  "letterSpacings.widest": {
    "value": "0.1em",
    "variable": "var(--letter-spacings-widest)"
  },
  "fontSizes.2xs": {
    "value": "0.5rem",
    "variable": "var(--font-sizes-2xs)"
  },
  "fontSizes.xs": {
    "value": "0.75rem",
    "variable": "var(--font-sizes-xs)"
  },
  "fontSizes.sm": {
    "value": "0.875rem",
    "variable": "var(--font-sizes-sm)"
  },
  "fontSizes.md": {
    "value": "1rem",
    "variable": "var(--font-sizes-md)"
  },
  "fontSizes.lg": {
    "value": "1.125rem",
    "variable": "var(--font-sizes-lg)"
  },
  "fontSizes.xl": {
    "value": "1.25rem",
    "variable": "var(--font-sizes-xl)"
  },
  "fontSizes.2xl": {
    "value": "1.5rem",
    "variable": "var(--font-sizes-2xl)"
  },
  "fontSizes.3xl": {
    "value": "1.875rem",
    "variable": "var(--font-sizes-3xl)"
  },
  "fontSizes.4xl": {
    "value": "2.25rem",
    "variable": "var(--font-sizes-4xl)"
  },
  "fontSizes.5xl": {
    "value": "3rem",
    "variable": "var(--font-sizes-5xl)"
  },
  "fontSizes.6xl": {
    "value": "3.75rem",
    "variable": "var(--font-sizes-6xl)"
  },
  "fontSizes.7xl": {
    "value": "4.5rem",
    "variable": "var(--font-sizes-7xl)"
  },
  "fontSizes.8xl": {
    "value": "6rem",
    "variable": "var(--font-sizes-8xl)"
  },
  "fontSizes.9xl": {
    "value": "8rem",
    "variable": "var(--font-sizes-9xl)"
  },
  "shadows.2xs": {
    "value": "0 1px rgb(0 0 0 / 0.05)",
    "variable": "var(--shadows-2xs)"
  },
  "shadows.xs": {
    "value": "var(--shadows-xs)",
    "variable": "var(--shadows-xs)"
  },
  "shadows.sm": {
    "value": "var(--shadows-sm)",
    "variable": "var(--shadows-sm)"
  },
  "shadows.md": {
    "value": "var(--shadows-md)",
    "variable": "var(--shadows-md)"
  },
  "shadows.lg": {
    "value": "var(--shadows-lg)",
    "variable": "var(--shadows-lg)"
  },
  "shadows.xl": {
    "value": "var(--shadows-xl)",
    "variable": "var(--shadows-xl)"
  },
  "shadows.2xl": {
    "value": "var(--shadows-2xl)",
    "variable": "var(--shadows-2xl)"
  },
  "shadows.inset-2xs": {
    "value": "inset 0 1px rgb(0 0 0 / 0.05)",
    "variable": "var(--shadows-inset-2xs)"
  },
  "shadows.inset-xs": {
    "value": "inset 0 1px 1px rgb(0 0 0 / 0.05)",
    "variable": "var(--shadows-inset-xs)"
  },
  "shadows.inset-sm": {
    "value": "inset 0 2px 4px rgb(0 0 0 / 0.05)",
    "variable": "var(--shadows-inset-sm)"
  },
  "blurs.xs": {
    "value": "4px",
    "variable": "var(--blurs-xs)"
  },
  "blurs.sm": {
    "value": "8px",
    "variable": "var(--blurs-sm)"
  },
  "blurs.md": {
    "value": "12px",
    "variable": "var(--blurs-md)"
  },
  "blurs.lg": {
    "value": "16px",
    "variable": "var(--blurs-lg)"
  },
  "blurs.xl": {
    "value": "24px",
    "variable": "var(--blurs-xl)"
  },
  "blurs.2xl": {
    "value": "40px",
    "variable": "var(--blurs-2xl)"
  },
  "blurs.3xl": {
    "value": "64px",
    "variable": "var(--blurs-3xl)"
  },
  "spacing.0": {
    "value": "0rem",
    "variable": "var(--spacing-0)"
  },
  "spacing.1": {
    "value": "0.25rem",
    "variable": "var(--spacing-1)"
  },
  "spacing.2": {
    "value": "0.5rem",
    "variable": "var(--spacing-2)"
  },
  "spacing.3": {
    "value": "0.75rem",
    "variable": "var(--spacing-3)"
  },
  "spacing.4": {
    "value": "1rem",
    "variable": "var(--spacing-4)"
  },
  "spacing.5": {
    "value": "1.25rem",
    "variable": "var(--spacing-5)"
  },
  "spacing.6": {
    "value": "1.5rem",
    "variable": "var(--spacing-6)"
  },
  "spacing.7": {
    "value": "1.75rem",
    "variable": "var(--spacing-7)"
  },
  "spacing.8": {
    "value": "2rem",
    "variable": "var(--spacing-8)"
  },
  "spacing.9": {
    "value": "2.25rem",
    "variable": "var(--spacing-9)"
  },
  "spacing.10": {
    "value": "2.5rem",
    "variable": "var(--spacing-10)"
  },
  "spacing.11": {
    "value": "2.75rem",
    "variable": "var(--spacing-11)"
  },
  "spacing.12": {
    "value": "3rem",
    "variable": "var(--spacing-12)"
  },
  "spacing.14": {
    "value": "3.5rem",
    "variable": "var(--spacing-14)"
  },
  "spacing.16": {
    "value": "4rem",
    "variable": "var(--spacing-16)"
  },
  "spacing.20": {
    "value": "5rem",
    "variable": "var(--spacing-20)"
  },
  "spacing.24": {
    "value": "6rem",
    "variable": "var(--spacing-24)"
  },
  "spacing.28": {
    "value": "7rem",
    "variable": "var(--spacing-28)"
  },
  "spacing.32": {
    "value": "8rem",
    "variable": "var(--spacing-32)"
  },
  "spacing.36": {
    "value": "9rem",
    "variable": "var(--spacing-36)"
  },
  "spacing.40": {
    "value": "10rem",
    "variable": "var(--spacing-40)"
  },
  "spacing.44": {
    "value": "11rem",
    "variable": "var(--spacing-44)"
  },
  "spacing.48": {
    "value": "12rem",
    "variable": "var(--spacing-48)"
  },
  "spacing.52": {
    "value": "13rem",
    "variable": "var(--spacing-52)"
  },
  "spacing.56": {
    "value": "14rem",
    "variable": "var(--spacing-56)"
  },
  "spacing.60": {
    "value": "15rem",
    "variable": "var(--spacing-60)"
  },
  "spacing.64": {
    "value": "16rem",
    "variable": "var(--spacing-64)"
  },
  "spacing.72": {
    "value": "18rem",
    "variable": "var(--spacing-72)"
  },
  "spacing.80": {
    "value": "20rem",
    "variable": "var(--spacing-80)"
  },
  "spacing.96": {
    "value": "24rem",
    "variable": "var(--spacing-96)"
  },
  "spacing.0.5": {
    "value": "0.125rem",
    "variable": "var(--spacing-0\\.5)"
  },
  "spacing.1.5": {
    "value": "0.375rem",
    "variable": "var(--spacing-1\\.5)"
  },
  "spacing.2.5": {
    "value": "0.625rem",
    "variable": "var(--spacing-2\\.5)"
  },
  "spacing.3.5": {
    "value": "0.875rem",
    "variable": "var(--spacing-3\\.5)"
  },
  "spacing.4.5": {
    "value": "1.125rem",
    "variable": "var(--spacing-4\\.5)"
  },
  "spacing.5.5": {
    "value": "1.375rem",
    "variable": "var(--spacing-5\\.5)"
  },
  "sizes.0": {
    "value": "0rem",
    "variable": "var(--sizes-0)"
  },
  "sizes.1": {
    "value": "0.25rem",
    "variable": "var(--sizes-1)"
  },
  "sizes.2": {
    "value": "0.5rem",
    "variable": "var(--sizes-2)"
  },
  "sizes.3": {
    "value": "0.75rem",
    "variable": "var(--sizes-3)"
  },
  "sizes.4": {
    "value": "1rem",
    "variable": "var(--sizes-4)"
  },
  "sizes.5": {
    "value": "1.25rem",
    "variable": "var(--sizes-5)"
  },
  "sizes.6": {
    "value": "1.5rem",
    "variable": "var(--sizes-6)"
  },
  "sizes.7": {
    "value": "1.75rem",
    "variable": "var(--sizes-7)"
  },
  "sizes.8": {
    "value": "2rem",
    "variable": "var(--sizes-8)"
  },
  "sizes.9": {
    "value": "2.25rem",
    "variable": "var(--sizes-9)"
  },
  "sizes.10": {
    "value": "2.5rem",
    "variable": "var(--sizes-10)"
  },
  "sizes.11": {
    "value": "2.75rem",
    "variable": "var(--sizes-11)"
  },
  "sizes.12": {
    "value": "3rem",
    "variable": "var(--sizes-12)"
  },
  "sizes.14": {
    "value": "3.5rem",
    "variable": "var(--sizes-14)"
  },
  "sizes.16": {
    "value": "4rem",
    "variable": "var(--sizes-16)"
  },
  "sizes.20": {
    "value": "5rem",
    "variable": "var(--sizes-20)"
  },
  "sizes.24": {
    "value": "6rem",
    "variable": "var(--sizes-24)"
  },
  "sizes.28": {
    "value": "7rem",
    "variable": "var(--sizes-28)"
  },
  "sizes.32": {
    "value": "8rem",
    "variable": "var(--sizes-32)"
  },
  "sizes.36": {
    "value": "9rem",
    "variable": "var(--sizes-36)"
  },
  "sizes.40": {
    "value": "10rem",
    "variable": "var(--sizes-40)"
  },
  "sizes.44": {
    "value": "11rem",
    "variable": "var(--sizes-44)"
  },
  "sizes.48": {
    "value": "12rem",
    "variable": "var(--sizes-48)"
  },
  "sizes.52": {
    "value": "13rem",
    "variable": "var(--sizes-52)"
  },
  "sizes.56": {
    "value": "14rem",
    "variable": "var(--sizes-56)"
  },
  "sizes.60": {
    "value": "15rem",
    "variable": "var(--sizes-60)"
  },
  "sizes.64": {
    "value": "16rem",
    "variable": "var(--sizes-64)"
  },
  "sizes.72": {
    "value": "18rem",
    "variable": "var(--sizes-72)"
  },
  "sizes.80": {
    "value": "20rem",
    "variable": "var(--sizes-80)"
  },
  "sizes.96": {
    "value": "24rem",
    "variable": "var(--sizes-96)"
  },
  "sizes.0.5": {
    "value": "0.125rem",
    "variable": "var(--sizes-0\\.5)"
  },
  "sizes.1.5": {
    "value": "0.375rem",
    "variable": "var(--sizes-1\\.5)"
  },
  "sizes.2.5": {
    "value": "0.625rem",
    "variable": "var(--sizes-2\\.5)"
  },
  "sizes.3.5": {
    "value": "0.875rem",
    "variable": "var(--sizes-3\\.5)"
  },
  "sizes.4.5": {
    "value": "1.125rem",
    "variable": "var(--sizes-4\\.5)"
  },
  "sizes.5.5": {
    "value": "1.375rem",
    "variable": "var(--sizes-5\\.5)"
  },
  "sizes.xs": {
    "value": "20rem",
    "variable": "var(--sizes-xs)"
  },
  "sizes.sm": {
    "value": "24rem",
    "variable": "var(--sizes-sm)"
  },
  "sizes.md": {
    "value": "28rem",
    "variable": "var(--sizes-md)"
  },
  "sizes.lg": {
    "value": "32rem",
    "variable": "var(--sizes-lg)"
  },
  "sizes.xl": {
    "value": "36rem",
    "variable": "var(--sizes-xl)"
  },
  "sizes.2xl": {
    "value": "42rem",
    "variable": "var(--sizes-2xl)"
  },
  "sizes.3xl": {
    "value": "48rem",
    "variable": "var(--sizes-3xl)"
  },
  "sizes.4xl": {
    "value": "56rem",
    "variable": "var(--sizes-4xl)"
  },
  "sizes.5xl": {
    "value": "64rem",
    "variable": "var(--sizes-5xl)"
  },
  "sizes.6xl": {
    "value": "72rem",
    "variable": "var(--sizes-6xl)"
  },
  "sizes.7xl": {
    "value": "80rem",
    "variable": "var(--sizes-7xl)"
  },
  "sizes.8xl": {
    "value": "90rem",
    "variable": "var(--sizes-8xl)"
  },
  "sizes.prose": {
    "value": "65ch",
    "variable": "var(--sizes-prose)"
  },
  "sizes.full": {
    "value": "100%",
    "variable": "var(--sizes-full)"
  },
  "sizes.min": {
    "value": "min-content",
    "variable": "var(--sizes-min)"
  },
  "sizes.max": {
    "value": "max-content",
    "variable": "var(--sizes-max)"
  },
  "sizes.fit": {
    "value": "fit-content",
    "variable": "var(--sizes-fit)"
  },
  "sizes.breakpoint-sm": {
    "value": "640px",
    "variable": "var(--sizes-breakpoint-sm)"
  },
  "sizes.breakpoint-md": {
    "value": "768px",
    "variable": "var(--sizes-breakpoint-md)"
  },
  "sizes.breakpoint-lg": {
    "value": "1024px",
    "variable": "var(--sizes-breakpoint-lg)"
  },
  "sizes.breakpoint-xl": {
    "value": "1280px",
    "variable": "var(--sizes-breakpoint-xl)"
  },
  "sizes.breakpoint-2xl": {
    "value": "1536px",
    "variable": "var(--sizes-breakpoint-2xl)"
  },
  "animations.spin": {
    "value": "spin 1s linear infinite",
    "variable": "var(--animations-spin)"
  },
  "animations.ping": {
    "value": "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
    "variable": "var(--animations-ping)"
  },
  "animations.pulse": {
    "value": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "variable": "var(--animations-pulse)"
  },
  "animations.bounce": {
    "value": "bounce 1s infinite",
    "variable": "var(--animations-bounce)"
  },
  "colors.black": {
    "value": "#000000",
    "variable": "var(--colors-black)"
  },
  "colors.black.a1": {
    "value": "rgba(0, 0, 0, 0.05)",
    "variable": "var(--colors-black-a1)"
  },
  "colors.black.a2": {
    "value": "rgba(0, 0, 0, 0.1)",
    "variable": "var(--colors-black-a2)"
  },
  "colors.black.a3": {
    "value": "rgba(0, 0, 0, 0.15)",
    "variable": "var(--colors-black-a3)"
  },
  "colors.black.a4": {
    "value": "rgba(0, 0, 0, 0.2)",
    "variable": "var(--colors-black-a4)"
  },
  "colors.black.a5": {
    "value": "rgba(0, 0, 0, 0.3)",
    "variable": "var(--colors-black-a5)"
  },
  "colors.black.a6": {
    "value": "rgba(0, 0, 0, 0.4)",
    "variable": "var(--colors-black-a6)"
  },
  "colors.black.a7": {
    "value": "rgba(0, 0, 0, 0.5)",
    "variable": "var(--colors-black-a7)"
  },
  "colors.black.a8": {
    "value": "rgba(0, 0, 0, 0.6)",
    "variable": "var(--colors-black-a8)"
  },
  "colors.black.a9": {
    "value": "rgba(0, 0, 0, 0.7)",
    "variable": "var(--colors-black-a9)"
  },
  "colors.black.a10": {
    "value": "rgba(0, 0, 0, 0.8)",
    "variable": "var(--colors-black-a10)"
  },
  "colors.black.a11": {
    "value": "rgba(0, 0, 0, 0.9)",
    "variable": "var(--colors-black-a11)"
  },
  "colors.black.a12": {
    "value": "rgba(0, 0, 0, 0.95)",
    "variable": "var(--colors-black-a12)"
  },
  "colors.white": {
    "value": "#ffffff",
    "variable": "var(--colors-white)"
  },
  "colors.white.a1": {
    "value": "rgba(255, 255, 255, 0.05)",
    "variable": "var(--colors-white-a1)"
  },
  "colors.white.a2": {
    "value": "rgba(255, 255, 255, 0.1)",
    "variable": "var(--colors-white-a2)"
  },
  "colors.white.a3": {
    "value": "rgba(255, 255, 255, 0.15)",
    "variable": "var(--colors-white-a3)"
  },
  "colors.white.a4": {
    "value": "rgba(255, 255, 255, 0.2)",
    "variable": "var(--colors-white-a4)"
  },
  "colors.white.a5": {
    "value": "rgba(255, 255, 255, 0.3)",
    "variable": "var(--colors-white-a5)"
  },
  "colors.white.a6": {
    "value": "rgba(255, 255, 255, 0.4)",
    "variable": "var(--colors-white-a6)"
  },
  "colors.white.a7": {
    "value": "rgba(255, 255, 255, 0.5)",
    "variable": "var(--colors-white-a7)"
  },
  "colors.white.a8": {
    "value": "rgba(255, 255, 255, 0.6)",
    "variable": "var(--colors-white-a8)"
  },
  "colors.white.a9": {
    "value": "rgba(255, 255, 255, 0.7)",
    "variable": "var(--colors-white-a9)"
  },
  "colors.white.a10": {
    "value": "rgba(255, 255, 255, 0.8)",
    "variable": "var(--colors-white-a10)"
  },
  "colors.white.a11": {
    "value": "rgba(255, 255, 255, 0.9)",
    "variable": "var(--colors-white-a11)"
  },
  "colors.white.a12": {
    "value": "rgba(255, 255, 255, 0.95)",
    "variable": "var(--colors-white-a12)"
  },
  "durations.fastest": {
    "value": "50ms",
    "variable": "var(--durations-fastest)"
  },
  "durations.faster": {
    "value": "100ms",
    "variable": "var(--durations-faster)"
  },
  "durations.fast": {
    "value": "150ms",
    "variable": "var(--durations-fast)"
  },
  "durations.normal": {
    "value": "200ms",
    "variable": "var(--durations-normal)"
  },
  "durations.slow": {
    "value": "250ms",
    "variable": "var(--durations-slow)"
  },
  "durations.slower": {
    "value": "300ms",
    "variable": "var(--durations-slower)"
  },
  "durations.slowest": {
    "value": "400ms",
    "variable": "var(--durations-slowest)"
  },
  "zIndex.hide": {
    "value": -1,
    "variable": "var(--z-index-hide)"
  },
  "zIndex.base": {
    "value": 0,
    "variable": "var(--z-index-base)"
  },
  "zIndex.docked": {
    "value": 10,
    "variable": "var(--z-index-docked)"
  },
  "zIndex.dropdown": {
    "value": 1000,
    "variable": "var(--z-index-dropdown)"
  },
  "zIndex.sticky": {
    "value": 1100,
    "variable": "var(--z-index-sticky)"
  },
  "zIndex.banner": {
    "value": 1200,
    "variable": "var(--z-index-banner)"
  },
  "zIndex.overlay": {
    "value": 1300,
    "variable": "var(--z-index-overlay)"
  },
  "zIndex.modal": {
    "value": 1400,
    "variable": "var(--z-index-modal)"
  },
  "zIndex.popover": {
    "value": 1500,
    "variable": "var(--z-index-popover)"
  },
  "zIndex.skipLink": {
    "value": 1600,
    "variable": "var(--z-index-skip-link)"
  },
  "zIndex.toast": {
    "value": 1700,
    "variable": "var(--z-index-toast)"
  },
  "zIndex.tooltip": {
    "value": 1800,
    "variable": "var(--z-index-tooltip)"
  },
  "breakpoints.sm": {
    "value": "640px",
    "variable": "var(--breakpoints-sm)"
  },
  "breakpoints.md": {
    "value": "768px",
    "variable": "var(--breakpoints-md)"
  },
  "breakpoints.lg": {
    "value": "1024px",
    "variable": "var(--breakpoints-lg)"
  },
  "breakpoints.xl": {
    "value": "1280px",
    "variable": "var(--breakpoints-xl)"
  },
  "breakpoints.2xl": {
    "value": "1536px",
    "variable": "var(--breakpoints-2xl)"
  },
  "radii.l1": {
    "value": "var(--radii-xs)",
    "variable": "var(--radii-l1)"
  },
  "radii.l2": {
    "value": "var(--radii-sm)",
    "variable": "var(--radii-l2)"
  },
  "radii.l3": {
    "value": "var(--radii-md)",
    "variable": "var(--radii-l3)"
  },
  "spacing.-1": {
    "value": "calc(var(--spacing-1) * -1)",
    "variable": "var(--spacing-1)"
  },
  "spacing.-2": {
    "value": "calc(var(--spacing-2) * -1)",
    "variable": "var(--spacing-2)"
  },
  "spacing.-3": {
    "value": "calc(var(--spacing-3) * -1)",
    "variable": "var(--spacing-3)"
  },
  "spacing.-4": {
    "value": "calc(var(--spacing-4) * -1)",
    "variable": "var(--spacing-4)"
  },
  "spacing.-5": {
    "value": "calc(var(--spacing-5) * -1)",
    "variable": "var(--spacing-5)"
  },
  "spacing.-6": {
    "value": "calc(var(--spacing-6) * -1)",
    "variable": "var(--spacing-6)"
  },
  "spacing.-7": {
    "value": "calc(var(--spacing-7) * -1)",
    "variable": "var(--spacing-7)"
  },
  "spacing.-8": {
    "value": "calc(var(--spacing-8) * -1)",
    "variable": "var(--spacing-8)"
  },
  "spacing.-9": {
    "value": "calc(var(--spacing-9) * -1)",
    "variable": "var(--spacing-9)"
  },
  "spacing.-10": {
    "value": "calc(var(--spacing-10) * -1)",
    "variable": "var(--spacing-10)"
  },
  "spacing.-11": {
    "value": "calc(var(--spacing-11) * -1)",
    "variable": "var(--spacing-11)"
  },
  "spacing.-12": {
    "value": "calc(var(--spacing-12) * -1)",
    "variable": "var(--spacing-12)"
  },
  "spacing.-14": {
    "value": "calc(var(--spacing-14) * -1)",
    "variable": "var(--spacing-14)"
  },
  "spacing.-16": {
    "value": "calc(var(--spacing-16) * -1)",
    "variable": "var(--spacing-16)"
  },
  "spacing.-20": {
    "value": "calc(var(--spacing-20) * -1)",
    "variable": "var(--spacing-20)"
  },
  "spacing.-24": {
    "value": "calc(var(--spacing-24) * -1)",
    "variable": "var(--spacing-24)"
  },
  "spacing.-28": {
    "value": "calc(var(--spacing-28) * -1)",
    "variable": "var(--spacing-28)"
  },
  "spacing.-32": {
    "value": "calc(var(--spacing-32) * -1)",
    "variable": "var(--spacing-32)"
  },
  "spacing.-36": {
    "value": "calc(var(--spacing-36) * -1)",
    "variable": "var(--spacing-36)"
  },
  "spacing.-40": {
    "value": "calc(var(--spacing-40) * -1)",
    "variable": "var(--spacing-40)"
  },
  "spacing.-44": {
    "value": "calc(var(--spacing-44) * -1)",
    "variable": "var(--spacing-44)"
  },
  "spacing.-48": {
    "value": "calc(var(--spacing-48) * -1)",
    "variable": "var(--spacing-48)"
  },
  "spacing.-52": {
    "value": "calc(var(--spacing-52) * -1)",
    "variable": "var(--spacing-52)"
  },
  "spacing.-56": {
    "value": "calc(var(--spacing-56) * -1)",
    "variable": "var(--spacing-56)"
  },
  "spacing.-60": {
    "value": "calc(var(--spacing-60) * -1)",
    "variable": "var(--spacing-60)"
  },
  "spacing.-64": {
    "value": "calc(var(--spacing-64) * -1)",
    "variable": "var(--spacing-64)"
  },
  "spacing.-72": {
    "value": "calc(var(--spacing-72) * -1)",
    "variable": "var(--spacing-72)"
  },
  "spacing.-80": {
    "value": "calc(var(--spacing-80) * -1)",
    "variable": "var(--spacing-80)"
  },
  "spacing.-96": {
    "value": "calc(var(--spacing-96) * -1)",
    "variable": "var(--spacing-96)"
  },
  "spacing.-0.5": {
    "value": "calc(var(--spacing-0\\.5) * -1)",
    "variable": "var(--spacing-0\\.5)"
  },
  "spacing.-1.5": {
    "value": "calc(var(--spacing-1\\.5) * -1)",
    "variable": "var(--spacing-1\\.5)"
  },
  "spacing.-2.5": {
    "value": "calc(var(--spacing-2\\.5) * -1)",
    "variable": "var(--spacing-2\\.5)"
  },
  "spacing.-3.5": {
    "value": "calc(var(--spacing-3\\.5) * -1)",
    "variable": "var(--spacing-3\\.5)"
  },
  "spacing.-4.5": {
    "value": "calc(var(--spacing-4\\.5) * -1)",
    "variable": "var(--spacing-4\\.5)"
  },
  "spacing.-5.5": {
    "value": "calc(var(--spacing-5\\.5) * -1)",
    "variable": "var(--spacing-5\\.5)"
  },
  "colors.amber.1": {
    "value": "var(--colors-amber-1)",
    "variable": "var(--colors-amber-1)"
  },
  "colors.amber.2": {
    "value": "var(--colors-amber-2)",
    "variable": "var(--colors-amber-2)"
  },
  "colors.amber.3": {
    "value": "var(--colors-amber-3)",
    "variable": "var(--colors-amber-3)"
  },
  "colors.amber.4": {
    "value": "var(--colors-amber-4)",
    "variable": "var(--colors-amber-4)"
  },
  "colors.amber.5": {
    "value": "var(--colors-amber-5)",
    "variable": "var(--colors-amber-5)"
  },
  "colors.amber.6": {
    "value": "var(--colors-amber-6)",
    "variable": "var(--colors-amber-6)"
  },
  "colors.amber.7": {
    "value": "var(--colors-amber-7)",
    "variable": "var(--colors-amber-7)"
  },
  "colors.amber.8": {
    "value": "var(--colors-amber-8)",
    "variable": "var(--colors-amber-8)"
  },
  "colors.amber.9": {
    "value": "var(--colors-amber-9)",
    "variable": "var(--colors-amber-9)"
  },
  "colors.amber.10": {
    "value": "var(--colors-amber-10)",
    "variable": "var(--colors-amber-10)"
  },
  "colors.amber.11": {
    "value": "var(--colors-amber-11)",
    "variable": "var(--colors-amber-11)"
  },
  "colors.amber.12": {
    "value": "var(--colors-amber-12)",
    "variable": "var(--colors-amber-12)"
  },
  "colors.amber.a1": {
    "value": "var(--colors-amber-a1)",
    "variable": "var(--colors-amber-a1)"
  },
  "colors.amber.a2": {
    "value": "var(--colors-amber-a2)",
    "variable": "var(--colors-amber-a2)"
  },
  "colors.amber.a3": {
    "value": "var(--colors-amber-a3)",
    "variable": "var(--colors-amber-a3)"
  },
  "colors.amber.a4": {
    "value": "var(--colors-amber-a4)",
    "variable": "var(--colors-amber-a4)"
  },
  "colors.amber.a5": {
    "value": "var(--colors-amber-a5)",
    "variable": "var(--colors-amber-a5)"
  },
  "colors.amber.a6": {
    "value": "var(--colors-amber-a6)",
    "variable": "var(--colors-amber-a6)"
  },
  "colors.amber.a7": {
    "value": "var(--colors-amber-a7)",
    "variable": "var(--colors-amber-a7)"
  },
  "colors.amber.a8": {
    "value": "var(--colors-amber-a8)",
    "variable": "var(--colors-amber-a8)"
  },
  "colors.amber.a9": {
    "value": "var(--colors-amber-a9)",
    "variable": "var(--colors-amber-a9)"
  },
  "colors.amber.a10": {
    "value": "var(--colors-amber-a10)",
    "variable": "var(--colors-amber-a10)"
  },
  "colors.amber.a11": {
    "value": "var(--colors-amber-a11)",
    "variable": "var(--colors-amber-a11)"
  },
  "colors.amber.a12": {
    "value": "var(--colors-amber-a12)",
    "variable": "var(--colors-amber-a12)"
  },
  "colors.amber.solid.bg": {
    "value": "var(--colors-amber-solid-bg)",
    "variable": "var(--colors-amber-solid-bg)"
  },
  "colors.amber.solid.bg.hover": {
    "value": "var(--colors-amber-solid-bg-hover)",
    "variable": "var(--colors-amber-solid-bg-hover)"
  },
  "colors.amber.solid.fg": {
    "value": "var(--colors-amber-solid-fg)",
    "variable": "var(--colors-amber-solid-fg)"
  },
  "colors.amber.subtle.bg": {
    "value": "var(--colors-amber-subtle-bg)",
    "variable": "var(--colors-amber-subtle-bg)"
  },
  "colors.amber.subtle.bg.hover": {
    "value": "var(--colors-amber-subtle-bg-hover)",
    "variable": "var(--colors-amber-subtle-bg-hover)"
  },
  "colors.amber.subtle.bg.active": {
    "value": "var(--colors-amber-subtle-bg-active)",
    "variable": "var(--colors-amber-subtle-bg-active)"
  },
  "colors.amber.subtle.fg": {
    "value": "var(--colors-amber-subtle-fg)",
    "variable": "var(--colors-amber-subtle-fg)"
  },
  "colors.amber.surface.bg": {
    "value": "var(--colors-amber-surface-bg)",
    "variable": "var(--colors-amber-surface-bg)"
  },
  "colors.amber.surface.bg.active": {
    "value": "var(--colors-amber-surface-bg-active)",
    "variable": "var(--colors-amber-surface-bg-active)"
  },
  "colors.amber.surface.border": {
    "value": "var(--colors-amber-surface-border)",
    "variable": "var(--colors-amber-surface-border)"
  },
  "colors.amber.surface.border.hover": {
    "value": "var(--colors-amber-surface-border-hover)",
    "variable": "var(--colors-amber-surface-border-hover)"
  },
  "colors.amber.surface.fg": {
    "value": "var(--colors-amber-surface-fg)",
    "variable": "var(--colors-amber-surface-fg)"
  },
  "colors.amber.outline.bg.hover": {
    "value": "var(--colors-amber-outline-bg-hover)",
    "variable": "var(--colors-amber-outline-bg-hover)"
  },
  "colors.amber.outline.bg.active": {
    "value": "var(--colors-amber-outline-bg-active)",
    "variable": "var(--colors-amber-outline-bg-active)"
  },
  "colors.amber.outline.border": {
    "value": "var(--colors-amber-outline-border)",
    "variable": "var(--colors-amber-outline-border)"
  },
  "colors.amber.outline.fg": {
    "value": "var(--colors-amber-outline-fg)",
    "variable": "var(--colors-amber-outline-fg)"
  },
  "colors.amber.plain.bg.hover": {
    "value": "var(--colors-amber-plain-bg-hover)",
    "variable": "var(--colors-amber-plain-bg-hover)"
  },
  "colors.amber.plain.bg.active": {
    "value": "var(--colors-amber-plain-bg-active)",
    "variable": "var(--colors-amber-plain-bg-active)"
  },
  "colors.amber.plain.fg": {
    "value": "var(--colors-amber-plain-fg)",
    "variable": "var(--colors-amber-plain-fg)"
  },
  "colors.blue.1": {
    "value": "var(--colors-blue-1)",
    "variable": "var(--colors-blue-1)"
  },
  "colors.blue.2": {
    "value": "var(--colors-blue-2)",
    "variable": "var(--colors-blue-2)"
  },
  "colors.blue.3": {
    "value": "var(--colors-blue-3)",
    "variable": "var(--colors-blue-3)"
  },
  "colors.blue.4": {
    "value": "var(--colors-blue-4)",
    "variable": "var(--colors-blue-4)"
  },
  "colors.blue.5": {
    "value": "var(--colors-blue-5)",
    "variable": "var(--colors-blue-5)"
  },
  "colors.blue.6": {
    "value": "var(--colors-blue-6)",
    "variable": "var(--colors-blue-6)"
  },
  "colors.blue.7": {
    "value": "var(--colors-blue-7)",
    "variable": "var(--colors-blue-7)"
  },
  "colors.blue.8": {
    "value": "var(--colors-blue-8)",
    "variable": "var(--colors-blue-8)"
  },
  "colors.blue.9": {
    "value": "var(--colors-blue-9)",
    "variable": "var(--colors-blue-9)"
  },
  "colors.blue.10": {
    "value": "var(--colors-blue-10)",
    "variable": "var(--colors-blue-10)"
  },
  "colors.blue.11": {
    "value": "var(--colors-blue-11)",
    "variable": "var(--colors-blue-11)"
  },
  "colors.blue.12": {
    "value": "var(--colors-blue-12)",
    "variable": "var(--colors-blue-12)"
  },
  "colors.blue.a1": {
    "value": "var(--colors-blue-a1)",
    "variable": "var(--colors-blue-a1)"
  },
  "colors.blue.a2": {
    "value": "var(--colors-blue-a2)",
    "variable": "var(--colors-blue-a2)"
  },
  "colors.blue.a3": {
    "value": "var(--colors-blue-a3)",
    "variable": "var(--colors-blue-a3)"
  },
  "colors.blue.a4": {
    "value": "var(--colors-blue-a4)",
    "variable": "var(--colors-blue-a4)"
  },
  "colors.blue.a5": {
    "value": "var(--colors-blue-a5)",
    "variable": "var(--colors-blue-a5)"
  },
  "colors.blue.a6": {
    "value": "var(--colors-blue-a6)",
    "variable": "var(--colors-blue-a6)"
  },
  "colors.blue.a7": {
    "value": "var(--colors-blue-a7)",
    "variable": "var(--colors-blue-a7)"
  },
  "colors.blue.a8": {
    "value": "var(--colors-blue-a8)",
    "variable": "var(--colors-blue-a8)"
  },
  "colors.blue.a9": {
    "value": "var(--colors-blue-a9)",
    "variable": "var(--colors-blue-a9)"
  },
  "colors.blue.a10": {
    "value": "var(--colors-blue-a10)",
    "variable": "var(--colors-blue-a10)"
  },
  "colors.blue.a11": {
    "value": "var(--colors-blue-a11)",
    "variable": "var(--colors-blue-a11)"
  },
  "colors.blue.a12": {
    "value": "var(--colors-blue-a12)",
    "variable": "var(--colors-blue-a12)"
  },
  "colors.blue.solid.bg": {
    "value": "var(--colors-blue-solid-bg)",
    "variable": "var(--colors-blue-solid-bg)"
  },
  "colors.blue.solid.bg.hover": {
    "value": "var(--colors-blue-solid-bg-hover)",
    "variable": "var(--colors-blue-solid-bg-hover)"
  },
  "colors.blue.solid.fg": {
    "value": "var(--colors-blue-solid-fg)",
    "variable": "var(--colors-blue-solid-fg)"
  },
  "colors.blue.subtle.bg": {
    "value": "var(--colors-blue-subtle-bg)",
    "variable": "var(--colors-blue-subtle-bg)"
  },
  "colors.blue.subtle.bg.hover": {
    "value": "var(--colors-blue-subtle-bg-hover)",
    "variable": "var(--colors-blue-subtle-bg-hover)"
  },
  "colors.blue.subtle.bg.active": {
    "value": "var(--colors-blue-subtle-bg-active)",
    "variable": "var(--colors-blue-subtle-bg-active)"
  },
  "colors.blue.subtle.fg": {
    "value": "var(--colors-blue-subtle-fg)",
    "variable": "var(--colors-blue-subtle-fg)"
  },
  "colors.blue.surface.bg": {
    "value": "var(--colors-blue-surface-bg)",
    "variable": "var(--colors-blue-surface-bg)"
  },
  "colors.blue.surface.bg.active": {
    "value": "var(--colors-blue-surface-bg-active)",
    "variable": "var(--colors-blue-surface-bg-active)"
  },
  "colors.blue.surface.border": {
    "value": "var(--colors-blue-surface-border)",
    "variable": "var(--colors-blue-surface-border)"
  },
  "colors.blue.surface.border.hover": {
    "value": "var(--colors-blue-surface-border-hover)",
    "variable": "var(--colors-blue-surface-border-hover)"
  },
  "colors.blue.surface.fg": {
    "value": "var(--colors-blue-surface-fg)",
    "variable": "var(--colors-blue-surface-fg)"
  },
  "colors.blue.outline.bg.hover": {
    "value": "var(--colors-blue-outline-bg-hover)",
    "variable": "var(--colors-blue-outline-bg-hover)"
  },
  "colors.blue.outline.bg.active": {
    "value": "var(--colors-blue-outline-bg-active)",
    "variable": "var(--colors-blue-outline-bg-active)"
  },
  "colors.blue.outline.border": {
    "value": "var(--colors-blue-outline-border)",
    "variable": "var(--colors-blue-outline-border)"
  },
  "colors.blue.outline.fg": {
    "value": "var(--colors-blue-outline-fg)",
    "variable": "var(--colors-blue-outline-fg)"
  },
  "colors.blue.plain.bg.hover": {
    "value": "var(--colors-blue-plain-bg-hover)",
    "variable": "var(--colors-blue-plain-bg-hover)"
  },
  "colors.blue.plain.bg.active": {
    "value": "var(--colors-blue-plain-bg-active)",
    "variable": "var(--colors-blue-plain-bg-active)"
  },
  "colors.blue.plain.fg": {
    "value": "var(--colors-blue-plain-fg)",
    "variable": "var(--colors-blue-plain-fg)"
  },
  "colors.green.1": {
    "value": "var(--colors-green-1)",
    "variable": "var(--colors-green-1)"
  },
  "colors.green.2": {
    "value": "var(--colors-green-2)",
    "variable": "var(--colors-green-2)"
  },
  "colors.green.3": {
    "value": "var(--colors-green-3)",
    "variable": "var(--colors-green-3)"
  },
  "colors.green.4": {
    "value": "var(--colors-green-4)",
    "variable": "var(--colors-green-4)"
  },
  "colors.green.5": {
    "value": "var(--colors-green-5)",
    "variable": "var(--colors-green-5)"
  },
  "colors.green.6": {
    "value": "var(--colors-green-6)",
    "variable": "var(--colors-green-6)"
  },
  "colors.green.7": {
    "value": "var(--colors-green-7)",
    "variable": "var(--colors-green-7)"
  },
  "colors.green.8": {
    "value": "var(--colors-green-8)",
    "variable": "var(--colors-green-8)"
  },
  "colors.green.9": {
    "value": "var(--colors-green-9)",
    "variable": "var(--colors-green-9)"
  },
  "colors.green.10": {
    "value": "var(--colors-green-10)",
    "variable": "var(--colors-green-10)"
  },
  "colors.green.11": {
    "value": "var(--colors-green-11)",
    "variable": "var(--colors-green-11)"
  },
  "colors.green.12": {
    "value": "var(--colors-green-12)",
    "variable": "var(--colors-green-12)"
  },
  "colors.green.a1": {
    "value": "var(--colors-green-a1)",
    "variable": "var(--colors-green-a1)"
  },
  "colors.green.a2": {
    "value": "var(--colors-green-a2)",
    "variable": "var(--colors-green-a2)"
  },
  "colors.green.a3": {
    "value": "var(--colors-green-a3)",
    "variable": "var(--colors-green-a3)"
  },
  "colors.green.a4": {
    "value": "var(--colors-green-a4)",
    "variable": "var(--colors-green-a4)"
  },
  "colors.green.a5": {
    "value": "var(--colors-green-a5)",
    "variable": "var(--colors-green-a5)"
  },
  "colors.green.a6": {
    "value": "var(--colors-green-a6)",
    "variable": "var(--colors-green-a6)"
  },
  "colors.green.a7": {
    "value": "var(--colors-green-a7)",
    "variable": "var(--colors-green-a7)"
  },
  "colors.green.a8": {
    "value": "var(--colors-green-a8)",
    "variable": "var(--colors-green-a8)"
  },
  "colors.green.a9": {
    "value": "var(--colors-green-a9)",
    "variable": "var(--colors-green-a9)"
  },
  "colors.green.a10": {
    "value": "var(--colors-green-a10)",
    "variable": "var(--colors-green-a10)"
  },
  "colors.green.a11": {
    "value": "var(--colors-green-a11)",
    "variable": "var(--colors-green-a11)"
  },
  "colors.green.a12": {
    "value": "var(--colors-green-a12)",
    "variable": "var(--colors-green-a12)"
  },
  "colors.green.solid.bg": {
    "value": "var(--colors-green-solid-bg)",
    "variable": "var(--colors-green-solid-bg)"
  },
  "colors.green.solid.bg.hover": {
    "value": "var(--colors-green-solid-bg-hover)",
    "variable": "var(--colors-green-solid-bg-hover)"
  },
  "colors.green.solid.fg": {
    "value": "var(--colors-green-solid-fg)",
    "variable": "var(--colors-green-solid-fg)"
  },
  "colors.green.subtle.bg": {
    "value": "var(--colors-green-subtle-bg)",
    "variable": "var(--colors-green-subtle-bg)"
  },
  "colors.green.subtle.bg.hover": {
    "value": "var(--colors-green-subtle-bg-hover)",
    "variable": "var(--colors-green-subtle-bg-hover)"
  },
  "colors.green.subtle.bg.active": {
    "value": "var(--colors-green-subtle-bg-active)",
    "variable": "var(--colors-green-subtle-bg-active)"
  },
  "colors.green.subtle.fg": {
    "value": "var(--colors-green-subtle-fg)",
    "variable": "var(--colors-green-subtle-fg)"
  },
  "colors.green.surface.bg": {
    "value": "var(--colors-green-surface-bg)",
    "variable": "var(--colors-green-surface-bg)"
  },
  "colors.green.surface.bg.active": {
    "value": "var(--colors-green-surface-bg-active)",
    "variable": "var(--colors-green-surface-bg-active)"
  },
  "colors.green.surface.border": {
    "value": "var(--colors-green-surface-border)",
    "variable": "var(--colors-green-surface-border)"
  },
  "colors.green.surface.border.hover": {
    "value": "var(--colors-green-surface-border-hover)",
    "variable": "var(--colors-green-surface-border-hover)"
  },
  "colors.green.surface.fg": {
    "value": "var(--colors-green-surface-fg)",
    "variable": "var(--colors-green-surface-fg)"
  },
  "colors.green.outline.bg.hover": {
    "value": "var(--colors-green-outline-bg-hover)",
    "variable": "var(--colors-green-outline-bg-hover)"
  },
  "colors.green.outline.bg.active": {
    "value": "var(--colors-green-outline-bg-active)",
    "variable": "var(--colors-green-outline-bg-active)"
  },
  "colors.green.outline.border": {
    "value": "var(--colors-green-outline-border)",
    "variable": "var(--colors-green-outline-border)"
  },
  "colors.green.outline.fg": {
    "value": "var(--colors-green-outline-fg)",
    "variable": "var(--colors-green-outline-fg)"
  },
  "colors.green.plain.bg.hover": {
    "value": "var(--colors-green-plain-bg-hover)",
    "variable": "var(--colors-green-plain-bg-hover)"
  },
  "colors.green.plain.bg.active": {
    "value": "var(--colors-green-plain-bg-active)",
    "variable": "var(--colors-green-plain-bg-active)"
  },
  "colors.green.plain.fg": {
    "value": "var(--colors-green-plain-fg)",
    "variable": "var(--colors-green-plain-fg)"
  },
  "colors.neutral.1": {
    "value": "var(--colors-neutral-1)",
    "variable": "var(--colors-neutral-1)"
  },
  "colors.neutral.2": {
    "value": "var(--colors-neutral-2)",
    "variable": "var(--colors-neutral-2)"
  },
  "colors.neutral.3": {
    "value": "var(--colors-neutral-3)",
    "variable": "var(--colors-neutral-3)"
  },
  "colors.neutral.4": {
    "value": "var(--colors-neutral-4)",
    "variable": "var(--colors-neutral-4)"
  },
  "colors.neutral.5": {
    "value": "var(--colors-neutral-5)",
    "variable": "var(--colors-neutral-5)"
  },
  "colors.neutral.6": {
    "value": "var(--colors-neutral-6)",
    "variable": "var(--colors-neutral-6)"
  },
  "colors.neutral.7": {
    "value": "var(--colors-neutral-7)",
    "variable": "var(--colors-neutral-7)"
  },
  "colors.neutral.8": {
    "value": "var(--colors-neutral-8)",
    "variable": "var(--colors-neutral-8)"
  },
  "colors.neutral.9": {
    "value": "var(--colors-neutral-9)",
    "variable": "var(--colors-neutral-9)"
  },
  "colors.neutral.10": {
    "value": "var(--colors-neutral-10)",
    "variable": "var(--colors-neutral-10)"
  },
  "colors.neutral.11": {
    "value": "var(--colors-neutral-11)",
    "variable": "var(--colors-neutral-11)"
  },
  "colors.neutral.12": {
    "value": "var(--colors-neutral-12)",
    "variable": "var(--colors-neutral-12)"
  },
  "colors.neutral.a1": {
    "value": "var(--colors-neutral-a1)",
    "variable": "var(--colors-neutral-a1)"
  },
  "colors.neutral.a2": {
    "value": "var(--colors-neutral-a2)",
    "variable": "var(--colors-neutral-a2)"
  },
  "colors.neutral.a3": {
    "value": "var(--colors-neutral-a3)",
    "variable": "var(--colors-neutral-a3)"
  },
  "colors.neutral.a4": {
    "value": "var(--colors-neutral-a4)",
    "variable": "var(--colors-neutral-a4)"
  },
  "colors.neutral.a5": {
    "value": "var(--colors-neutral-a5)",
    "variable": "var(--colors-neutral-a5)"
  },
  "colors.neutral.a6": {
    "value": "var(--colors-neutral-a6)",
    "variable": "var(--colors-neutral-a6)"
  },
  "colors.neutral.a7": {
    "value": "var(--colors-neutral-a7)",
    "variable": "var(--colors-neutral-a7)"
  },
  "colors.neutral.a8": {
    "value": "var(--colors-neutral-a8)",
    "variable": "var(--colors-neutral-a8)"
  },
  "colors.neutral.a9": {
    "value": "var(--colors-neutral-a9)",
    "variable": "var(--colors-neutral-a9)"
  },
  "colors.neutral.a10": {
    "value": "var(--colors-neutral-a10)",
    "variable": "var(--colors-neutral-a10)"
  },
  "colors.neutral.a11": {
    "value": "var(--colors-neutral-a11)",
    "variable": "var(--colors-neutral-a11)"
  },
  "colors.neutral.a12": {
    "value": "var(--colors-neutral-a12)",
    "variable": "var(--colors-neutral-a12)"
  },
  "colors.neutral.solid.bg": {
    "value": "var(--colors-neutral-solid-bg)",
    "variable": "var(--colors-neutral-solid-bg)"
  },
  "colors.neutral.solid.bg.hover": {
    "value": "var(--colors-neutral-solid-bg-hover)",
    "variable": "var(--colors-neutral-solid-bg-hover)"
  },
  "colors.neutral.solid.fg": {
    "value": "var(--colors-neutral-solid-fg)",
    "variable": "var(--colors-neutral-solid-fg)"
  },
  "colors.neutral.subtle.bg": {
    "value": "var(--colors-neutral-subtle-bg)",
    "variable": "var(--colors-neutral-subtle-bg)"
  },
  "colors.neutral.subtle.bg.hover": {
    "value": "var(--colors-neutral-subtle-bg-hover)",
    "variable": "var(--colors-neutral-subtle-bg-hover)"
  },
  "colors.neutral.subtle.bg.active": {
    "value": "var(--colors-neutral-subtle-bg-active)",
    "variable": "var(--colors-neutral-subtle-bg-active)"
  },
  "colors.neutral.subtle.fg": {
    "value": "var(--colors-neutral-subtle-fg)",
    "variable": "var(--colors-neutral-subtle-fg)"
  },
  "colors.neutral.surface.bg": {
    "value": "var(--colors-neutral-surface-bg)",
    "variable": "var(--colors-neutral-surface-bg)"
  },
  "colors.neutral.surface.bg.hover": {
    "value": "var(--colors-neutral-surface-bg-hover)",
    "variable": "var(--colors-neutral-surface-bg-hover)"
  },
  "colors.neutral.surface.bg.active": {
    "value": "var(--colors-neutral-surface-bg-active)",
    "variable": "var(--colors-neutral-surface-bg-active)"
  },
  "colors.neutral.surface.border": {
    "value": "var(--colors-neutral-surface-border)",
    "variable": "var(--colors-neutral-surface-border)"
  },
  "colors.neutral.surface.border.hover": {
    "value": "var(--colors-neutral-surface-border-hover)",
    "variable": "var(--colors-neutral-surface-border-hover)"
  },
  "colors.neutral.surface.fg": {
    "value": "var(--colors-neutral-surface-fg)",
    "variable": "var(--colors-neutral-surface-fg)"
  },
  "colors.neutral.outline.bg.hover": {
    "value": "var(--colors-neutral-outline-bg-hover)",
    "variable": "var(--colors-neutral-outline-bg-hover)"
  },
  "colors.neutral.outline.bg.active": {
    "value": "var(--colors-neutral-outline-bg-active)",
    "variable": "var(--colors-neutral-outline-bg-active)"
  },
  "colors.neutral.outline.border": {
    "value": "var(--colors-neutral-outline-border)",
    "variable": "var(--colors-neutral-outline-border)"
  },
  "colors.neutral.outline.fg": {
    "value": "var(--colors-neutral-outline-fg)",
    "variable": "var(--colors-neutral-outline-fg)"
  },
  "colors.neutral.plain.bg.hover": {
    "value": "var(--colors-neutral-plain-bg-hover)",
    "variable": "var(--colors-neutral-plain-bg-hover)"
  },
  "colors.neutral.plain.bg.active": {
    "value": "var(--colors-neutral-plain-bg-active)",
    "variable": "var(--colors-neutral-plain-bg-active)"
  },
  "colors.neutral.plain.fg": {
    "value": "var(--colors-neutral-plain-fg)",
    "variable": "var(--colors-neutral-plain-fg)"
  },
  "colors.purple.1": {
    "value": "var(--colors-purple-1)",
    "variable": "var(--colors-purple-1)"
  },
  "colors.purple.2": {
    "value": "var(--colors-purple-2)",
    "variable": "var(--colors-purple-2)"
  },
  "colors.purple.3": {
    "value": "var(--colors-purple-3)",
    "variable": "var(--colors-purple-3)"
  },
  "colors.purple.4": {
    "value": "var(--colors-purple-4)",
    "variable": "var(--colors-purple-4)"
  },
  "colors.purple.5": {
    "value": "var(--colors-purple-5)",
    "variable": "var(--colors-purple-5)"
  },
  "colors.purple.6": {
    "value": "var(--colors-purple-6)",
    "variable": "var(--colors-purple-6)"
  },
  "colors.purple.7": {
    "value": "var(--colors-purple-7)",
    "variable": "var(--colors-purple-7)"
  },
  "colors.purple.8": {
    "value": "var(--colors-purple-8)",
    "variable": "var(--colors-purple-8)"
  },
  "colors.purple.9": {
    "value": "var(--colors-purple-9)",
    "variable": "var(--colors-purple-9)"
  },
  "colors.purple.10": {
    "value": "var(--colors-purple-10)",
    "variable": "var(--colors-purple-10)"
  },
  "colors.purple.11": {
    "value": "var(--colors-purple-11)",
    "variable": "var(--colors-purple-11)"
  },
  "colors.purple.12": {
    "value": "var(--colors-purple-12)",
    "variable": "var(--colors-purple-12)"
  },
  "colors.purple.a1": {
    "value": "var(--colors-purple-a1)",
    "variable": "var(--colors-purple-a1)"
  },
  "colors.purple.a2": {
    "value": "var(--colors-purple-a2)",
    "variable": "var(--colors-purple-a2)"
  },
  "colors.purple.a3": {
    "value": "var(--colors-purple-a3)",
    "variable": "var(--colors-purple-a3)"
  },
  "colors.purple.a4": {
    "value": "var(--colors-purple-a4)",
    "variable": "var(--colors-purple-a4)"
  },
  "colors.purple.a5": {
    "value": "var(--colors-purple-a5)",
    "variable": "var(--colors-purple-a5)"
  },
  "colors.purple.a6": {
    "value": "var(--colors-purple-a6)",
    "variable": "var(--colors-purple-a6)"
  },
  "colors.purple.a7": {
    "value": "var(--colors-purple-a7)",
    "variable": "var(--colors-purple-a7)"
  },
  "colors.purple.a8": {
    "value": "var(--colors-purple-a8)",
    "variable": "var(--colors-purple-a8)"
  },
  "colors.purple.a9": {
    "value": "var(--colors-purple-a9)",
    "variable": "var(--colors-purple-a9)"
  },
  "colors.purple.a10": {
    "value": "var(--colors-purple-a10)",
    "variable": "var(--colors-purple-a10)"
  },
  "colors.purple.a11": {
    "value": "var(--colors-purple-a11)",
    "variable": "var(--colors-purple-a11)"
  },
  "colors.purple.a12": {
    "value": "var(--colors-purple-a12)",
    "variable": "var(--colors-purple-a12)"
  },
  "colors.purple.solid.bg": {
    "value": "var(--colors-purple-solid-bg)",
    "variable": "var(--colors-purple-solid-bg)"
  },
  "colors.purple.solid.bg.hover": {
    "value": "var(--colors-purple-solid-bg-hover)",
    "variable": "var(--colors-purple-solid-bg-hover)"
  },
  "colors.purple.solid.fg": {
    "value": "var(--colors-purple-solid-fg)",
    "variable": "var(--colors-purple-solid-fg)"
  },
  "colors.purple.subtle.bg": {
    "value": "var(--colors-purple-subtle-bg)",
    "variable": "var(--colors-purple-subtle-bg)"
  },
  "colors.purple.subtle.bg.hover": {
    "value": "var(--colors-purple-subtle-bg-hover)",
    "variable": "var(--colors-purple-subtle-bg-hover)"
  },
  "colors.purple.subtle.bg.active": {
    "value": "var(--colors-purple-subtle-bg-active)",
    "variable": "var(--colors-purple-subtle-bg-active)"
  },
  "colors.purple.subtle.fg": {
    "value": "var(--colors-purple-subtle-fg)",
    "variable": "var(--colors-purple-subtle-fg)"
  },
  "colors.purple.surface.bg": {
    "value": "var(--colors-purple-surface-bg)",
    "variable": "var(--colors-purple-surface-bg)"
  },
  "colors.purple.surface.bg.active": {
    "value": "var(--colors-purple-surface-bg-active)",
    "variable": "var(--colors-purple-surface-bg-active)"
  },
  "colors.purple.surface.border": {
    "value": "var(--colors-purple-surface-border)",
    "variable": "var(--colors-purple-surface-border)"
  },
  "colors.purple.surface.border.hover": {
    "value": "var(--colors-purple-surface-border-hover)",
    "variable": "var(--colors-purple-surface-border-hover)"
  },
  "colors.purple.surface.fg": {
    "value": "var(--colors-purple-surface-fg)",
    "variable": "var(--colors-purple-surface-fg)"
  },
  "colors.purple.outline.bg.hover": {
    "value": "var(--colors-purple-outline-bg-hover)",
    "variable": "var(--colors-purple-outline-bg-hover)"
  },
  "colors.purple.outline.bg.active": {
    "value": "var(--colors-purple-outline-bg-active)",
    "variable": "var(--colors-purple-outline-bg-active)"
  },
  "colors.purple.outline.border": {
    "value": "var(--colors-purple-outline-border)",
    "variable": "var(--colors-purple-outline-border)"
  },
  "colors.purple.outline.fg": {
    "value": "var(--colors-purple-outline-fg)",
    "variable": "var(--colors-purple-outline-fg)"
  },
  "colors.purple.plain.bg.hover": {
    "value": "var(--colors-purple-plain-bg-hover)",
    "variable": "var(--colors-purple-plain-bg-hover)"
  },
  "colors.purple.plain.bg.active": {
    "value": "var(--colors-purple-plain-bg-active)",
    "variable": "var(--colors-purple-plain-bg-active)"
  },
  "colors.purple.plain.fg": {
    "value": "var(--colors-purple-plain-fg)",
    "variable": "var(--colors-purple-plain-fg)"
  },
  "colors.red.1": {
    "value": "var(--colors-red-1)",
    "variable": "var(--colors-red-1)"
  },
  "colors.red.2": {
    "value": "var(--colors-red-2)",
    "variable": "var(--colors-red-2)"
  },
  "colors.red.3": {
    "value": "var(--colors-red-3)",
    "variable": "var(--colors-red-3)"
  },
  "colors.red.4": {
    "value": "var(--colors-red-4)",
    "variable": "var(--colors-red-4)"
  },
  "colors.red.5": {
    "value": "var(--colors-red-5)",
    "variable": "var(--colors-red-5)"
  },
  "colors.red.6": {
    "value": "var(--colors-red-6)",
    "variable": "var(--colors-red-6)"
  },
  "colors.red.7": {
    "value": "var(--colors-red-7)",
    "variable": "var(--colors-red-7)"
  },
  "colors.red.8": {
    "value": "var(--colors-red-8)",
    "variable": "var(--colors-red-8)"
  },
  "colors.red.9": {
    "value": "var(--colors-red-9)",
    "variable": "var(--colors-red-9)"
  },
  "colors.red.10": {
    "value": "var(--colors-red-10)",
    "variable": "var(--colors-red-10)"
  },
  "colors.red.11": {
    "value": "var(--colors-red-11)",
    "variable": "var(--colors-red-11)"
  },
  "colors.red.12": {
    "value": "var(--colors-red-12)",
    "variable": "var(--colors-red-12)"
  },
  "colors.red.a1": {
    "value": "var(--colors-red-a1)",
    "variable": "var(--colors-red-a1)"
  },
  "colors.red.a2": {
    "value": "var(--colors-red-a2)",
    "variable": "var(--colors-red-a2)"
  },
  "colors.red.a3": {
    "value": "var(--colors-red-a3)",
    "variable": "var(--colors-red-a3)"
  },
  "colors.red.a4": {
    "value": "var(--colors-red-a4)",
    "variable": "var(--colors-red-a4)"
  },
  "colors.red.a5": {
    "value": "var(--colors-red-a5)",
    "variable": "var(--colors-red-a5)"
  },
  "colors.red.a6": {
    "value": "var(--colors-red-a6)",
    "variable": "var(--colors-red-a6)"
  },
  "colors.red.a7": {
    "value": "var(--colors-red-a7)",
    "variable": "var(--colors-red-a7)"
  },
  "colors.red.a8": {
    "value": "var(--colors-red-a8)",
    "variable": "var(--colors-red-a8)"
  },
  "colors.red.a9": {
    "value": "var(--colors-red-a9)",
    "variable": "var(--colors-red-a9)"
  },
  "colors.red.a10": {
    "value": "var(--colors-red-a10)",
    "variable": "var(--colors-red-a10)"
  },
  "colors.red.a11": {
    "value": "var(--colors-red-a11)",
    "variable": "var(--colors-red-a11)"
  },
  "colors.red.a12": {
    "value": "var(--colors-red-a12)",
    "variable": "var(--colors-red-a12)"
  },
  "colors.red.solid.bg": {
    "value": "var(--colors-red-solid-bg)",
    "variable": "var(--colors-red-solid-bg)"
  },
  "colors.red.solid.bg.hover": {
    "value": "var(--colors-red-solid-bg-hover)",
    "variable": "var(--colors-red-solid-bg-hover)"
  },
  "colors.red.solid.fg": {
    "value": "var(--colors-red-solid-fg)",
    "variable": "var(--colors-red-solid-fg)"
  },
  "colors.red.subtle.bg": {
    "value": "var(--colors-red-subtle-bg)",
    "variable": "var(--colors-red-subtle-bg)"
  },
  "colors.red.subtle.bg.hover": {
    "value": "var(--colors-red-subtle-bg-hover)",
    "variable": "var(--colors-red-subtle-bg-hover)"
  },
  "colors.red.subtle.bg.active": {
    "value": "var(--colors-red-subtle-bg-active)",
    "variable": "var(--colors-red-subtle-bg-active)"
  },
  "colors.red.subtle.fg": {
    "value": "var(--colors-red-subtle-fg)",
    "variable": "var(--colors-red-subtle-fg)"
  },
  "colors.red.surface.bg": {
    "value": "var(--colors-red-surface-bg)",
    "variable": "var(--colors-red-surface-bg)"
  },
  "colors.red.surface.bg.active": {
    "value": "var(--colors-red-surface-bg-active)",
    "variable": "var(--colors-red-surface-bg-active)"
  },
  "colors.red.surface.border": {
    "value": "var(--colors-red-surface-border)",
    "variable": "var(--colors-red-surface-border)"
  },
  "colors.red.surface.border.hover": {
    "value": "var(--colors-red-surface-border-hover)",
    "variable": "var(--colors-red-surface-border-hover)"
  },
  "colors.red.surface.fg": {
    "value": "var(--colors-red-surface-fg)",
    "variable": "var(--colors-red-surface-fg)"
  },
  "colors.red.outline.bg.hover": {
    "value": "var(--colors-red-outline-bg-hover)",
    "variable": "var(--colors-red-outline-bg-hover)"
  },
  "colors.red.outline.bg.active": {
    "value": "var(--colors-red-outline-bg-active)",
    "variable": "var(--colors-red-outline-bg-active)"
  },
  "colors.red.outline.border": {
    "value": "var(--colors-red-outline-border)",
    "variable": "var(--colors-red-outline-border)"
  },
  "colors.red.outline.fg": {
    "value": "var(--colors-red-outline-fg)",
    "variable": "var(--colors-red-outline-fg)"
  },
  "colors.red.plain.bg.hover": {
    "value": "var(--colors-red-plain-bg-hover)",
    "variable": "var(--colors-red-plain-bg-hover)"
  },
  "colors.red.plain.bg.active": {
    "value": "var(--colors-red-plain-bg-active)",
    "variable": "var(--colors-red-plain-bg-active)"
  },
  "colors.red.plain.fg": {
    "value": "var(--colors-red-plain-fg)",
    "variable": "var(--colors-red-plain-fg)"
  },
  "colors.gray.1": {
    "value": "var(--colors-gray-1)",
    "variable": "var(--colors-gray-1)"
  },
  "colors.gray.2": {
    "value": "var(--colors-gray-2)",
    "variable": "var(--colors-gray-2)"
  },
  "colors.gray.3": {
    "value": "var(--colors-gray-3)",
    "variable": "var(--colors-gray-3)"
  },
  "colors.gray.4": {
    "value": "var(--colors-gray-4)",
    "variable": "var(--colors-gray-4)"
  },
  "colors.gray.5": {
    "value": "var(--colors-gray-5)",
    "variable": "var(--colors-gray-5)"
  },
  "colors.gray.6": {
    "value": "var(--colors-gray-6)",
    "variable": "var(--colors-gray-6)"
  },
  "colors.gray.7": {
    "value": "var(--colors-gray-7)",
    "variable": "var(--colors-gray-7)"
  },
  "colors.gray.8": {
    "value": "var(--colors-gray-8)",
    "variable": "var(--colors-gray-8)"
  },
  "colors.gray.9": {
    "value": "var(--colors-gray-9)",
    "variable": "var(--colors-gray-9)"
  },
  "colors.gray.10": {
    "value": "var(--colors-gray-10)",
    "variable": "var(--colors-gray-10)"
  },
  "colors.gray.11": {
    "value": "var(--colors-gray-11)",
    "variable": "var(--colors-gray-11)"
  },
  "colors.gray.12": {
    "value": "var(--colors-gray-12)",
    "variable": "var(--colors-gray-12)"
  },
  "colors.gray.a1": {
    "value": "var(--colors-gray-a1)",
    "variable": "var(--colors-gray-a1)"
  },
  "colors.gray.a2": {
    "value": "var(--colors-gray-a2)",
    "variable": "var(--colors-gray-a2)"
  },
  "colors.gray.a3": {
    "value": "var(--colors-gray-a3)",
    "variable": "var(--colors-gray-a3)"
  },
  "colors.gray.a4": {
    "value": "var(--colors-gray-a4)",
    "variable": "var(--colors-gray-a4)"
  },
  "colors.gray.a5": {
    "value": "var(--colors-gray-a5)",
    "variable": "var(--colors-gray-a5)"
  },
  "colors.gray.a6": {
    "value": "var(--colors-gray-a6)",
    "variable": "var(--colors-gray-a6)"
  },
  "colors.gray.a7": {
    "value": "var(--colors-gray-a7)",
    "variable": "var(--colors-gray-a7)"
  },
  "colors.gray.a8": {
    "value": "var(--colors-gray-a8)",
    "variable": "var(--colors-gray-a8)"
  },
  "colors.gray.a9": {
    "value": "var(--colors-gray-a9)",
    "variable": "var(--colors-gray-a9)"
  },
  "colors.gray.a10": {
    "value": "var(--colors-gray-a10)",
    "variable": "var(--colors-gray-a10)"
  },
  "colors.gray.a11": {
    "value": "var(--colors-gray-a11)",
    "variable": "var(--colors-gray-a11)"
  },
  "colors.gray.a12": {
    "value": "var(--colors-gray-a12)",
    "variable": "var(--colors-gray-a12)"
  },
  "colors.gray.solid.bg": {
    "value": "var(--colors-gray-solid-bg)",
    "variable": "var(--colors-gray-solid-bg)"
  },
  "colors.gray.solid.bg.hover": {
    "value": "var(--colors-gray-solid-bg-hover)",
    "variable": "var(--colors-gray-solid-bg-hover)"
  },
  "colors.gray.solid.fg": {
    "value": "var(--colors-gray-solid-fg)",
    "variable": "var(--colors-gray-solid-fg)"
  },
  "colors.gray.subtle.bg": {
    "value": "var(--colors-gray-subtle-bg)",
    "variable": "var(--colors-gray-subtle-bg)"
  },
  "colors.gray.subtle.bg.hover": {
    "value": "var(--colors-gray-subtle-bg-hover)",
    "variable": "var(--colors-gray-subtle-bg-hover)"
  },
  "colors.gray.subtle.bg.active": {
    "value": "var(--colors-gray-subtle-bg-active)",
    "variable": "var(--colors-gray-subtle-bg-active)"
  },
  "colors.gray.subtle.fg": {
    "value": "var(--colors-gray-subtle-fg)",
    "variable": "var(--colors-gray-subtle-fg)"
  },
  "colors.gray.surface.bg": {
    "value": "var(--colors-gray-surface-bg)",
    "variable": "var(--colors-gray-surface-bg)"
  },
  "colors.gray.surface.bg.hover": {
    "value": "var(--colors-gray-surface-bg-hover)",
    "variable": "var(--colors-gray-surface-bg-hover)"
  },
  "colors.gray.surface.bg.active": {
    "value": "var(--colors-gray-surface-bg-active)",
    "variable": "var(--colors-gray-surface-bg-active)"
  },
  "colors.gray.surface.border": {
    "value": "var(--colors-gray-surface-border)",
    "variable": "var(--colors-gray-surface-border)"
  },
  "colors.gray.surface.border.hover": {
    "value": "var(--colors-gray-surface-border-hover)",
    "variable": "var(--colors-gray-surface-border-hover)"
  },
  "colors.gray.surface.fg": {
    "value": "var(--colors-gray-surface-fg)",
    "variable": "var(--colors-gray-surface-fg)"
  },
  "colors.gray.outline.bg.hover": {
    "value": "var(--colors-gray-outline-bg-hover)",
    "variable": "var(--colors-gray-outline-bg-hover)"
  },
  "colors.gray.outline.bg.active": {
    "value": "var(--colors-gray-outline-bg-active)",
    "variable": "var(--colors-gray-outline-bg-active)"
  },
  "colors.gray.outline.border": {
    "value": "var(--colors-gray-outline-border)",
    "variable": "var(--colors-gray-outline-border)"
  },
  "colors.gray.outline.fg": {
    "value": "var(--colors-gray-outline-fg)",
    "variable": "var(--colors-gray-outline-fg)"
  },
  "colors.gray.plain.bg.hover": {
    "value": "var(--colors-gray-plain-bg-hover)",
    "variable": "var(--colors-gray-plain-bg-hover)"
  },
  "colors.gray.plain.bg.active": {
    "value": "var(--colors-gray-plain-bg-active)",
    "variable": "var(--colors-gray-plain-bg-active)"
  },
  "colors.gray.plain.fg": {
    "value": "var(--colors-gray-plain-fg)",
    "variable": "var(--colors-gray-plain-fg)"
  },
  "colors.fg.default": {
    "value": "var(--colors-fg-default)",
    "variable": "var(--colors-fg-default)"
  },
  "colors.fg.muted": {
    "value": "var(--colors-fg-muted)",
    "variable": "var(--colors-fg-muted)"
  },
  "colors.fg.subtle": {
    "value": "var(--colors-fg-subtle)",
    "variable": "var(--colors-fg-subtle)"
  },
  "colors.canvas": {
    "value": "var(--colors-canvas)",
    "variable": "var(--colors-canvas)"
  },
  "colors.border": {
    "value": "var(--colors-border)",
    "variable": "var(--colors-border)"
  },
  "colors.error": {
    "value": "var(--colors-error)",
    "variable": "var(--colors-error)"
  },
  "shadows.inset": {
    "value": "var(--shadows-inset)",
    "variable": "var(--shadows-inset)"
  },
  "colors.colorPalette": {
    "value": "var(--colors-color-palette)",
    "variable": "var(--colors-color-palette)"
  },
  "colors.colorPalette.a1": {
    "value": "var(--colors-color-palette-a1)",
    "variable": "var(--colors-color-palette-a1)"
  },
  "colors.colorPalette.a2": {
    "value": "var(--colors-color-palette-a2)",
    "variable": "var(--colors-color-palette-a2)"
  },
  "colors.colorPalette.a3": {
    "value": "var(--colors-color-palette-a3)",
    "variable": "var(--colors-color-palette-a3)"
  },
  "colors.colorPalette.a4": {
    "value": "var(--colors-color-palette-a4)",
    "variable": "var(--colors-color-palette-a4)"
  },
  "colors.colorPalette.a5": {
    "value": "var(--colors-color-palette-a5)",
    "variable": "var(--colors-color-palette-a5)"
  },
  "colors.colorPalette.a6": {
    "value": "var(--colors-color-palette-a6)",
    "variable": "var(--colors-color-palette-a6)"
  },
  "colors.colorPalette.a7": {
    "value": "var(--colors-color-palette-a7)",
    "variable": "var(--colors-color-palette-a7)"
  },
  "colors.colorPalette.a8": {
    "value": "var(--colors-color-palette-a8)",
    "variable": "var(--colors-color-palette-a8)"
  },
  "colors.colorPalette.a9": {
    "value": "var(--colors-color-palette-a9)",
    "variable": "var(--colors-color-palette-a9)"
  },
  "colors.colorPalette.a10": {
    "value": "var(--colors-color-palette-a10)",
    "variable": "var(--colors-color-palette-a10)"
  },
  "colors.colorPalette.a11": {
    "value": "var(--colors-color-palette-a11)",
    "variable": "var(--colors-color-palette-a11)"
  },
  "colors.colorPalette.a12": {
    "value": "var(--colors-color-palette-a12)",
    "variable": "var(--colors-color-palette-a12)"
  },
  "colors.colorPalette.1": {
    "value": "var(--colors-color-palette-1)",
    "variable": "var(--colors-color-palette-1)"
  },
  "colors.colorPalette.2": {
    "value": "var(--colors-color-palette-2)",
    "variable": "var(--colors-color-palette-2)"
  },
  "colors.colorPalette.3": {
    "value": "var(--colors-color-palette-3)",
    "variable": "var(--colors-color-palette-3)"
  },
  "colors.colorPalette.4": {
    "value": "var(--colors-color-palette-4)",
    "variable": "var(--colors-color-palette-4)"
  },
  "colors.colorPalette.5": {
    "value": "var(--colors-color-palette-5)",
    "variable": "var(--colors-color-palette-5)"
  },
  "colors.colorPalette.6": {
    "value": "var(--colors-color-palette-6)",
    "variable": "var(--colors-color-palette-6)"
  },
  "colors.colorPalette.7": {
    "value": "var(--colors-color-palette-7)",
    "variable": "var(--colors-color-palette-7)"
  },
  "colors.colorPalette.8": {
    "value": "var(--colors-color-palette-8)",
    "variable": "var(--colors-color-palette-8)"
  },
  "colors.colorPalette.9": {
    "value": "var(--colors-color-palette-9)",
    "variable": "var(--colors-color-palette-9)"
  },
  "colors.colorPalette.10": {
    "value": "var(--colors-color-palette-10)",
    "variable": "var(--colors-color-palette-10)"
  },
  "colors.colorPalette.11": {
    "value": "var(--colors-color-palette-11)",
    "variable": "var(--colors-color-palette-11)"
  },
  "colors.colorPalette.12": {
    "value": "var(--colors-color-palette-12)",
    "variable": "var(--colors-color-palette-12)"
  },
  "colors.colorPalette.solid.bg": {
    "value": "var(--colors-color-palette-solid-bg)",
    "variable": "var(--colors-color-palette-solid-bg)"
  },
  "colors.colorPalette.bg": {
    "value": "var(--colors-color-palette-bg)",
    "variable": "var(--colors-color-palette-bg)"
  },
  "colors.colorPalette.solid.bg.hover": {
    "value": "var(--colors-color-palette-solid-bg-hover)",
    "variable": "var(--colors-color-palette-solid-bg-hover)"
  },
  "colors.colorPalette.bg.hover": {
    "value": "var(--colors-color-palette-bg-hover)",
    "variable": "var(--colors-color-palette-bg-hover)"
  },
  "colors.colorPalette.hover": {
    "value": "var(--colors-color-palette-hover)",
    "variable": "var(--colors-color-palette-hover)"
  },
  "colors.colorPalette.solid.fg": {
    "value": "var(--colors-color-palette-solid-fg)",
    "variable": "var(--colors-color-palette-solid-fg)"
  },
  "colors.colorPalette.fg": {
    "value": "var(--colors-color-palette-fg)",
    "variable": "var(--colors-color-palette-fg)"
  },
  "colors.colorPalette.subtle.bg": {
    "value": "var(--colors-color-palette-subtle-bg)",
    "variable": "var(--colors-color-palette-subtle-bg)"
  },
  "colors.colorPalette.subtle.bg.hover": {
    "value": "var(--colors-color-palette-subtle-bg-hover)",
    "variable": "var(--colors-color-palette-subtle-bg-hover)"
  },
  "colors.colorPalette.subtle.bg.active": {
    "value": "var(--colors-color-palette-subtle-bg-active)",
    "variable": "var(--colors-color-palette-subtle-bg-active)"
  },
  "colors.colorPalette.bg.active": {
    "value": "var(--colors-color-palette-bg-active)",
    "variable": "var(--colors-color-palette-bg-active)"
  },
  "colors.colorPalette.active": {
    "value": "var(--colors-color-palette-active)",
    "variable": "var(--colors-color-palette-active)"
  },
  "colors.colorPalette.subtle.fg": {
    "value": "var(--colors-color-palette-subtle-fg)",
    "variable": "var(--colors-color-palette-subtle-fg)"
  },
  "colors.colorPalette.surface.bg": {
    "value": "var(--colors-color-palette-surface-bg)",
    "variable": "var(--colors-color-palette-surface-bg)"
  },
  "colors.colorPalette.surface.bg.active": {
    "value": "var(--colors-color-palette-surface-bg-active)",
    "variable": "var(--colors-color-palette-surface-bg-active)"
  },
  "colors.colorPalette.surface.border": {
    "value": "var(--colors-color-palette-surface-border)",
    "variable": "var(--colors-color-palette-surface-border)"
  },
  "colors.colorPalette.border": {
    "value": "var(--colors-color-palette-border)",
    "variable": "var(--colors-color-palette-border)"
  },
  "colors.colorPalette.surface.border.hover": {
    "value": "var(--colors-color-palette-surface-border-hover)",
    "variable": "var(--colors-color-palette-surface-border-hover)"
  },
  "colors.colorPalette.border.hover": {
    "value": "var(--colors-color-palette-border-hover)",
    "variable": "var(--colors-color-palette-border-hover)"
  },
  "colors.colorPalette.surface.fg": {
    "value": "var(--colors-color-palette-surface-fg)",
    "variable": "var(--colors-color-palette-surface-fg)"
  },
  "colors.colorPalette.outline.bg.hover": {
    "value": "var(--colors-color-palette-outline-bg-hover)",
    "variable": "var(--colors-color-palette-outline-bg-hover)"
  },
  "colors.colorPalette.outline.bg.active": {
    "value": "var(--colors-color-palette-outline-bg-active)",
    "variable": "var(--colors-color-palette-outline-bg-active)"
  },
  "colors.colorPalette.outline.border": {
    "value": "var(--colors-color-palette-outline-border)",
    "variable": "var(--colors-color-palette-outline-border)"
  },
  "colors.colorPalette.outline.fg": {
    "value": "var(--colors-color-palette-outline-fg)",
    "variable": "var(--colors-color-palette-outline-fg)"
  },
  "colors.colorPalette.plain.bg.hover": {
    "value": "var(--colors-color-palette-plain-bg-hover)",
    "variable": "var(--colors-color-palette-plain-bg-hover)"
  },
  "colors.colorPalette.plain.bg.active": {
    "value": "var(--colors-color-palette-plain-bg-active)",
    "variable": "var(--colors-color-palette-plain-bg-active)"
  },
  "colors.colorPalette.plain.fg": {
    "value": "var(--colors-color-palette-plain-fg)",
    "variable": "var(--colors-color-palette-plain-fg)"
  },
  "colors.colorPalette.surface.bg.hover": {
    "value": "var(--colors-color-palette-surface-bg-hover)",
    "variable": "var(--colors-color-palette-surface-bg-hover)"
  },
  "colors.colorPalette.default": {
    "value": "var(--colors-color-palette-default)",
    "variable": "var(--colors-color-palette-default)"
  },
  "colors.colorPalette.muted": {
    "value": "var(--colors-color-palette-muted)",
    "variable": "var(--colors-color-palette-muted)"
  },
  "colors.colorPalette.subtle": {
    "value": "var(--colors-color-palette-subtle)",
    "variable": "var(--colors-color-palette-subtle)"
  }
}

export function token(path, fallback) {
  return tokens[path]?.value || fallback
}

function tokenVar(path, fallback) {
  return tokens[path]?.variable || fallback
}

token.var = tokenVar