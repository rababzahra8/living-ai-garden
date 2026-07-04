import { Button } from "@/components/ui/button";

type LoadErrorPanelProps = {
  message: string;
  onRetry?: () => void;
  className?: string;
};

export function LoadErrorPanel({ message, onRetry, className }: LoadErrorPanelProps) {
  return (
    <div
      className={`flex min-h-[12rem] flex-col items-center justify-center px-6 py-10 text-center ${className ?? ""}`}
    >
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" className="mt-4 rounded-full" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
