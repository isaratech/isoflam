![Isoflam Logo](docs/logo.png)

<div align="center">
    <h1>Isoflam - Isometric Drawing Software for Firefighters</h1>
</div>

<div align="center">

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

</div>

## About Isoflam

Isoflam is an isometric drawing software designed for firefighters. It allows quick scene modeling by placing elements such as vehicles, personnel, and equipment, drawing shapes, arrows, or zones, and adding text. The final diagram can be exported as an image to support operational communication or post-incident reporting.

## 🚀 Live Demo

Try the application online: **[https://isaratech.github.io/isoflam/](https://isaratech.github.io/isoflam/)**

## Application Preview

![Application Screenshot](docs/img1.png)
![Application Screenshot](docs/img2.png)
*Example of Isoflam application interface showing isometric scene modeling*

## Key Features

- **Drag-and-drop editor** - Quickly place firefighting vehicles, personnel, and equipment on your scene
- **Specialized icon library** - Comprehensive collection of firefighting-specific icons and symbols
- **Drawing tools** - Create shapes, arrows, zones, and add text annotations
- **Export capabilities** - Export diagrams as high-quality images for reports and communications
- **Isometric view** - Professional 3D-like perspective for clear scene representation

## Development Support

This development is supported by:
- **[Isara Technologies](https://isaratech.com)** - [GitHub](https://github.com/isaratech)
- **[HORUS](https://gohorus.fr)**

## Credits and Acknowledgments

### Based on Isoflow Library
This application is built upon the [Isoflow](https://github.com/markmanx/isoflow) library by Mark Mankarious, an open-source React component for drawing network diagrams.

### SDMIS Icons
The firefighting icons used in this application are provided by the **Service Départemental-Métropolitain d'Incendie et de Secours (SDMIS), 2023. All rights reserved.**

These icons are licensed under [Creative Commons CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr) and are used in accordance with the attribution requirements.

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## 🐳 Docker Image

The Docker image is available on Docker Hub: **[https://hub.docker.com/r/isaratech/isoflam](https://hub.docker.com/r/isaratech/isoflam)**

```bash
docker pull isaratech/isoflam:latest
docker run -p 80:80 isaratech/isoflam:latest
```

For detailed Docker usage instructions, see [README-dockerhub.md](README-dockerhub.md).

## 🔄 Continuous Integration

This project uses GitHub Actions for continuous integration:
- **Build and Test**: Automatically runs linting, tests, and build process on all pushes and pull requests
- **GitHub Pages**: Deploys the application to GitHub Pages on pushes to main/master branches
- **Docker Publish**: Builds and publishes Docker image on pushes to main/master branches

## Installation and Usage

```bash
npm install
npm start
```

For development:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```

The application will be available at `http://localhost:3000`.

## Contributing

Contributions are welcome! Please ensure that any contributions comply with the CC BY-NC-SA 4.0 license terms.

## Support

For support and questions, please open an issue on the [GitHub repository](https://github.com/isaratech/isoflam/issues).
