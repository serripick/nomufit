import { SERVICE_DISCLAIMER } from "@/lib/legal/disclaimers";

export function DisclaimerNote({ className = "" }: { className?: string }) {
  return <p className={`doc-disclaimer ${className}`}>{SERVICE_DISCLAIMER}</p>;
}
