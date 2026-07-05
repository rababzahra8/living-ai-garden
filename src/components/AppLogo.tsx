import { useTheme } from "@/lib/theme";

const LOGO = {
  light: "/logo/aigarden-icon-light.svg",
  dark: "/logo/aigarden-icon-dark.svg",
} as const;

export function AppLogo({
  className = "",
  size = 32,
  variant = "auto",
  alt = "Living AI Garden",
}: {
  className?: string;
  size?: number;
  variant?: "auto" | "light" | "dark";
  alt?: string;
}) {
  const { theme } = useTheme();
  const resolved = variant === "auto" ? theme : variant;
  const src = resolved === "dark" ? LOGO.dark : LOGO.light;

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 rounded-[22%] ${className}`}
      decoding="async"
    />
  );
}
