"use client";

import React from "react";
import { useParams } from "next/navigation";
import { CollectionStudioEditor } from "@/components/collections/collection-editor";

export default function CustomizeCollectionPage() {
  const params = useParams<{ id: string }>();
  return <CollectionStudioEditor mode="edit" collectionId={params.id} />;
}
