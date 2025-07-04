# Isoflam Project Guidelines for Junie

## Project Overview
Isoflam is an isometric drawing software designed for firefighters. It allows quick scene modeling by placing elements such as vehicles, personnel, and equipment, drawing shapes, arrows, or zones, and adding text. The final diagram can be exported as an image to support operational communication or post-incident reporting.

## Project Structure
- `/src` - Main source code directory
  - `/assets` - Static assets like images and icons
  - `/components` - React components organized by feature
  - `/hooks` - Custom React hooks
  - `/stores` - State management using Zustand
  - `/translations` - Internationalization files
  - `/utils` - Utility functions
  - `/types` - TypeScript type definitions
  - `/schemas` - Data validation schemas (Zod)
  - `/fixtures` - Test fixtures and mock data

## Testing Guidelines
- **Always run tests** when making changes to verify functionality
- Run tests using: `npm test`
- Tests are written using Jest and React Testing Library
- When fixing bugs, add tests to prevent regression

## Build Process
- The project uses Webpack for building
- Run development server: `npm start`
- Build for production: `npm run build`
- Before submitting changes, ensure the project builds without errors

## Code Style Guidelines
- The project uses ESLint and Prettier for code formatting
- Follow the existing code style patterns
- Use TypeScript for type safety
- Use functional components with hooks
- State management is done with Zustand
- Follow the component structure in the existing codebase

## Pull Request Guidelines
- Ensure all tests pass
- Make sure the code builds without errors
- Follow the code style guidelines
- Provide a clear description of changes

## License
This project is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0). Any contributions must comply with this license.
