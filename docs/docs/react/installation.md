---
id: installation
title: Installation
sidebar_position: 2
---

# Getting Started

At this current moment we don't have an out of the back workspace setup. In order to use nxext/react you need to create a new NX workspace.

```bash
npx create-nx-workspace --preset=empty
```

After creating the blank workspace. Run the following commands

```bash npm2yarn
npm install @nxext/react --save
```

## Generating scaffolding

### Application

```bash
npx nx g @nxext/react:app [name]
```

### Library

```bash
npx nx g @nxext/react:lib [name]
```
