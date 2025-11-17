# Mortgage Refinance Calculator<sup>BETA</sup>

A modern, responsive web application for calculating whether you should refinance your mortgage. Built with SvelteKit and Tailwind CSS, this calculator helps you make informed decisions about mortgage refinancing by comparing your current mortgage against potential refinance options.

## Features

- **Smart Input Formatting**
  - Currency inputs with automatic comma separators and $ prefix
  - Percentage inputs with % suffix (non-deletable)
  - Year and month units automatically displayed
  - Natural cursor position handling during formatting

- **Real-time Calculations**
  - Instant feedback on monthly payment changes
  - Total savings/costs analysis
  - Breakeven point calculation in months
  - Total refinance costs estimation

- **Visual Feedback**
  - Green highlights when refinancing saves money
  - Red highlights with warning messages when it costs money
  - Clean, modern UI with Tailwind CSS
  - Responsive design for mobile and desktop

- **Static Site Generation**
  - Fully prerendered for fast loading
  - No server required - deploy anywhere
  - SEO-friendly static HTML

## Technologies

- **[SvelteKit](https://kit.svelte.dev/)** - Modern web framework
- **[Svelte 5](https://svelte.dev/)** - Reactive UI with new runes syntax
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[@sveltejs/adapter-static](https://kit.svelte.dev/docs/adapter-static)** - Static site generation

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# Navigate to http://localhost:5173
```

### Development

```bash
# Run dev server with hot reload
npm run dev

# Type checking
npm run check

# Watch mode for type checking
npm run check:watch

# Lint code
npm run lint

# Format code
npm run format
```

### Building

```bash
# Build static site
npm run build

# Preview production build
npm run preview
```

The static site will be generated in the `build/` directory and can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

## How to Use

### Current Mortgage Section
1. Enter your original loan size (home price - down payment)
2. Input your original loan term in years
3. Enter your current interest rate as a percentage
4. Specify how many months you've already paid
5. Enter your down payment amount

### Refinance Options Section
1. Enter the new interest rate you're being offered
2. Specify the new loan term in years
3. Input the refinancing cost as a percentage of the loan amount

The calculator will automatically show:
- Your current monthly payment
- New monthly payment after refinancing
- Monthly savings (or additional cost)
- Total refinancing costs
- Number of months to break even

## Project Structure

```
mortgages/
├── src/
│   └── routes/
│       ├── +page.svelte      # Main calculator application
│       └── +layout.ts         # Prerender configuration
├── build/                     # Generated static site (after build)
├── package.json
├── svelte.config.js           # SvelteKit configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── vite.config.js             # Vite configuration
```

## Calculations

The calculator uses standard financial formulas:

- **PMT (Payment)**: Calculates monthly payment using present value, rate, and term
- **PV (Present Value)**: Calculates remaining loan balance after N payments
- **Breakeven**: Total refinance costs ÷ monthly savings

## License

This project is private and for personal use.

## Development Notes

This project uses Svelte 5's new runes syntax (`$state`, `$derived`) for reactive state management. The static adapter ensures the entire site is prerendered at build time for optimal performance and portability.
