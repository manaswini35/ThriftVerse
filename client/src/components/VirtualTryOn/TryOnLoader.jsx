import { useEffect, useState } from "react";
import { Button } from "../ui";

// Generation runs 5-40 seconds, sometimes longer. A bare spinner for that
// long reads as "frozen", so the copy moves along with it and the customer
// keeps the option to back out.
const BEATS = [
  "Creating your virtual try-on…",
  "Reading the shape of the garment…",
  "Fitting it to your photo…",
  "Almost there — the last bit is the slowest…",
];

function TryOnLoader({ onCancel }) {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setBeat((i) => Math.min(i + 1, BEATS.length - 1)),
      7000
    );

    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center py-12 text-center">
      {/* A spinning needle-and-thread ring rather than a generic donut. */}
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-denim-light" />
        <div className="absolute inset-3 rounded-full bg-stitch/20" />
      </div>

      <p key={beat} className="animate-rise mt-6 font-display text-lg font-semibold">
        {BEATS[beat]}
      </p>

      <p className="mt-2 max-w-xs text-sm text-fade">
        This usually takes under a minute. You can keep this open — we'll show
        the result here.
      </p>

      <Button variant="outline" className="mt-6" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

export default TryOnLoader;
