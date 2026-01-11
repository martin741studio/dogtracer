import CameraButton from "./components/CameraButton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          🐕 DogTracer
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Document your dog&apos;s day with photos and insights
        </p>
      </div>

      <div className="mt-12">
        <CameraButton />
      </div>

      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        Tap the camera to capture a moment
      </p>
    </div>
  );
}
