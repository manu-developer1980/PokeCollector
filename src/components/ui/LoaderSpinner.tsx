interface LoadingSpinnerProps {
  message?: string;
  compact?: boolean;
}

export default function LoadingSpinner({
  message,
  compact = false,
}: LoadingSpinnerProps) {
  return (
    <div className="w-full flex justify-center my-4">
      <div className="bg-card border rounded-lg shadow-sm p-6 flex flex-col items-center gap-4">
        <div className="pokeball w-12 h-12 animate-spin" />
        {message && <h2 className="text-lg font-semibold mt-4">{message}</h2>}
      </div>
    </div>
  );
}
