import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert, Button } from "../ui";
import PhotoUploader from "./PhotoUploader";
import CameraCapture from "./CameraCapture";
import TryOnPreview from "./TryOnPreview";
import TryOnLoader from "./TryOnLoader";
import TryOnResult from "./TryOnResult";
import { checkPhoto, classifyError, requestTryOn } from "../../services/tryOn";

// IDLE → PHOTO_SELECTED → GENERATING → SUCCESS, with the error states
// hanging off whichever step failed. One `state` value drives the whole
// modal, so the UI can never show two things at once.
const IDLE = "IDLE";
const CAMERA = "CAMERA";
const PHOTO_SELECTED = "PHOTO_SELECTED";
const GENERATING = "GENERATING";
const SUCCESS = "SUCCESS";

// Upper-body garments read fine from a waist-up photo; anything that reaches
// the legs needs the whole person in frame.
const HINTS = {
  "upper-body":
    "A head-to-waist photo works best for this one. Face the camera, arms down, plain background.",
  "full-body":
    "This one needs a full-body photo — head to feet, facing the camera, plain background.",
};

function VirtualTryOnModal({
  product,
  garmentImage,
  fitGuide,
  onClose,
  saved,
  onSave,
}) {
  const navigate = useNavigate();

  const [state, setState] = useState(IDLE);
  const [error, setError] = useState("");
  // Held separately from `state` so a failed generation still shows the
  // preview underneath the message rather than an empty modal.
  const [errorState, setErrorState] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [result, setResult] = useState(null);

  const abortRef = useRef(null);
  const dialogRef = useRef(null);

  // Object URLs are revoked as soon as they're replaced, so a customer
  // cycling through photos doesn't leak one per attempt.
  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  // Escape closes, and the page behind stops scrolling while this is open.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      abortRef.current?.abort();
    };
  }, [onClose]);

  const cameraAvailable =
    typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

  const choosePhoto = (file) => {
    const problem = checkPhoto(file);

    if (problem) {
      setError(problem);
      setState(IDLE);
      return;
    }

    if (photoUrl) URL.revokeObjectURL(photoUrl);

    setError("");
    setPhoto(file);
    setPhotoUrl(URL.createObjectURL(file));
    setState(PHOTO_SELECTED);
  };

  const generate = async () => {
    setState(GENERATING);
    setError("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await requestTryOn({
        photo,
        productId: product._id,
        signal: controller.signal,
      });

      setResult(data);
      setState(SUCCESS);
    } catch (err) {
      const { state: next, message } = classifyError(err);

      // A cancel isn't a failure — drop back to the preview silently.
      if (!message) {
        setState(PHOTO_SELECTED);
        return;
      }

      setError(message);
      setState(PHOTO_SELECTED);

      // Keeps the failure kind visible for the retry copy below.
      setResult(null);
      setErrorState(next);
    } finally {
      abortRef.current = null;
    }
  };

  const startOver = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);

    setPhoto(null);
    setPhotoUrl("");
    setResult(null);
    setError("");
    setErrorState("");
    setState(IDLE);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Virtual try-on for ${product.title}`}
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-bone p-5 shadow-2xl outline-none sm:rounded-3xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="care-label text-stitch">✨ ThriftVerse try-on</p>

            <h2 className="wordmark-sm mt-1.5 text-2xl sm:text-3xl">
              {state === SUCCESS
                ? "Here's your try-on"
                : "See how this looks on you"}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close try-on"
            className="care-label rounded-full border border-wash px-3 py-2 text-fade transition hover:border-stamp hover:text-stamp"
          >
            Close
          </button>
        </div>

        {error && (
          <div className="mt-4">
            <Alert>{error}</Alert>

            {errorState === "NETWORK_ERROR" && photo && (
              <div className="mt-3">
                <Button onClick={generate}>Try again</Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-5">
          {state === IDLE && (
            <PhotoUploader
              hint={HINTS[fitGuide] || HINTS["full-body"]}
              onPick={choosePhoto}
              onUseCamera={() => setState(CAMERA)}
              cameraAvailable={cameraAvailable}
            />
          )}

          {state === CAMERA && (
            <CameraCapture onCapture={choosePhoto} onCancel={() => setState(IDLE)} />
          )}

          {state === PHOTO_SELECTED && (
            <TryOnPreview
              photoUrl={photoUrl}
              product={product}
              garmentImage={garmentImage}
              onGenerate={generate}
              onChange={startOver}
            />
          )}

          {state === GENERATING && (
            <TryOnLoader
              onCancel={() => {
                abortRef.current?.abort();
                setState(PHOTO_SELECTED);
              }}
            />
          )}

          {state === SUCCESS && result && (
            <TryOnResult
              imageUrl={result.imageUrl}
              demo={result.demo}
              product={result.product || product}
              saved={saved}
              onSave={onSave}
              onTryAgain={startOver}
              onBrowseMore={() => {
                onClose();
                navigate("/");
              }}
              onClose={onClose}
            />
          )}
        </div>

        {state !== SUCCESS && (
          <p className="care-label mt-6 border-t border-wash pt-4 text-fade">
            Your photo is sent for generation and deleted straight after. It is
            never added to the listing or shown to the seller.
          </p>
        )}
      </div>
    </div>
  );
}

export default VirtualTryOnModal;
