# Boids 群体行为模拟

[English](README_EN.md) | 中文

一个使用 Pixi.js v8.0 实现的 Boids 算法演示项目，使用四叉树优化了邻居查找，除了基本的群体行为外，还添加了障碍物规避功能。

🌐 **在线演示**: [https://riteam.github.io/boids/](https://riteam.github.io/boids/)

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动后访问 `http://localhost:8080` 查看效果。

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 🎮 使用说明

### 键盘控制

- **空格键**: 暂停/继续模拟
- **点号键 (.)**: 在暂停模式下逐帧播放

### 参数配置

在 `src/Config.json` 中可以调整以下参数：

```json
{
  "gridSize": 40,           // 网格大小
  "minSpeed": 2.2,          // 最小速度
  "maxSpeed": 5,            // 最大速度
  "seprationRadius": 20,    // 分离半径
  "alignmentRadius": 60,    // 对齐半径
  "cohesionRadius": 60,     // 凝聚半径
  "seprationFactor": 1.5,   // 分离因子
  "alignmentFactor": 1,     // 对齐因子
  "cohesionFactor": 1.4,    // 凝聚因子
  "avoidanceThreshold": 60  // 避障阈值
}
```

## 🎨 自定义扩展

### 添加新的障碍物

```typescript
import Obstacle from "./obstacle";

const obstacle = new Obstacle(app);
// 创建自定义形状
obstacle.createPolygonShape([
  { x: 100, y: 100 },
  { x: 200, y: 100 },
  { x: 200, y: 200 },
  { x: 100, y: 200 }
]);
```

### 调整群体行为

```typescript
import Boids from "./boids";

const boids = new Boids(app, 500); // 创建500个个体
boids.setObstacle(obstacle);       // 设置障碍物
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Daniel Huang](https://github.com/cubeDhuang/boids) - 给予启发以及V2D
- [Craig Reynolds](https://www.red3d.com/cwr/boids/) - Boids 算法发明者
- [Pixi.js](https://pixijs.com/) - 强大的 2D 渲染引擎
- [Vite](https://vitejs.dev/) - 快速的构建工具

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
