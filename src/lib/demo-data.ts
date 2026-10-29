import type {
  Collection,
  Conversation,
  Message,
  StudyNote,
  ImportJob,
  UserPreferences,
} from "@/types/entities";

export const DEFAULT_PREFERENCES: UserPreferences = {
  id: "default",
  userName: "Alex Chen",
  userRole: "CS & Physics Archive",
  themeMode: "obsidian",
  accentTheme: "violet",
  readingFontSize: "md",
  readingDensity: "comfortable",
  codeBlockWrap: true,
  codeLineNumbers: true,
  reducedMotion: false,
  defaultCollectionView: "grid",
  hasCompletedOnboarding: false,
  demoModeActive: true,
  createdAt: "2025-10-01T10:00:00.000Z",
  updatedAt: "2025-10-29T10:00:00.000Z",
};

export const DEMO_COLLECTIONS: Collection[] = [
  {
    id: "col-engineering-physics",
    name: "Engineering Physics",
    slug: "engineering-physics",
    description:
      "Quantum wave functions, Maxwell's electromagnetic equations, relativistic mechanics, and solid-state band theory derivations.",
    icon: "science",
    accentColor: "violet",
    coverStyle: "quantum-wave",
    coverImageUrl: null,
    tags: ["Quantum", "Optics", "Thermodynamics", "Electromagnetism"],
    isFavorite: true,
    isDefault: false,
    isDemo: true,
    sortOrder: 1,
    createdAt: "2025-09-12T08:00:00.000Z",
    updatedAt: "2025-10-29T09:40:00.000Z",
  },
  {
    id: "col-dsa",
    name: "Data Structures & Algorithms",
    slug: "data-structures-algorithms",
    description:
      "AVL rotations, Red-Black trees, dynamic programming memoization tables, Dijkstra shortest-path proofs, and complexity bounds.",
    icon: "account_tree",
    accentColor: "cyan",
    coverStyle: "binary-tree",
    coverImageUrl: null,
    tags: ["Trees", "Graphs", "DP", "Complexity"],
    isFavorite: true,
    isDefault: false,
    isDemo: true,
    sortOrder: 2,
    createdAt: "2025-09-14T10:00:00.000Z",
    updatedAt: "2025-10-28T16:20:00.000Z",
  },
  {
    id: "col-c-systems",
    name: "C Programming & Systems",
    slug: "c-programming-systems",
    description:
      "Pointer arithmetic, heap vs stack frames, Valgrind leak diagnostics, POSIX threads, and custom slab memory allocators.",
    icon: "memory",
    accentColor: "emerald",
    coverStyle: "memory-registers",
    coverImageUrl: null,
    tags: ["Pointers", "POSIX", "Memory", "Kernel"],
    isFavorite: true,
    isDefault: false,
    isDemo: true,
    sortOrder: 3,
    createdAt: "2025-09-16T11:30:00.000Z",
    updatedAt: "2025-10-27T19:15:00.000Z",
  },
  {
    id: "col-mathematics",
    name: "Mathematics & Linear Algebra",
    slug: "mathematics-linear-algebra",
    description:
      "Singular Value Decomposition (SVD), eigenvalue diagonalization, multivariable vector calculus, and Fourier harmonic analysis.",
    icon: "functions",
    accentColor: "violet",
    coverStyle: "linear-algebra",
    coverImageUrl: null,
    tags: ["Eigenvalues", "Calculus", "SVD", "Fourier"],
    isFavorite: false,
    isDefault: false,
    isDemo: true,
    sortOrder: 4,
    createdAt: "2025-09-18T14:00:00.000Z",
    updatedAt: "2025-10-25T12:10:00.000Z",
  },
  {
    id: "col-ai-ml",
    name: "AI & Machine Learning",
    slug: "ai-machine-learning",
    description:
      "Multi-head self-attention in PyTorch, backpropagation Jacobian derivations, LoRA fine-tuning, and CUDA kernel fusion notes.",
    icon: "neurology",
    accentColor: "cyan",
    coverStyle: "neural-grid",
    coverImageUrl: null,
    tags: ["Transformers", "PyTorch", "Backprop", "CUDA"],
    isFavorite: true,
    isDefault: false,
    isDemo: true,
    sortOrder: 5,
    createdAt: "2025-09-20T09:15:00.000Z",
    updatedAt: "2025-10-26T21:00:00.000Z",
  },
  {
    id: "col-personal-projects",
    name: "Personal Projects & Build Log",
    slug: "personal-projects-build-log",
    description:
      "System architecture notes, Next.js App Router patterns, Rust CLI tooling, SQLite WAL concurrency, and deployment pipelines.",
    icon: "rocket_launch",
    accentColor: "emerald",
    coverStyle: "rust-architecture",
    coverImageUrl: null,
    tags: ["Rust", "Next.js", "SQLite", "Architecture"],
    isFavorite: false,
    isDefault: true,
    isDemo: true,
    sortOrder: 6,
    createdAt: "2025-09-22T17:45:00.000Z",
    updatedAt: "2025-10-24T15:30:00.000Z",
  },
];

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-schrodinger-wave-equation",
    externalId: "ext-chatgpt-001",
    sourceProvider: "chatgpt",
    modelName: "ChatGPT-4o",
    title: "Understanding Schrödinger's Wave Equation & Boundary Conditions",
    summary:
      "Derivation of the 1D time-independent Schrödinger equation for an infinite square potential well, Dirichlet boundary conditions at x=0 and x=L, probability density normalization, and Python eigenstate simulation.",
    createdAt: "2025-10-24T14:28:00.000Z",
    updatedAt: "2025-10-29T09:30:00.000Z",
    importedAt: "2025-10-24T15:00:00.000Z",
    collectionIds: ["col-engineering-physics"],
    tags: ["QuantumPhysics", "DifferentialEquations", "WaveMechanics", "LaTeX"],
    isFavorite: true,
    isArchived: false,
    isDemo: true,
    messageCount: 6,
    wordCount: 840,
    codeBlockCount: 2,
    formulaCount: 5,
    hasCode: true,
    hasMath: true,
    lastViewedAt: "2025-10-29T09:30:00.000Z",
    featuredSnippet: {
      type: "MATH",
      label: "Governing Equation",
      content: "-\\frac{\\hbar^2}{2m} \\nabla^2 \\psi(x) + V(x)\\psi(x) = E\\psi(x)",
    },
  },
  {
    id: "conv-pointers-memory-leak-c",
    externalId: "ext-chatgpt-002",
    sourceProvider: "chatgpt",
    modelName: "ChatGPT-4o",
    title: "Pointers, Heap vs Stack & Memory Leak Debugging in C",
    summary:
      "Step-by-step Valgrind heap trace analysis, resolving double-free corruption and dangling pointers in a lock-free ring buffer implementation in C99.",
    createdAt: "2025-10-22T18:10:00.000Z",
    updatedAt: "2025-10-28T20:15:00.000Z",
    importedAt: "2025-10-23T09:00:00.000Z",
    collectionIds: ["col-c-systems"],
    tags: ["C99", "Valgrind", "MemorySafety", "Pointers"],
    isFavorite: true,
    isArchived: false,
    isDemo: true,
    messageCount: 4,
    wordCount: 620,
    codeBlockCount: 2,
    formulaCount: 0,
    hasCode: true,
    hasMath: false,
    lastViewedAt: "2025-10-28T20:15:00.000Z",
    featuredSnippet: {
      type: "TRACE",
      label: "ring_buffer_free.c",
      content: "valgrind: 0 errors from 0 contexts (suppressed: 0 from 0)",
    },
  },
  {
    id: "conv-bst-avl-rotations",
    externalId: "ext-claude-003",
    sourceProvider: "claude",
    modelName: "Claude 3.5 Sonnet",
    title: "Binary Search Tree Rebalancing & AVL Rotations",
    summary:
      "Visualizing Left-Right (LR) and Right-Left (RL) double tree rotations, maintaining O(log n) height invariants, and implementing non-recursive balance factor updates.",
    createdAt: "2025-10-19T11:45:00.000Z",
    updatedAt: "2025-10-28T11:00:00.000Z",
    importedAt: "2025-10-20T08:30:00.000Z",
    collectionIds: ["col-dsa"],
    tags: ["AVL", "Trees", "Algorithms", "C++"],
    isFavorite: true,
    isArchived: false,
    isDemo: true,
    messageCount: 4,
    wordCount: 590,
    codeBlockCount: 2,
    formulaCount: 2,
    hasCode: true,
    hasMath: true,
    lastViewedAt: "2025-10-28T11:00:00.000Z",
    featuredSnippet: {
      type: "LOGIC",
      label: "avl_rotate.cpp",
      content: "RotateLeftRight(Node* z) -> BalanceFactor(z) in [-1, 0, 1]",
    },
  },
  {
    id: "conv-eigenvalues-diagonalization",
    externalId: "ext-chatgpt-004",
    sourceProvider: "chatgpt",
    modelName: "ChatGPT-o1",
    title: "Eigenvalues, Eigenvectors & Matrix Diagonalization Explained",
    summary:
      "Complete geometric and algebraic derivation of characteristic polynomials det(A - λI) = 0, spectral theorem for symmetric matrices, and fast matrix exponentiation.",
    createdAt: "2025-10-15T16:20:00.000Z",
    updatedAt: "2025-10-26T14:10:00.000Z",
    importedAt: "2025-10-16T10:00:00.000Z",
    collectionIds: ["col-mathematics"],
    tags: ["LinearAlgebra", "Eigenvalues", "SpectralTheorem", "Matrices"],
    isFavorite: true,
    isArchived: false,
    isDemo: true,
    messageCount: 4,
    wordCount: 530,
    codeBlockCount: 1,
    formulaCount: 4,
    hasCode: true,
    hasMath: true,
    lastViewedAt: "2025-10-26T14:10:00.000Z",
    featuredSnippet: {
      type: "MATH",
      label: "Spectral Decomposition",
      content: "\\det(A - \\lambda I) = 0 \\iff A = P D P^{-1}",
    },
  },
  {
    id: "conv-multi-head-attention-pytorch",
    externalId: "ext-chatgpt-005",
    sourceProvider: "chatgpt",
    modelName: "ChatGPT-4o",
    title: "Implementing Multi-Head Self-Attention from Scratch in PyTorch",
    summary:
      "Step-by-step tensor projection, scaled dot-product attention softmax causal masking, and batched Einstein summation (einsum) optimization for GPU memory strides.",
    createdAt: "2025-10-12T09:50:00.000Z",
    updatedAt: "2025-10-27T17:40:00.000Z",
    importedAt: "2025-10-13T12:00:00.000Z",
    collectionIds: ["col-ai-ml"],
    tags: ["PyTorch", "Transformers", "SelfAttention", "DeepLearning"],
    isFavorite: true,
    isArchived: false,
    isDemo: true,
    messageCount: 4,
    wordCount: 680,
    codeBlockCount: 2,
    formulaCount: 2,
    hasCode: true,
    hasMath: true,
    lastViewedAt: "2025-10-27T17:40:00.000Z",
    featuredSnippet: {
      type: "CODE",
      label: "attention.py",
      content: "attn = torch.softmax((q @ k.transpose(-2, -1)) / math.sqrt(d_k), dim=-1) @ v",
    },
  },
  {
    id: "conv-rust-sqlite-sidebar-sync",
    externalId: "ext-claude-006",
    sourceProvider: "claude",
    modelName: "Claude 3.5 Sonnet",
    title: "Building an Arc-Inspired Sidebar Sync Extension with Rust & SQLite",
    summary:
      "Cross-platform desktop IPC architecture between a WebExtension background worker and a local daemon compiled via Rust. Handled zero-lock SQLite concurrency via WAL mode.",
    createdAt: "2025-10-09T21:15:00.000Z",
    updatedAt: "2025-10-25T19:00:00.000Z",
    importedAt: "2025-10-10T09:00:00.000Z",
    collectionIds: ["col-personal-projects"],
    tags: ["Rust", "SQLite", "IPC", "Architecture"],
    isFavorite: true,
    isArchived: false,
    isDemo: true,
    messageCount: 4,
    wordCount: 540,
    codeBlockCount: 2,
    formulaCount: 0,
    hasCode: true,
    hasMath: false,
    lastViewedAt: "2025-10-25T19:00:00.000Z",
    featuredSnippet: {
      type: "CODE",
      label: "sqlite_wal_init.rs",
      content: "conn.execute_batch(\"PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;\")?;",
    },
  },
  {
    id: "conv-maxwell-equations-derivation",
    externalId: "ext-chatgpt-007",
    sourceProvider: "chatgpt",
    modelName: "ChatGPT-4o",
    title: "Deriving Maxwell's Equations in Differential & Integral Form",
    summary:
      "Applying Stokes' theorem and the Divergence theorem to convert Gauss's Law, Faraday's Law of Induction, and Ampère-Maxwell Law between integral and point-differential forms.",
    createdAt: "2025-10-06T13:00:00.000Z",
    updatedAt: "2025-10-24T10:30:00.000Z",
    importedAt: "2025-10-07T08:00:00.000Z",
    collectionIds: ["col-engineering-physics", "col-mathematics"],
    tags: ["Electromagnetism", "VectorCalculus", "MaxwellsEquations"],
    isFavorite: false,
    isArchived: false,
    isDemo: true,
    messageCount: 4,
    wordCount: 510,
    codeBlockCount: 0,
    formulaCount: 4,
    hasCode: false,
    hasMath: true,
    lastViewedAt: "2025-10-24T10:30:00.000Z",
    featuredSnippet: {
      type: "MATH",
      label: "Faraday's Law",
      content: "\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}",
    },
  },
  {
    id: "conv-quantum-tunneling-wkb",
    externalId: "ext-claude-008",
    sourceProvider: "claude",
    modelName: "Claude 3.5 Sonnet",
    title: "Particle in a Finite Potential Barrier & WKB Tunneling Approximation",
    summary:
      "Applying the WKB semi-classical approximation to the 1D Schrödinger equation in the classically forbidden regime and deriving exponential transmission decay.",
    createdAt: "2025-10-04T15:40:00.000Z",
    updatedAt: "2025-10-22T11:20:00.000Z",
    importedAt: "2025-10-05T09:10:00.000Z",
    collectionIds: ["col-engineering-physics"],
    tags: ["QuantumTunneling", "WKB", "QuantumPhysics"],
    isFavorite: false,
    isArchived: false,
    isDemo: true,
    messageCount: 4,
    wordCount: 470,
    codeBlockCount: 1,
    formulaCount: 3,
    hasCode: true,
    hasMath: true,
    lastViewedAt: null,
    featuredSnippet: {
      type: "MATH",
      label: "Transmission Coefficient",
      content: "T \\approx \\exp\\left(-\\frac{2}{\\hbar}\\int_{a}^{b} \\sqrt{2m(V(x)-E)}\\,dx\\right)",
    },
  },
];

export const DEMO_MESSAGES: Message[] = [
  // Conversation 1: Schrödinger's Wave Equation
  {
    id: "msg-schrod-1",
    conversationId: "conv-schrodinger-wave-equation",
    externalMessageId: "ext-m-101",
    role: "user",
    authorName: "Alex Chen",
    contentMarkdown:
      "Can you explain the derivation and physical intuition behind the 1D time-independent Schrödinger equation for a particle in an infinite potential well? Specifically show the normalization constant, Dirichlet boundary conditions at $x = 0$ and $x = L$, and a clean Python verification script.",
    contentPlainText:
      "Can you explain the derivation and physical intuition behind the 1D time-independent Schrödinger equation for a particle in an infinite potential well? Specifically show the normalization constant, Dirichlet boundary conditions at x = 0 and x = L, and a clean Python verification script.",
    createdAt: "2025-10-24T14:28:00.000Z",
    orderIndex: 0,
    hasCode: false,
    codeLanguages: [],
    isDemo: true,
  },
  {
    id: "msg-schrod-2",
    conversationId: "conv-schrodinger-wave-equation",
    externalMessageId: "ext-m-102",
    role: "assistant",
    authorName: "ChatGPT-4o",
    contentMarkdown: `### § 01 Boundary Condition Analysis & Governing Equation

Consider a non-relativistic quantum particle of mass $m$ constrained within an infinitely deep one-dimensional potential well between boundaries $x = 0$ and $x = L$. Outside this region, the potential energy $V(x) = \\infty$, so the probability of finding the particle outside the box is identically zero.

$$-\\frac{\\hbar^2}{2m} \\frac{d^2\\psi(x)}{dx^2} + V(x)\\psi(x) = E\\psi(x)$$

Inside the well ($0 < x < L$), $V(x) = 0$, which reduces the operator to the classic Helmholtz spatial differential equation:

$$\\frac{d^2\\psi(x)}{dx^2} + k^2\\psi(x) = 0, \\quad \\text{where } k = \\frac{\\sqrt{2mE}}{\\hbar}$$

The general solution is $\\psi(x) = A\\sin(kx) + B\\cos(kx)$. Applying **Dirichlet boundary continuity** at the walls:
- At $x = 0$: $\\psi(0) = B = 0$
- At $x = L$: $\\psi(L) = A\\sin(kL) = 0 \\implies k_n = \\frac{n\\pi}{L}$ for $n = 1, 2, 3, \\dots$

### § 02 Total Probability Normalization

To normalize the wave function over $[0, L]$, we enforce total probability unity:

$$\\int_{0}^{L} |\\psi_n(x)|^2\\,dx = |A|^2 \\int_{0}^{L} \\sin^2\\left(\\frac{n\\pi x}{L}\\right)\\,dx = |A|^2 \\left(\\frac{L}{2}\\right) = 1$$

Solving for $A$ yields $A = \\sqrt{\\frac{2}{L}}$, giving the normalized stationary eigenstates and quantized energy levels:

$$\\psi_n(x) = \\sqrt{\\frac{2}{L}} \\sin\\left(\\frac{n\\pi x}{L}\\right), \\qquad E_n = \\frac{n^2 \\pi^2 \\hbar^2}{2mL^2}$$

### § 03 Computational Verification in Python

\`\`\`python
import numpy as np
import scipy.linalg

def solve_infinite_well_wavefunction(n: int, L: float, x: np.ndarray) -> np.ndarray:
    """Computes normalized analytical eigenstate psi_n(x) for 1D infinite square well."""
    if n < 1:
        raise ValueError("Quantum state integer n must be >= 1")
    return np.sqrt(2.0 / L) * np.sin(n * np.pi * x / L)

def hamiltonian_tridiagonal(dx: float, N: int, m: float = 1.0, hbar: float = 1.0):
    """Finite difference discretization for 1D Schrödinger operator."""
    diag = (hbar ** 2) / (m * dx ** 2) * np.ones(N)
    off_diag = -0.5 * (hbar ** 2) / (m * dx ** 2) * np.ones(N - 1)
    return scipy.linalg.eigh_tridiagonal(diag, off_diag)
\`\`\`

### § 04 Physical Intuition & Zero-Point Energy

Notice that the lowest possible energy state ($n = 1$) is strictly non-zero:

$$\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2} \\implies E_1 = \\frac{\\pi^2 \\hbar^2}{2 m L^2} \\ne 0$$

If $E = 0$ were permitted, the particle would have zero momentum uncertainty ($\\Delta p = 0$), violating Heisenberg's Uncertainty Principle for a particle confined within finite width $L$.`,
    contentPlainText:
      "Consider a non-relativistic quantum particle of mass m constrained within an infinitely deep one-dimensional potential well between boundaries x = 0 and x = L. Outside this region, V(x) = infinity. Inside the well, -hbar^2/(2m) d^2psi/dx^2 = E psi. Applying Dirichlet boundary conditions at x=0 and x=L gives k_n = n*pi/L and normalized wave function psi_n(x) = sqrt(2/L) sin(n*pi*x/L) with quantized energy E_n = n^2 * pi^2 * hbar^2 / (2mL^2).",
    createdAt: "2025-10-24T14:29:10.000Z",
    orderIndex: 1,
    hasCode: true,
    codeLanguages: ["python"],
    isDemo: true,
  },
  {
    id: "msg-schrod-3",
    conversationId: "conv-schrodinger-wave-equation",
    externalMessageId: "ext-m-103",
    role: "user",
    authorName: "Alex Chen",
    contentMarkdown:
      "How do we compute the expectation values $\\langle x \\rangle$ and $\\langle p \\rangle$ for any stationary state $n$, and why does $\\langle x \\rangle = L/2$ regardless of $n$?",
    contentPlainText:
      "How do we compute the expectation values <x> and <p> for any stationary state n, and why does <x> = L/2 regardless of n?",
    createdAt: "2025-10-24T14:33:00.000Z",
    orderIndex: 2,
    hasCode: false,
    codeLanguages: [],
    isDemo: true,
  },
  {
    id: "msg-schrod-4",
    conversationId: "conv-schrodinger-wave-equation",
    externalMessageId: "ext-m-104",
    role: "assistant",
    authorName: "ChatGPT-4o",
    contentMarkdown: `Because the probability density $|\\psi_n(x)|^2 = \\frac{2}{L}\\sin^2\\left(\\frac{n\\pi x}{L}\\right)$ is symmetric about the midpoint $x = L/2$ for every integer $n$, the expectation value of position is always the center of the well:

$$\\langle x \\rangle = \\int_{0}^{L} x |\\psi_n(x)|^2\\,dx = \\frac{2}{L} \\int_{0}^{L} x \\sin^2\\left(\\frac{n\\pi x}{L}\\right)\\,dx = \\frac{L}{2}$$

Similarly, for a real-valued stationary bound state, the expectation value of momentum $\\langle p \\rangle$ is identically zero because the standing wave is an equal superposition of right-traveling ($+\\hbar k_n$) and left-traveling ($-\\hbar k_n$) momentum eigenstates:

$$\\langle p \\rangle = \\int_{0}^{L} \\psi_n^*(x) \\left(-i\\hbar \\frac{d}{dx}\\right) \\psi_n(x)\\,dx = 0$$`,
    contentPlainText:
      "Because the probability density |psi_n(x)|^2 is symmetric about the midpoint x = L/2 for every integer n, the expectation value of position <x> is always L/2. Similarly, <p> = 0 because the standing wave is an equal superposition of left and right traveling waves.",
    createdAt: "2025-10-24T14:34:05.000Z",
    orderIndex: 3,
    hasCode: false,
    codeLanguages: [],
    isDemo: true,
  },

  // Conversation 2: Pointers & Memory Leak Debugging in C
  {
    id: "msg-c-1",
    conversationId: "conv-pointers-memory-leak-c",
    externalMessageId: "ext-m-201",
    role: "user",
    authorName: "Alex Chen",
    contentMarkdown:
      "Valgrind reports `Invalid free() / delete / delete[]` and `24 bytes in 1 blocks are definitely lost` in my C ring buffer cleanup routine. How should I structure ownership and teardown?",
    contentPlainText:
      "Valgrind reports Invalid free() and 24 bytes in 1 blocks are definitely lost in my C ring buffer cleanup routine. How should I structure ownership and teardown?",
    createdAt: "2025-10-22T18:10:00.000Z",
    orderIndex: 0,
    hasCode: false,
    codeLanguages: [],
    isDemo: true,
  },
  {
    id: "msg-c-2",
    conversationId: "conv-pointers-memory-leak-c",
    externalMessageId: "ext-m-202",
    role: "assistant",
    authorName: "ChatGPT-4o",
    contentMarkdown: `When allocating a struct that owns an internal heap buffer, you must free the inner payload **before** freeing the outer container, and null-guard the pointer to prevent double-free vulnerabilities:

\`\`\`c
#include <stdlib.h>
#include <stdint.h>

typedef struct {
    uint8_t *data;
    size_t capacity;
    size_t head;
    size_t tail;
} RingBuf;

void ring_free(RingBuf **b_ptr) {
    if (!b_ptr || !(*b_ptr)) return;
    RingBuf *b = *b_ptr;
    free(b->data);
    b->data = NULL;
    free(b);
    *b_ptr = NULL;
}
\`\`\`

Passing a double pointer \`RingBuf **b_ptr\` zeroes the caller's pointer immediately after deallocation, ensuring clean Valgrind verification:

\`\`\`text
==41892== HEAP SUMMARY:
==41892==     in use at exit: 0 bytes in 0 blocks
==41892==   total heap usage: 64 allocs, 64 frees, 131,072 bytes allocated
==41892== All heap blocks were freed -- no leaks are possible
==41892== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
\`\`\``,
    contentPlainText:
      "When allocating a struct that owns an internal heap buffer, free the inner payload before freeing the outer container, and use a double pointer RingBuf **b_ptr to null out the caller reference.",
    createdAt: "2025-10-22T18:11:30.000Z",
    orderIndex: 1,
    hasCode: true,
    codeLanguages: ["c", "text"],
    isDemo: true,
  },

  // Conversation 3: AVL Rotations
  {
    id: "msg-avl-1",
    conversationId: "conv-bst-avl-rotations",
    externalMessageId: "ext-m-301",
    role: "user",
    authorName: "Alex Chen",
    contentMarkdown:
      "When inserting into an AVL tree, how do I tell when to perform a Left-Right (LR) double rotation vs a single Right rotation, and what is the exact pointer rewiring order?",
    contentPlainText:
      "When inserting into an AVL tree, how do I tell when to perform a Left-Right (LR) double rotation vs a single Right rotation, and what is the exact pointer rewiring order?",
    createdAt: "2025-10-19T11:45:00.000Z",
    orderIndex: 0,
    hasCode: false,
    codeLanguages: [],
    isDemo: true,
  },
  {
    id: "msg-avl-2",
    conversationId: "conv-bst-avl-rotations",
    externalMessageId: "ext-m-302",
    role: "assistant",
    authorName: "Claude 3.5 Sonnet",
    contentMarkdown: `For any node $z$, define the balance factor as $\\text{BF}(z) = \\text{height}(z.\\text{left}) - \\text{height}(z.\\text{right})$. An AVL violation occurs when $|\\text{BF}(z)| > 1$.

If $\\text{BF}(z) = +2$ (left-heavy):
1. **Left-Left (LL) Case** ($\\text{BF}(z.\\text{left}) \\ge 0$): Perform a single \`rotateRight(z)\`.
2. **Left-Right (LR) Case** ($\\text{BF}(z.\\text{left}) < 0$): First perform \`rotateLeft(z->left)\`, then \`rotateRight(z)\`.

\`\`\`cpp
Node* rotateLeft(Node* x) {
    Node* y = x->right;
    Node* T2 = y->left;
    y->left = x;
    x->right = T2;
    updateHeight(x);
    updateHeight(y);
    return y;
}

Node* rotateLeftRight(Node* z) {
    z->left = rotateLeft(z->left);
    return rotateRight(z);
}
\`\`\`

Each rotation executes in $O(1)$ pointer assignments and restores $\\text{BF}(z) \\in \\{-1, 0, 1\\}$.`,
    contentPlainText:
      "Define balance factor BF(z) = height(z.left) - height(z.right). If BF(z) == +2 and BF(z.left) < 0, it is a Left-Right (LR) case: first rotateLeft(z->left), then rotateRight(z).",
    createdAt: "2025-10-19T11:46:20.000Z",
    orderIndex: 1,
    hasCode: true,
    codeLanguages: ["cpp"],
    isDemo: true,
  },

  // Conversation 4: Eigenvalues & Matrix Diagonalization
  {
    id: "msg-eigen-1",
    conversationId: "conv-eigenvalues-diagonalization",
    externalMessageId: "ext-m-401",
    role: "user",
    authorName: "Alex Chen",
    contentMarkdown:
      "Show how matrix diagonalization $A = PDP^{-1}$ simplifies computing $A^k$ for coupled linear recurrence systems and Markov chains.",
    contentPlainText:
      "Show how matrix diagonalization A = P D P^-1 simplifies computing A^k for coupled linear recurrence systems and Markov chains.",
    createdAt: "2025-10-15T16:20:00.000Z",
    orderIndex: 0,
    hasCode: false,
    codeLanguages: [],
    isDemo: true,
  },
  {
    id: "msg-eigen-2",
    conversationId: "conv-eigenvalues-diagonalization",
    externalMessageId: "ext-m-402",
    role: "assistant",
    authorName: "ChatGPT-o1",
    contentMarkdown: `Suppose $A \\in \\mathbb{R}^{n \\times n}$ has $n$ linearly independent eigenvectors $v_1, \\dots, v_n$ satisfying $Av_i = \\lambda_i v_i$, determined by the characteristic polynomial:

$$\\det(A - \\lambda I) = 0$$

Constructing $P = [v_1 \\; v_2 \\; \\cdots \\; v_n]$ and $D = \\text{diag}(\\lambda_1, \\dots, \\lambda_n)$, we have $A = PDP^{-1}$. Raising $A$ to the $k$-th power telescopes all interior $P^{-1}P = I$ terms:

$$A^k = (PDP^{-1})(PDP^{-1})\\cdots(PDP^{-1}) = P D^k P^{-1} = P \\begin{pmatrix} \\lambda_1^k & 0 \\\\ 0 & \\lambda_n^k \\end{pmatrix} P^{-1}$$

When $A$ is real symmetric ($A = A^T$), the **Spectral Theorem** guarantees orthogonal eigenvectors ($P^{-1} = P^T$), eliminating matrix inversion entirely.`,
    contentPlainText:
      "When A has n linearly independent eigenvectors solving det(A - lambda I) = 0, A = P D P^-1 and A^k = P D^k P^-1, reducing matrix exponentiation to scalar powers of eigenvalues.",
    createdAt: "2025-10-15T16:21:15.000Z",
    orderIndex: 1,
    hasCode: false,
    codeLanguages: [],
    isDemo: true,
  },

  // Conversation 5: Multi-Head Self-Attention in PyTorch
  {
    id: "msg-attn-1",
    conversationId: "conv-multi-head-attention-pytorch",
    externalMessageId: "ext-m-501",
    role: "user",
    authorName: "Alex Chen",
    contentMarkdown:
      "Write a clean, production-grade `MultiHeadAttention` module in PyTorch with causal masking and explain why we scale by $1/\\sqrt{d_k}$.",
    contentPlainText:
      "Write a clean, production-grade MultiHeadAttention module in PyTorch with causal masking and explain why we scale by 1/sqrt(d_k).",
    createdAt: "2025-10-12T09:50:00.000Z",
    orderIndex: 0,
    hasCode: false,
    codeLanguages: [],
    isDemo: true,
  },
  {
    id: "msg-attn-2",
    conversationId: "conv-multi-head-attention-pytorch",
    externalMessageId: "ext-m-502",
    role: "assistant",
    authorName: "ChatGPT-4o",
    contentMarkdown: `Scaled Dot-Product Attention computes:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}} + M\\right)V$$

If $q, k \\sim \\mathcal{N}(0, 1)$, their dot product $q \\cdot k = \\sum_{i=1}^{d_k} q_i k_i$ has variance $d_k$. Dividing by $\\sqrt{d_k}$ restores unit variance so softmax does not saturate into vanishing-gradient regions.

\`\`\`python
import math
import torch
import torch.nn as nn

class CausalMultiHeadAttention(nn.Module):
    def __init__(self, d_model: int, num_heads: int):
        super().__init__()
        assert d_model % num_heads == 0
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        self.qkv = nn.Linear(d_model, 3 * d_model, bias=False)
        self.proj = nn.Linear(d_model, d_model, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, T, C = x.shape
        q, k, v = self.qkv(x).chunk(3, dim=-1)
        q = q.view(B, T, self.num_heads, self.d_k).transpose(1, 2)
        k = k.view(B, T, self.num_heads, self.d_k).transpose(1, 2)
        v = v.view(B, T, self.num_heads, self.d_k).transpose(1, 2)

        scores = (q @ k.transpose(-2, -1)) * (1.0 / math.sqrt(self.d_k))
        mask = torch.triu(torch.ones(T, T, device=x.device), diagonal=1).bool()
        scores = scores.masked_fill(mask, float("-inf"))
        attn = torch.softmax(scores, dim=-1) @ v
        return self.proj(attn.transpose(1, 2).contiguous().view(B, T, C))
\`\`\``,
    contentPlainText:
      "Scaled Dot-Product Attention divides QK^T by sqrt(d_k) to preserve unit variance before softmax. CausalMultiHeadAttention projects Q, K, V in a single fused Linear layer and applies an upper-triangular causal mask.",
    createdAt: "2025-10-12T09:51:40.000Z",
    orderIndex: 1,
    hasCode: true,
    codeLanguages: ["python"],
    isDemo: true,
  },

  // Conversation 6: Rust & SQLite Sidebar Sync
  {
    id: "msg-rust-1",
    conversationId: "conv-rust-sqlite-sidebar-sync",
    externalMessageId: "ext-m-601",
    role: "user",
    authorName: "Alex Chen",
    contentMarkdown:
      "How do I configure `rusqlite` in my Rust native messaging daemon so concurrent browser tabs can read/write bookmarks without `SQLITE_BUSY` locking errors?",
    contentPlainText:
      "How do I configure rusqlite in my Rust native messaging daemon so concurrent browser tabs can read/write bookmarks without SQLITE_BUSY locking errors?",
    createdAt: "2025-10-09T21:15:00.000Z",
    orderIndex: 0,
    hasCode: false,
    codeLanguages: [],
    isDemo: true,
  },
  {
    id: "msg-rust-2",
    conversationId: "conv-rust-sqlite-sidebar-sync",
    externalMessageId: "ext-m-602",
    role: "assistant",
    authorName: "Claude 3.5 Sonnet",
    contentMarkdown: `Enable **Write-Ahead Logging (\`WAL\`)** alongside a busy timeout upon initializing the SQLite connection in Rust:

\`\`\`rust
use rusqlite::{Connection, Result};
use std::time::Duration;

pub fn init_vault_db(path: &str) -> Result<Connection> {
    let conn = Connection::open(path)?;
    conn.busy_timeout(Duration::from_millis(5000))?;
    conn.execute_batch(
        "PRAGMA journal_mode=WAL;
         PRAGMA synchronous=NORMAL;
         PRAGMA foreign_keys=ON;
         PRAGMA temp_store=MEMORY;"
    )?;
    Ok(conn)
}
\`\`\`

With ` + "`journal_mode=WAL`" + `, readers never block writers and writers never block readers.`,
    contentPlainText:
      "Enable Write-Ahead Logging (PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;) and set conn.busy_timeout(Duration::from_millis(5000)) in rusqlite so readers never block writers.",
    createdAt: "2025-10-09T21:16:10.000Z",
    orderIndex: 1,
    hasCode: true,
    codeLanguages: ["rust"],
    isDemo: true,
  },

  // Conversation 7: Maxwell's Equations
  {
    id: "msg-maxwell-1",
    conversationId: "conv-maxwell-equations-derivation",
    externalMessageId: "ext-m-701",
    role: "user",
    authorName: "Alex Chen",
    contentMarkdown:
      "Summarize the four Maxwell equations in both integral and differential form and show how Stokes' theorem links Faraday's law.",
    contentPlainText:
      "Summarize the four Maxwell equations in both integral and differential form and show how Stokes' theorem links Faraday's law.",
    createdAt: "2025-10-06T13:00:00.000Z",
    orderIndex: 0,
    hasCode: false,
    codeLanguages: [],
    isDemo: true,
  },
  {
    id: "msg-maxwell-2",
    conversationId: "conv-maxwell-equations-derivation",
    externalMessageId: "ext-m-702",
    role: "assistant",
    authorName: "ChatGPT-4o",
    contentMarkdown: `Using Stokes' Theorem on Faraday's integral law around a stationary loop $\\partial \\Sigma$:

$$\\oint_{\\partial \\Sigma} \\mathbf{E} \\cdot d\\mathbf{l} = \\iint_{\\Sigma} (\\nabla \\times \\mathbf{E}) \\cdot d\\mathbf{A} = -\\iint_{\\Sigma} \\frac{\\partial \\mathbf{B}}{\\partial t} \\cdot d\\mathbf{A}$$

Since this holds for any arbitrary surface $\\Sigma$, the integrands must be equal pointwise:

$$\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}, \\qquad \\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}$$`,
    contentPlainText:
      "Using Stokes' Theorem on Faraday's integral law converts the line integral of E around dSigma into the surface integral of curl E, yielding curl E = -dB/dt.",
    createdAt: "2025-10-06T13:01:25.000Z",
    orderIndex: 1,
    hasCode: false,
    codeLanguages: [],
    isDemo: true,
  },

  // Conversation 8: Quantum Tunneling WKB
  {
    id: "msg-wkb-1",
    conversationId: "conv-quantum-tunneling-wkb",
    externalMessageId: "ext-m-801",
    role: "user",
    authorName: "Alex Chen",
    contentMarkdown:
      "How does the WKB approximation estimate quantum tunneling probability through a spatially varying barrier $V(x) > E$?",
    contentPlainText:
      "How does the WKB approximation estimate quantum tunneling probability through a spatially varying barrier V(x) > E?",
    createdAt: "2025-10-04T15:40:00.000Z",
    orderIndex: 0,
    hasCode: false,
    codeLanguages: [],
    isDemo: true,
  },
  {
    id: "msg-wkb-2",
    conversationId: "conv-quantum-tunneling-wkb",
    externalMessageId: "ext-m-802",
    role: "assistant",
    authorName: "Claude 3.5 Sonnet",
    contentMarkdown: `In the classically forbidden barrier region $a \\le x \\le b$ where $V(x) > E$, the local spatial decay rate is $\\kappa(x) = \\frac{\\sqrt{2m(V(x) - E)}}{\\hbar}$. Under the WKB approximation, the transmission coefficient $T$ decays exponentially with the integrated barrier action:

$$T \\approx \\exp\\left(-2 \\int_{a}^{b} \\kappa(x)\\,dx\\right) = \\exp\\left(-\\frac{2}{\\hbar}\\int_{a}^{b} \\sqrt{2m(V(x)-E)}\\,dx\\right)$$`,
    contentPlainText:
      "In the classically forbidden region where V(x) > E, the WKB transmission probability is T = exp(-2/hbar * integral from a to b of sqrt(2m(V(x)-E)) dx).",
    createdAt: "2025-10-04T15:41:10.000Z",
    orderIndex: 1,
    hasCode: false,
    codeLanguages: [],
    isDemo: true,
  },
];

export const DEMO_STUDY_NOTES: StudyNote[] = [
  {
    id: "note-schrodinger-exam",
    conversationId: "conv-schrodinger-wave-equation",
    messageId: "msg-schrod-2",
    title: "Midterm Exam Note — Infinite Potential Well",
    contentMarkdown: `- **Dirichlet condition**: $\\psi(0) = \\psi(L) = 0$ because $V = \\infty$ outside.\n- Remember that ground state $n=1$ has **0 interior nodes**, $n=2$ has **1 interior node**, and $n$th state has $n-1$ interior nodes.\n- Compare $E_1 = \\frac{\\pi^2\\hbar^2}{2mL^2}$ with harmonic oscillator zero-point energy $E_0 = \\frac{1}{2}\\hbar\\omega$.`,
    tags: ["ExamPrep", "Quantum", "HighYield"],
    isPinned: true,
    isDemo: true,
    createdAt: "2025-10-24T15:10:00.000Z",
    updatedAt: "2025-10-29T09:30:00.000Z",
  },
  {
    id: "note-c-ringbuffer",
    conversationId: "conv-pointers-memory-leak-c",
    messageId: "msg-c-2",
    title: "Systems Lab #3 Memory Checklist",
    contentMarkdown: `- Always run \`valgrind --leak-check=full --show-leak-kinds=all ./ring_test\` before submitting.\n- Use \`RingBuf **b_ptr\` teardown pattern to prevent use-after-free.`,
    tags: ["SystemsLab", "Valgrind"],
    isPinned: true,
    isDemo: true,
    createdAt: "2025-10-23T11:00:00.000Z",
    updatedAt: "2025-10-28T20:15:00.000Z",
  },
];

export const DEMO_IMPORT_JOBS: ImportJob[] = [
  {
    id: "job-demo-oct-export",
    fileName: "chatgpt-export-2025-10-24.zip",
    fileSizeBytes: 8814592,
    sourceType: "chatgpt_zip",
    status: "completed",
    totalConversationsFound: 8,
    conversationsImported: 8,
    DuplicatesSkipped: 0,
    invalidSkipped: 0,
    errorMessage: null,
    startedAt: "2025-10-24T14:59:52.000Z",
    completedAt: "2025-10-24T15:00:00.000Z",
    isDemo: true,
  },
];
