import { Suspense } from "react";
import VerifySessionContent from "./VerifySessionContent";

export default function Page() {
  return (
    <Suspense
      fallback={
        <p style={{ textAlign: "center", marginTop: "4rem" }}>Loading...</p>
      }
    >
      <VerifySessionContent />
    </Suspense>
  );
}
