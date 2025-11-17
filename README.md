# Mortgage Refinance Calculator<sup>BETA</sup>

A modern, responsive web application for calculating whether you should refinance your mortgage. Built with SvelteKit and Tailwind CSS, this calculator helps you make informed decisions about mortgage refinancing by comparing your current mortgage against potential refinance options.

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

