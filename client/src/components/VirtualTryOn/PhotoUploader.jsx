import { useRef, useState } from "react";
import { Button } from "../ui";

// Upload always comes first and always stays available — the camera is the
// optional path, not the required one.
function PhotoUploader({ hint, onPick, onUseCamera, cameraAvailable }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const take = (files) => {
    const file = files?.[0];
    if (file) onPick(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          take(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragging ? "border-stamp bg-stamp/5" : "border-denim-light bg-wash/40"
        }`}
      >
        <p className="font-display text-lg font-semibold">Drop a photo here</p>

        <p className="mx-auto mt-1.5 max-w-xs text-sm text-fade">{hint}</p>

        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <Button type="button" onClick={() => inputRef.current?.click()}>
            Choose photo
          </Button>

          {cameraAvailable && (
            <Button type="button" variant="outline" onClick={onUseCamera}>
              Use camera
            </Button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          className="hidden"
          onChange={(e) => {
            take(e.target.files);
            // Lets the same file be picked twice in a row after an error.
            e.target.value = "";
          }}
        />
      </div>

      <p className="care-label mt-3 text-center text-fade">
        JPG or PNG · up to 5MB · your photo is never saved
      </p>
    </div>
  );
}

export default PhotoUploader;
