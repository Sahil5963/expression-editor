# Vercel Deployment Guide

This project is a monorepo with a library package and an example app. Follow these steps to deploy the example app to Vercel.

## Option 1: Deploy from Root (Recommended)

The repository includes a `vercel.json` configuration file that handles the monorepo setup automatically.

### Steps:

1. **Import Project to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your repository
   - **Important**: Set the **root directory** to `.` (the repository root, not `example`)

2. **Configure Build Settings**
   - Vercel will automatically use the settings from `vercel.json`
   - Build Command: `pnpm run build && pnpm --filter react-dynamic-expression-editor-example run build`
   - Output Directory: `example/dist`
   - Install Command: `pnpm install`

3. **Deploy**
   - Click "Deploy"
   - Vercel will build both the library and the example app

## Option 2: Manual Configuration (Alternative)

If you prefer to configure settings in the Vercel dashboard instead of using `vercel.json`:

1. **Project Settings**
   - Root Directory: `.` (repository root)
   - Framework Preset: Other

2. **Build & Development Settings**
   - Build Command: `pnpm run build && pnpm --filter react-dynamic-expression-editor-example run build`
   - Output Directory: `example/dist`
   - Install Command: `pnpm install`

## Troubleshooting

### Error: "Cannot find module 'react-dynamic-expression-editor'"

This error occurs when Vercel tries to build only the `example` directory without building the parent library first. Make sure:

1. Root directory is set to `.` (not `example`)
2. Build command includes building the library: `pnpm run build && cd example && pnpm run build`

### TypeScript Errors

The example app has been updated to properly type the `onChange` handlers. If you see TypeScript errors, make sure you're using the latest version of the code.

## Verified Configuration

The `vercel.json` file in the repository root contains the verified working configuration:

```json
{
  "buildCommand": "pnpm run build && pnpm --filter react-dynamic-expression-editor-example run build",
  "outputDirectory": "example/dist",
  "installCommand": "pnpm install",
  "framework": null
}
```

## Local Testing

Before deploying, test the build locally:

```bash
# Build library
pnpm run build

# Build example
cd example && pnpm run build

# Preview
pnpm run preview
```
