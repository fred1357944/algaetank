# Algae Tank 3D Visualization

An interactive 3D web application for visualizing and exploring an algae cultivation tank system. This project provides an immersive experience with detailed 3D models, multiple viewing modes, and interactive controls.

## Features

- **Interactive 3D Models**: Explore detailed GLTF models of the tank structure, algae tank, and control box
- **Model Explosion View**: Break apart the system to examine individual components
- **Multiple Environment Modes**: Switch between Day, Dusk, Night, and Zen viewing modes
- **Dynamic Controls**: Adjust rotation speed, toggle model rotation, and reset views
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Multilingual Support**: Toggle between English and Chinese interfaces

## Getting Started

### Quick Start

1. Open [`index.html`](./index.html) in your web browser to access the landing page
2. Click anywhere on the landing page to enter the main application
3. The main application will load at [`algaetank.html`](./algaetank.html)

### File Structure

```
algaetank/
├── index.html          # Landing page with animated spheres
├── algaetank.html      # Main 3D visualization application
├── app.js              # Three.js animation for landing page
├── app1.js             # Additional JavaScript utilities
├── app2.js             # Additional JavaScript utilities  
├── app3.js             # Additional JavaScript utilities
├── 3D/                 # 3D model assets
│   ├── structure-model.gltf    # Tank structure model
│   ├── tank-model.gltf         # Algae tank model
│   ├── control-box-model.gltf  # Control system model
│   └── app.js                  # 3D-related JavaScript
└── README.md           # This file
```

## Usage

### Navigation Controls

- **Mouse**: Rotate and zoom the 3D view
- **Shift + Drag**: Pan the camera view
- **Rotation Speed Controller**: Adjust the automatic rotation speed
- **Reset View**: Return to the default camera position

### Model Controls

- **Structure**: Toggle visibility of the tank structure
- **Tank**: Toggle visibility of the algae tank
- **Control Box**: Toggle visibility of the control system
- **Implode All**: Return all exploded components to their original positions

### Environment Modes

- **Day Mode**: Bright, natural lighting
- **Dusk Mode**: Warm, sunset-like atmosphere  
- **Night Mode**: Dark environment with accent lighting
- **Zen Mode**: Minimalist, clean background

## Technical Details

### Dependencies

The application uses the following libraries loaded via CDN:

- **A-Frame 1.4.2**: WebVR framework for 3D/AR experiences
- **Three.js 0.125.2**: 3D graphics library
- **GSAP 3.9.1**: Animation library
- **A-Frame Environment Component**: Environment presets

### Browser Compatibility

- Modern browsers with WebGL support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers with WebGL support

## Development

### Local Development

To run the project locally:

1. Clone the repository
2. Serve the files using a local web server (required for GLTF model loading)
3. Navigate to `index.html` in your browser

Example using Python's built-in server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Model Assets

The 3D models are stored in the [`3D/`](./3D/) directory in GLTF format:
- [`structure-model.gltf`](./3D/structure-model.gltf) - Tank framework and support structure
- [`tank-model.gltf`](./3D/tank-model.gltf) - Main algae cultivation tank
- [`control-box-model.gltf`](./3D/control-box-model.gltf) - Control and monitoring system

## License

© 2023 Andgreen Co. Ltd. All rights reserved.

## Contributing

This project is maintained by Andgreen Co. Ltd. For questions or suggestions, please contact the development team.