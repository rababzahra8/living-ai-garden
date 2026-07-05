import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WEATHER_OPTIONS, type WeatherPreference } from "@/lib/garden3d/weather-preferences";

export function WeatherPicker({
  value,
  onChange,
}: {
  value: WeatherPreference;
  onChange: (pref: WeatherPreference) => void;
}) {
  const current = WEATHER_OPTIONS.find((o) => o.value === value) ?? WEATHER_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Weather preference"
          className="glass-button flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10"
          title={`Weather: ${current.label}`}
        >
          <span className="text-base leading-none">{current.icon}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-sheet border-white/10 text-white/90">
        <DropdownMenuLabel className="text-white/60">Garden weather</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {WEATHER_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`cursor-pointer focus:bg-white/10 focus:text-white ${value === opt.value ? "bg-white/10" : ""}`}
          >
            <span className="mr-2">{opt.icon}</span>
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
