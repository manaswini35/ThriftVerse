import { useEffect, useRef, useState } from "react";
import { Alert, Button } from "../ui";

// Opt-in only. If permission is refused or no camera exists we say so and
// hand the customer straight back to uploading, which always works.
function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      // Front camera on phones, and a portrait-ish frame so a full-body shot
      // is possible without the browser cropping to a letterbox.
      .getUserMedia({
        video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1440 } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setReady(true);
        }
      })
      .catch((err) => {
        if (cancelled) return;

        setError(
          err?.name === "NotAllowedError"
            ? "Camera permission was blocked. You can still upload a photo instead."
            : "No camera available on this device. Upload a photo instead."
        );
      });

    // Releasing the track is what turns the recording light off. Do it on
    // every exit path, including closing the modal mid-stream.
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const snap = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Couldn't capture that frame. Try again or upload a photo.");
          return;
        }

        streamRef.current?.getTracks().forEach((t) => t.stop());

        onCapture(
          new File([blob], `tryon-${Date.now()}.jpg`, { type: "image/jpeg" })
        );
      },
      "image/jpeg",
      0.92
    );
  };

  if (error) {
    return (
      <div>
        <Alert>{error}</Alert>

        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={onCancel}>
            Back to upload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl bg-ink">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          // Mirrored so it behaves like a mirror while you frame the shot.
          className="max-h-[52vh] w-full -scale-x-100 object-contain"
        />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2.5">
        <Button onClick={snap} disabled={!ready}>
          {ready ? "Take photo" : "Starting camera…"}
        </Button>

        <Button variant="outline" onClick={onCancel}>
          Upload instead
        </Button>
      </div>
    </div>
  );
}

export default CameraCapture;
