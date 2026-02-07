# Changelog

All notable changes to this project will be documented in this file.

## [1.1.3] - 2026-02-07

### Added
- **Power-of-2 Optimizations**: Implemented a specialized, high-performance encoding and decoding path for bases that are powers of 2 (Base16, Base32, Base64, etc.).
  - Automatically detects if the alphabet length is a power of 2.
  - Switches from generic polynomial arithmetic to bitwise shifting and masking.
  - **Performance**: Achieves approximately 5x-7x faster encoding and decoding for compatible bases.

### Changed
- Refactored internal logic to support multiple encoding strategies while maintaining the existing API.
- Updated benchmarks to track performance across Base16, Base32, Base64, and Base58.

## [1.1.0]

### Added
- Initial TypeScript support and type definitions.

### Changed
- Modernized codebase to ES modules.
