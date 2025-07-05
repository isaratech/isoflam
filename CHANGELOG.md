# Changelog

All notable changes to the Isoflam project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2] - 2025-07-05

### Added
- Advanced settings accordion in UI components
- Customizable corner radius for rectangles
- Rectangle style options (SOLID, DASHED, NONE)
- Adjustable width for rectangle borders
- Adjustable label height for nodes
- Horizontal and vertical mirroring options for icons
- Option to show/hide direction triangles on connectors
- Enhanced icon categorization system with intelligent mapping to user-friendly categories
- Improved text size controls with adjustable font scaling

### Changed
- Adjusted scale factor for vehicle icons to improve visibility
- Updated icon generation script with better subcategory detection and mapping

### Fixed
- Connector x-coordinates mirroring issue

### Fixed
- Connector x-coordinates mirroring issue

## [1.1] - 2025-06-01

### Added
- Full scene modeling with detailed vehicles, personnel, and equipment placement
- Advanced drawing tools for shapes, arrows, and zones with customizable properties
- Text annotation capabilities with rich formatting options (font size, style, color)
- Enhanced image export functionality with configurable resolution and format options (PNG, JPG)
- Comprehensive firefighting-specific icon library with categorized collections (vehicles, personnel, equipment)
- Drag-and-drop editor interface with intuitive controls for element manipulation
- Context menu for quick access to common actions (copy, paste, delete, bring to front/back)
- Transform controls for precise element positioning, resizing, and rotation
- Connector labels for improved communication clarity and operational documentation
- Advanced color selection tools with custom color support and opacity controls
- Undo/redo functionality for all editing operations
- Keyboard shortcuts for common actions to improve workflow efficiency
- Layer management system for organizing complex scenes

### Changed
- Improved isometric view rendering for clearer scene representation and depth perception
- Enhanced user interface with better tool organization, accessibility, and visual feedback
- Upgraded grid system for more precise element placement and alignment options
- Optimized performance for complex scenes with many elements through rendering improvements
- Refined element selection mechanism with multi-select capabilities
- Improved connector routing algorithm for cleaner diagrams
- Enhanced zoom and pan controls for better navigation experience

### Fixed
- Element selection and manipulation issues from version 1.0 (selection box accuracy, drag precision)
- Inconsistent rendering of isometric elements across different zoom levels
- Export quality issues in certain browsers (Chrome, Firefox, Safari)
- Text rendering inconsistencies when scaling elements
- Performance degradation with large numbers of elements
- Memory leaks during prolonged editing sessions
- Browser compatibility issues with older versions of Edge and Firefox

## [1.0] - 2025-05-01

### Added
- Initial release of isometric drawing software for firefighters
- Basic scene modeling with simple node placement and connection capabilities
- Fundamental drawing tools for rectangles, circles, lines, and connectors
- Preliminary icon set for essential firefighting elements (basic vehicles, personnel)
- Basic text annotation functionality with simple formatting options
- Simple export to image capability (PNG format)
- Grid-based layout system for element alignment and positioning
- Zoom controls for scene navigation and detail work
- Main menu with essential file operations (new, save, load, export)
- Basic color customization for scene elements and background
- Simple selection tools for element manipulation
- Snap-to-grid functionality for precise placement
- Basic tooltips and help documentation
- Responsive design supporting desktop browsers
