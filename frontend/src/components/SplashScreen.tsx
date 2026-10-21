import { useId } from "react";
import kadaGoLogo from "@/assets/ab63915e-4a2e-4c2e-87d3-7e3f12ff3cdb-removebg-preview.png";

export default function SplashScreen() {
  const clipId = useId();

  return (
    <div className="splash-screen" role="status" aria-label="Opening KadaGo">
      <div className="splash-brand">
        {/* Assemble the original artwork without replacing any branding. */}
        <svg className="splash-logo" viewBox="180 70 320 220" role="img" aria-label="KadaGo">
          <defs>
            <clipPath id={`${clipId}-truck`}>
              <path clipRule="evenodd" d="M0 0H677V212H0Z M275 100V177H382V100Z" />
            </clipPath>
            <clipPath id={`${clipId}-cargo`}>
              <rect x="275" y="100" width="107" height="77" />
            </clipPath>
            <clipPath id={`${clipId}-wordmark`}>
              <rect x="0" y="212" width="677" height="157" />
            </clipPath>
          </defs>
          <g className="splash-truck">
            <image href={kadaGoLogo} width="677" height="369" clipPath={`url(#${clipId}-truck)`} />
          </g>
          <g className="splash-cargo">
            <image href={kadaGoLogo} width="677" height="369" clipPath={`url(#${clipId}-cargo)`} />
          </g>
          <g className="splash-wordmark">
            <image href={kadaGoLogo} width="677" height="369" clipPath={`url(#${clipId}-wordmark)`} />
          </g>
        </svg>
        <p className="splash-tagline">Heavy Hauling Made Simple</p>
      </div>
    </div>
  );
}
