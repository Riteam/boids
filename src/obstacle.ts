import { Graphics, Container } from "pixi.js";
import V from "./V2D";
import _ from "lodash";
import { backgroundColor } from "./Config.json";

const strokeWidth = 2

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

  constructor(container: Container) {
    this.polygon = new Graphics();
    this.lines = new Graphics();

    this.segments = [];
    container.addChild(this.polygon)
    container.addChild(this.lines)
  }

  /**
   * 添加斜线填充
   * @param points 多边形顶点
   * @param cutPoints 镂空顶点（可选）
   */
  private addDiagonalLines() {
    const { lines } = this;

    const lineSpacing = 20; // 间隔

    // 计算多边形的边界框
    const aabb = this.polygon.getBounds()
    const { width, height, x, y } = aabb
    lines.x = x
    lines.y = y

    const step = Math.ceil((width + height) / lineSpacing)

    let x1 = 0
    let y1 = 0
    let x2 = 0
    let y2 = 0
    // 斜线从右上到左下
    for (let i = 0; i < step; i++) {
      if (x1 < width) {
        x1 += lineSpacing
      } else {
        y1 += lineSpacing
      }
      if (y2 < height) {
        y2 += lineSpacing
      } else {
        x2 += lineSpacing
      }
      lines.moveTo(x1, y1)
      lines.lineTo(x2, y2)
    }

    // 斜线从左上到右下
    x1 = 0
    y1 = height
    x2 = 0
    y2 = height
    for (let i = 0; i < step; i++) {
      if (x1 < width) {
        x1 += lineSpacing
      } else {
        y1 -= lineSpacing
      }
      if (y2 > 0) {
        y2 -= lineSpacing
      } else {
        x2 += lineSpacing
      }
      lines.moveTo(x1, y1)
      lines.lineTo(x2, y2)
    }

    lines.stroke({ color: 0xffffff, pixelLine: true });
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
    polygon.fill({ color: backgroundColor, alpha: 1 });
    polygon.stroke({ color: 0xffffff, alpha: 1, width: 4, join: 'round' });

    // 镂空
    if (cutPoints && cutPoints.length >= 3) {
      polygon.cut() // 似乎是因为 stroke 才需要多加这一行
      polygon.poly(cutPoints)
      polygon.cut()
    }


    this.addDiagonalLines()
    // this.draw()
    return this
  }

  /**
   * 检查点是否在障碍物附近
   * @param point 要检查的点向量
   * @param threshold 距离阈值，默认为20像素
   * @returns 如果点在障碍物附近返回true，否则返回false
   */
  isHitBounds(point: V, radius: number = 20): boolean {
    const aabb = this.polygon.getBounds()
    const dx = _.clamp(point.x, aabb.minX, aabb.maxX) - point.x
    const dy = _.clamp(point.y, aabb.minY, aabb.maxY) - point.y
    const distance = dx * dx + dy * dy
    return distance < radius * radius
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