# Epistemic Me TypeScript SDK

A TypeScript client SDK for interacting with the Epistemic Me API.

## Overview

This SDK provides a web client interface for the Epistemic Me API, allowing you to interact with the belief system, dialectics, and other core features of Epistemic Me.

## Installation

```bash
npm install @epistemicme/sdk
```

## Quick Start

```typescript
import { EpistemicMeClient } from '@epistemicme/sdk';

const client = new EpistemicMeClient({
  baseUrl: 'https://api.epistemic.me'
});

// Create a belief
const belief = await client.createBelief({
  userId: 'user-123',
  beliefContent: 'Regular exercise improves mental clarity'
});

// List beliefs
const beliefs = await client.listBeliefs({
  userId: 'user-123'
});
```

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm
- Git

### Setup

1. Clone the repository:
```bash
git clone --recursive https://github.com/Epistemic-Me/Typescript-SDK.git
```

2. Install dependencies:
```bash
npm install
```

3. Generate proto files:
```bash
npm run generate
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Documentation

This project uses TypeDoc to generate API documentation from TypeScript source code and comments.

To generate the documentation:
```bash
npm run docs
```

This will create a `docs` directory containing HTML documentation. You can view it by opening `docs/index.html` in your web browser.

For development, you might want to run:
```bash
npm run docs && open docs/index.html  # On macOS
npm run docs && start docs/index.html  # On Windows
```

## License

[License details here]
