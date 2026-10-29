import { test, expect } from "@playwright/test";

test.describe("ChatVault E2E Flows", () => {
  test("Landing page loads and navigates to Demo Dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Your AI Conversations/i })
    ).toBeVisible();

    await page.getByRole("button", { name: /Explore Live Demo Vault/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: /Knowledge Command Center/i })
    ).toBeVisible();
  });

  test("Collection Studio creates a custom collection and persists it", async ({
    page,
  }) => {
    await page.goto("/collections/new");
    await page.getByLabel(/Collection Title/i).fill("Distributed Systems & Consensus");
    await page
      .getByLabel(/Academic \/ Technical Description/i)
      .fill("Raft leader election, Paxos quorum proofs, and vector clocks.");
    await page.getByRole("button", { name: /Deploy Vault/i }).click();

    await expect(page).toHaveURL(/\/collections\/col-distributed-systems/);
    await expect(
      page.getByRole("heading", { name: /Distributed Systems & Consensus/i })
    ).toBeVisible();
  });

  test("Import Center loads sample ChatGPT export and commits conversations", async ({
    page,
  }) => {
    await page.goto("/imports");
    await page
      .getByRole("button", { name: /Load Sample ChatGPT Export/i })
      .click();
    await expect(
      page.getByText(/Fast Fourier Transform \(FFT\)/i)
    ).toBeVisible();

    await page
      .getByRole("button", { name: /Import 2 Conversations/i })
      .click();
    await expect(page).toHaveURL(/\/conversations/);
    await expect(
      page.getByText(/Fast Fourier Transform \(FFT\)/i)
    ).toBeVisible();
  });

  test("Conversation Reader renders transcript, LaTeX, code, and saves study notes", async ({
    page,
  }) => {
    await page.goto("/conversations/conv-schrodinger-wave-equation");
    await expect(
      page.getByRole("heading", {
        name: /Understanding Schrödinger's Wave Equation/i,
      })
    ).toBeVisible();

    const scratchpad = page.getByLabel(/Study notes scratchpad/i);
    await scratchpad.fill("Exam reminder: check boundary continuity at x=L");
    await expect(page.getByText(/Saved/i)).toBeVisible();
  });
});
