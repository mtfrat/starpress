type Step = "idle" | "scraping" | "analyzing" | "done" | "error";

const steps: { key: Step; label: string }[] = [
  { key: "scraping", label: "Scraping reviews..." },
  { key: "analyzing", label: "Analyzing sentiment..." },
  { key: "done", label: "Done!" },
];

export function ScrapingProgress({ step }: { step: Step }) {
  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center gap-4">
      {steps.map((s, i) => {
        const isActive = step === s.key;
        const isComplete = currentIndex > i;

        return (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isActive
                  ? "bg-blue-600 animate-pulse"
                  : isComplete
                    ? "bg-green-500"
                    : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
            <span
              className={`text-sm ${
                isActive
                  ? "text-blue-600 font-medium"
                  : isComplete
                    ? "text-green-600"
                    : "text-gray-500"
              }`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
      {step === "error" && (
        <span className="text-sm text-red-600">Failed. Please try again.</span>
      )}
    </div>
  );
}
