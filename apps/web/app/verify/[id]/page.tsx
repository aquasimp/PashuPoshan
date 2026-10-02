import React, { Suspense } from "react";
import VerifyClient from "./VerifyClient";

export function generateStaticParams() {
  return [
    { id: "FS-20260930-H801" },
    { id: "FS-20261001-A102" },
    { id: "FS-20261002-S304" },
    { id: "FS-20261003-B505" },
    { id: "sample" },
  ];
}

export default function PublicVerifyPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink flex items-center justify-center p-8 text-xs text-muted dark:text-dark-muted font-sans">
          Loading verification record...
        </div>
      }
    >
      <VerifyClient initialSampleId={params.id} />
    </Suspense>
  );
}
