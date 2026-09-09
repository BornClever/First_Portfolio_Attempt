export default function StatusIndicators() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500"></div>
      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-400"></div>
      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-400"></div>
    </div>
  );
}