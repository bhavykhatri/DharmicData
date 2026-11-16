import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/components/search-client";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <>
      <h1 className="font-deva text-4xl">अन्वेषण</h1>
      <p className="mb-6 mt-1 text-muted">Search every verse, in Devanagari, Roman letters or English.</p>
      <Suspense>
        <SearchClient />
      </Suspense>
    </>
  );
}
