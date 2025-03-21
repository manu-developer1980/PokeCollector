export default function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="flex flex-col items-center">
        <div className="pokeball mb-4 animate-spin duration-1000" />
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  );
}
