import Script from "next/script";

interface JsonLdProps {
  id: string;
  data: Record<string, unknown>;
}

export function JsonLd({ id, data }: JsonLdProps) {
  return (
    <Script id={id} type="application/ld+json" strategy="beforeInteractive">
      {JSON.stringify(data)}
    </Script>
  );
}
