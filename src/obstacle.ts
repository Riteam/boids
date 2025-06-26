import { Graphics, Application } from "pixi.js";
import V from "./V2D";
import _ from "lodash";


const strokeWidth = 3

/**
 * 障碍物线段接口
 * 定义障碍物的一个线段，由两个端点组成
 */
export interface ObstacleSegment {
  start: V; // 起点向量
  end: V;   // 终点向量
}


/**
 * 障碍物类
 * 负责创建、绘制和管理游戏中的障碍物
 * 支持碰撞检测和避障力计算
 */
export default class Obstacle {
  segments: ObstacleSegment[];        // 存储所有障碍物线段
  polygon: Graphics;
  lines: Graphics;

  /**
   * 构造函数
   * @param app PIXI应用实例
   */
  constructor(public app: Application) {
    this.polygon = new Graphics();
    this.lines = new Graphics();
    this.segments = [];

  }

  /**
   * 添加斜线填充
   * @param points 多边形顶点
   * @param cutPoints 镂空顶点（可选）
   */
  private addDiagonalLines(points: V[]) {
    const { lines } = this;

    // 计算多边形的边界框
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    // 扩展边界以确保完全覆盖
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // 斜线间隔
    const lineSpacing = 20;

    // 计算需要多少条斜线来覆盖整个区域
    const diagonalLength = Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2);
    const numLines = Math.ceil(diagonalLength / lineSpacing) * 1.6; // 乘以2确保完全覆盖

    // 绘制斜线（45度角）
    lines.stroke({ color: 0xffffff, width: strokeWidth });

    // 从右上到左下的斜线
    for (let i = 0; i < numLines; i++) {
      const offset = i * lineSpacing;
      const startX = maxX - offset + 420;
      const startY = minY;
      const endX = maxX - offset - (maxY - minY) + 420;
      const endY = maxY;

      lines.moveTo(startX, startY);
      lines.lineTo(endX, endY);
    }

    this.lines.mask = this.polygon.clone()
  }

  createPolygonShape(points: V[], cutPoints?: V[]) {
    if (points.length < 3) throw new Error('Polygon must have at least 3 points')

    const { polygon } = this


    const len = points.length
    for (let i = 0; i < len; i++) {
      const curr = points[i]
      const next = points[(i + 1) % len]

      this.segments.push({
        start: curr,
        end: next
      })
    }
    polygon.poly(points)

    // 如果没有纹理，使用原来的纯色填充
    polygon.fill({ color: 0xa76226, alpha: 0 });
    polygon.stroke({ color: 0xffffff, alpha: 1, width: strokeWidth, join: 'round' });

    // 镂空
    if (cutPoints && cutPoints.length >= 3) {
      polygon.cut() // 似乎是因为 stroke 才需要多加这一行
      polygon.poly(cutPoints)
      polygon.cut()
    }


    this.addDiagonalLines(points)

    // this.draw()
  }

  /**
   * 绘制障碍物
   * 使用PIXI Graphics绘制所有障碍物方块
   */
  // private draw() {
  //   this.polygon.clear();

  //   // 设置填充颜色（棕色）和边框样式
  //   this.polygon.fill({ color: 0xa76226, alpha: 1 });
  // }

  /**
   * 检查点是否在障碍物附近
   * @param point 要检查的点向量
   * @param threshold 距离阈值，默认为20像素
   * @returns 如果点在障碍物附近返回true，否则返回false
   */
  isNearObstacle(point: V, threshold: number = 20): boolean {
    // 遍历所有障碍物线段
    for (const segment of this.segments) {
      // 计算点到线段的距离
      const distance = this.pointToLineDistance(point, segment.start, segment.end);
      if (distance < threshold) {
        return true; // 如果距离小于阈值，说明点在障碍物附近
      }
    }
    return false;
  }

  /**
   * 计算点到线段的距离
   * 使用点到线段的最短距离算法
   * @param point 点的位置向量
   * @param start 线段起点向量
   * @param end 线段终点向量
   * @returns 点到线段的最短距离
   */
  private pointToLineDistance(point: V, start: V, end: V): number {
    const start_point = V.sub(point, start);
    const start_end = V.sub(end, start);

    // 计算点积和线段长度的平方
    const dotProduct = start_point.dot(start_end);
    // console.log(dot === );

    // const lenSq = C * C + D * D;
    const lenSqrt = start_end.sqrMag();

    // 如果线段长度为0，返回点到起点的距离
    if (lenSqrt === 0) {
      return start_point.mag();
    }

    // 计算投影参数，并限制在[0,1]范围内
    const t = _.clamp(dotProduct / lenSqrt, 0, 1)

    // 计算线段上最近点的坐标
    const nearestPoint = start.clone().sclAdd(start_end, t);

    // 计算点到最近点的距离
    const distance = V.sub(point, nearestPoint).mag()

    return distance
  }

  getNearestPoint(point: V, start: V, end: V): V {
    const start_point = V.sub(point, start);
    const start_end = V.sub(end, start);

    // 计算点积和线段长度的平方
    const dotProduct = start_point.dot(start_end);
    // console.log(dot === );

    // const lenSq = C * C + D * D;
    const lenSqrt = start_end.sqrMag();

    // 如果线段长度为0，返回点到起点的距离
    if (lenSqrt === 0) {
      return start
    }

    // 计算投影参数，并限制在[0,1]范围内
    const t = _.clamp(dotProduct / lenSqrt, 0, 1)

    // 计算线段上最近点的坐标
    return start.clone().sclAdd(start_end, t);
  }

  getNearestPoints(point: V, threshold: number = 30): V[] {
    const thresholdSqr = threshold * threshold
    const points = []
    for (const segment of this.segments) {
      const nPoint = this.getNearestPoint(point, segment.start, segment.end);
      const distance = V.sub(point, nPoint).sqrMag()
      if (distance < thresholdSqr) {
        points.push(nPoint)
      }
    }
    return points
  }


  /**
   * 获取避障力向量
   * 计算从障碍物指向指定位置的避障力
   * @param position 当前位置向量
   * @param threshold 影响范围阈值，默认为30像素
   * @returns 避障力向量
   */
  getAvoidanceForce(position: V, threshold: number = 30): V {
    const avoidanceForce = new V(0, 0); // 初始化避障力向量
    let totalWeight = 0; // 总权重

    // 遍历所有障碍物线段
    for (const segment of this.segments) {
      // 计算当前位置到线段的距离
      const distance = this.pointToLineDistance(position, segment.start, segment.end);

      // 如果距离在影响范围内
      if (distance < threshold) {
        // 计算从障碍物到当前位置的方向向量
        const midPoint = V.add(segment.start, segment.end).div(2); // 线段中点向量
        const toObstacle = V.sub(midPoint, position);

        // 距离越近，避障力越大（权重计算）
        const weight = (threshold - distance) / threshold;
        toObstacle.normalize().mult(weight); // 归一化并乘以权重
        avoidanceForce.add(toObstacle); // 累加到总避障力
        totalWeight += weight;
      }
    }

    // 如果有避障力，进行归一化处理
    if (totalWeight > 0) {
      avoidanceForce.div(totalWeight);
      avoidanceForce.normalize();
    }

    return avoidanceForce;
  }

  /**
   * 检查点是否在多边形内部
   * 使用射线法（Ray Casting Algorithm）
   * @param point 要检查的点向量
   * @returns 如果点在多边形内部返回true，否则返回false
   */
  isPointInsidePolygon(point: V): boolean {
    let inside = false;
    const segments = this.segments;

    for (let i = 0, j = segments.length - 1; i < segments.length; j = i++) {
      const segment = segments[i];
      const prevSegment = segments[j];

      // 检查射线是否与边相交
      if (((segment.start.y > point.y) !== (prevSegment.start.y > point.y)) &&
        (point.x < (prevSegment.start.x - segment.start.x) * (point.y - segment.start.y) /
          (prevSegment.start.y - segment.start.y) + segment.start.x)) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * 将点弹出到多边形的最近边
   * @param point 要弹出的点向量
   * @returns 弹出后的点向量
   */
  pushPointToNearestEdge(point: V): V {
    let minDistance = Infinity;
    let nearestPoint = point.clone();

    // 遍历所有边，找到最近的边
    for (const segment of this.segments) {
      const nearestOnSegment = this.getNearestPoint(point, segment.start, segment.end);
      const distance = V.sub(point, nearestOnSegment).mag();

      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = nearestOnSegment;
      }
    }

    return nearestPoint;
  }

  /**
   * 检查并处理碰撞
   * 如果点在多边形内部，将其弹出到最近边
   * @param point 要检查的点向量
   * @returns 处理后的点向量（如果在内部则弹出，否则返回原位置）
   */
  handleCollision(point: V): V {
    if (this.isPointInsidePolygon(point)) {
      return this.pushPointToNearestEdge(point);
    }
    return point.clone();
  }

  /**
   * 批量处理多个点的碰撞
   * @param points 要检查的点向量数组
   * @returns 处理后的点向量数组
   */
  handleMultipleCollisions(points: V[]): V[] {
    return points.map(point => this.handleCollision(point));
  }

}