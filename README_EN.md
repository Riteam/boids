# Boids Flocking Behavior Simulation

English | [中文](README.md)

A Boids algorithm demonstration project implemented with Pixi.js v8.0, featuring quad-tree optimization for neighbor lookup. In addition to basic flocking behavior, obstacle avoidance functionality has been added.

🌐 **Live Demo**: [https://riteam.github.io/boids/](https://riteam.github.io/boids/)

## 🚀 Quick Start

### Requirements

- Node.js >= 16.0.0
- npm >= 8.0.0

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

After starting, visit `http://localhost:8080` to see the effect.

### Build Production Version

```bash
npm run build
```

### Code Linting

```bash
npm run lint
```

## 🎮 Usage Instructions

### Keyboard Controls

- **Spacebar**: Pause/Resume simulation
- **Period key (.)**: Step-by-step playback in pause mode

### Parameter Configuration

You can adjust the following parameters in `src/Config.json`:

```json
{
  "gridSize": 40,           // Grid size
  "minSpeed": 2.2,          // Minimum speed
  "maxSpeed": 5,            // Maximum speed
  "seprationRadius": 20,    // Separation radius
  "alignmentRadius": 60,    // Alignment radius
  "cohesionRadius": 60,     // Cohesion radius
  "seprationFactor": 1.5,   // Separation factor
  "alignmentFactor": 1,     // Alignment factor
  "cohesionFactor": 1.4,    // Cohesion factor
  "avoidanceThreshold": 60  // Obstacle avoidance threshold
}
```

## 🎨 Custom Extensions

### Adding New Obstacles

```typescript
import Obstacle from "./obstacle";

const obstacle = new Obstacle(app);
// Create custom shape
obstacle.createPolygonShape([
  { x: 100, y: 100 },
  { x: 200, y: 100 },
  { x: 200, y: 200 },
  { x: 100, y: 200 }
]);
```

### Adjusting Flocking Behavior

```typescript
import Boids from "./boids";

const boids = new Boids(app, 500); // Create 500 individuals
boids.setObstacle(obstacle);       // Set obstacles
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Daniel Huang](https://github.com/cubeDhuang/boids) - For inspiration and V2D
- [Craig Reynolds](https://www.red3d.com/cwr/boids/) - Inventor of the Boids algorithm
- [Pixi.js](https://pixijs.com/) - Powerful 2D rendering engine
- [Vite](https://vitejs.dev/) - Fast build tool

---

⭐ If this project helps you, please give it a star! 