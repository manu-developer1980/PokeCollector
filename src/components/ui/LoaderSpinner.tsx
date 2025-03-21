interface LoadingSpinnerProps {
  message: string;
  compact?: boolean;
}

export default function LoadingSpinner({
  message,
  compact = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex justify-center items-center ${
        compact ? "py-2" : "py-12"
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="pokeball mb-2 animate-spin duration-1000" />
        <p className="text-lg text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  );
}
