import Link from "next/link";

export function Brand({ size }: { size: number }) {
  return (
    <Link className="brand" href="/" aria-label="RoleEdge home">
      {/* The RoleEdge mark is about twice as wide as it is tall; `size` sets its height. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny logo, served as-is */}
      <img className="brand-mark" src="/assets/roleedge-mark.png" width={Math.round(size * 1.94)} height={size} alt="" />
      <span>
        Role<span className="brand-edge">Edge</span>
        <span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
