import Image from "next/image";

const MARK = "/frontfigure-mark.png";

const SIZES = {
  sm: {
    px: 22,
    tile: "rounded-md p-0.5",
    gap: "gap-2",
    text: "text-sm",
  },
  md: {
    px: 44,
    tile: "rounded-lg p-1",
    gap: "gap-2.5",
    text: "text-2xl",
  },
  lg: {
    px: 64,
    tile: "rounded-xl p-1",
    gap: "gap-3",
    text: "text-[clamp(2.5rem,8vw,4.5rem)]",
  },
  hero: {
    px: 36,
    tile: "rounded-lg p-0.5",
    gap: "gap-2.5",
    text: "text-[clamp(1.75rem,6.5vw,3.75rem)]",
  },
} as const;

type Props = {
  size?: keyof typeof SIZES;
  showWord?: boolean;
  priority?: boolean;
  className?: string;
};

export function BrandLockup({
  size = "sm",
  showWord = true,
  priority = false,
  className = "",
}: Props) {
  const s = SIZES[size];
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <span
        className={`shrink-0 overflow-hidden border border-[var(--ff-border)] bg-white shadow-sm ${s.tile}`}
      >
        <Image
          src={MARK}
          alt={showWord ? "" : "Frontfigure"}
          width={s.px}
          height={s.px}
          className="block"
          priority={priority}
        />
      </span>
      {showWord ? (
        <span className={`font-display font-extrabold tracking-tight text-[var(--ff-accent)] ${s.text}`}>
          Frontfigure
        </span>
      ) : null}
    </span>
  );
}
