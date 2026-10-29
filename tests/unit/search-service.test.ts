import { describe, it, expect } from "vitest";
import { executeVaultSearch } from "@/lib/search/search-service";
import {
  DEMO_COLLECTIONS,
  DEMO_CONVERSATIONS,
  DEMO_MESSAGES,
  DEMO_STUDY_NOTES,
} from "@/lib/demo-data";

describe("MiniSearch Vault Search Service", () => {
  it("finds conversations by title, formula, and code content", () => {
    const schrodingerRes = executeVaultSearch(
      "Schrödinger Dirichlet",
      DEMO_CONVERSATIONS,
      DEMO_MESSAGES,
      DEMO_COLLECTIONS,
      DEMO_STUDY_NOTES
    );
    expect(schrodingerRes.hits.length).toBeGreaterThan(0);
    expect(schrodingerRes.hits[0].conversation.id).toBe(
      "conv-schrodinger-wave-equation"
    );

    const codeRes = executeVaultSearch(
      "eigh_tridiagonal",
      DEMO_CONVERSATIONS,
      DEMO_MESSAGES,
      DEMO_COLLECTIONS,
      DEMO_STUDY_NOTES,
      { scope: "code" }
    );
    expect(codeRes.hits.length).toBeGreaterThan(0);
    expect(codeRes.hits[0].conversation.id).toBe(
      "conv-schrodinger-wave-equation"
    );
  });

  it("filters search results by collection, provider, and favorites", () => {
    const claudeOnly = executeVaultSearch(
      "",
      DEMO_CONVERSATIONS,
      DEMO_MESSAGES,
      DEMO_COLLECTIONS,
      DEMO_STUDY_NOTES,
      { provider: "claude" }
    );
    expect(claudeOnly.hits.length).toBeGreaterThan(0);
    expect(
      claudeOnly.hits.every((h) => h.conversation.sourceProvider === "claude")
    ).toBe(true);

    const dsaOnly = executeVaultSearch(
      "",
      DEMO_CONVERSATIONS,
      DEMO_MESSAGES,
      DEMO_COLLECTIONS,
      DEMO_STUDY_NOTES,
      { collectionId: "col-dsa" }
    );
    expect(dsaOnly.hits).toHaveLength(1);
    expect(dsaOnly.hits[0].conversation.id).toBe("conv-bst-avl-rotations");
  });
});
