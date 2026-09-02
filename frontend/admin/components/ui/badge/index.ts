import { type VariantProps, cva } from "class-variance-authority";

export { default as Badge } from "./Badge.vue";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        emerald:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-sm",
        amber:
          "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-sm",
        indigo:
          "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-sm",
        rose:
          "border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
