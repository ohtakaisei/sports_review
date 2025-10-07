export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
        </div>
        <p className="text-lg text-gray-600">読み込み中...</p>
      </div>
    </div>
  );
}

