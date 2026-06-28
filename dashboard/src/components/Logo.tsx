// Official AXEND wordmark on a dark-teal chip (the logo PNG is white, so it
// needs a dark background to be visible on the light dashboard).
export function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span className={`logo-chip${size === "lg" ? " lg" : ""}`} aria-label="Axend">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/axend-logo.png" alt="Axend" />
    </span>
  );
}
