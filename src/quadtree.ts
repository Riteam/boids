import Arrow from "./arrow";

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface QuadTreeNode {
  bounds: Bounds;
  objects: Arrow[];
  nodes: QuadTreeNode[];
  maxObjects: number;
  maxLevels: number;
  level: number;
}

export default class QuadTree {
  private root: QuadTreeNode;
  private maxObjects: number;
  private maxLevels: number;

  constructor(bounds: Bounds, maxObjects: number = 10, maxLevels: number = 4) {
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.root = this.createNode(bounds, 0);
  }

  private createNode(bounds: Bounds, level: number): QuadTreeNode {
    return {
      bounds,
      objects: [],
      nodes: [],
      maxObjects: this.maxObjects,
      maxLevels: this.maxLevels,
      level
    };
  }

  // 清空四叉树
  clear(): void {
    this.root.objects = [];
    this.root.nodes = [];
  }

  // 插入对象到四叉树
  insert(arrow: Arrow): void {
    this.insertIntoNode(this.root, arrow);
  }

  private insertIntoNode(node: QuadTreeNode, arrow: Arrow): void {
    // 如果节点有子节点，尝试插入到子节点中
    if (node.nodes.length > 0) {
      const index = this.getIndex(node, arrow);
      if (index !== -1) {
        this.insertIntoNode(node.nodes[index], arrow);
        return;
      }
    }

    // 将对象添加到当前节点
    node.objects.push(arrow);

    // 如果对象数量超过限制且未达到最大层级，则分割节点
    if (node.objects.length > node.maxObjects && node.level < node.maxLevels) {
      if (node.nodes.length === 0) {
        this.split(node);
      }

      // 重新分配对象到子节点
      let i = 0;
      while (i < node.objects.length) {
        const index = this.getIndex(node, node.objects[i]);
        if (index !== -1) {
          const obj = node.objects.splice(i, 1)[0];
          this.insertIntoNode(node.nodes[index], obj);
        } else {
          i++;
        }
      }
    }
  }

  // 分割节点为四个子节点
  private split(node: QuadTreeNode): void {
    const bounds = node.bounds;
    const subWidth = bounds.width / 2;
    const subHeight = bounds.height / 2;
    const x = bounds.x;
    const y = bounds.y;

    node.nodes[0] = this.createNode({
      x: x + subWidth,
      y: y,
      width: subWidth,
      height: subHeight
    }, node.level + 1);

    node.nodes[1] = this.createNode({
      x: x,
      y: y,
      width: subWidth,
      height: subHeight
    }, node.level + 1);

    node.nodes[2] = this.createNode({
      x: x,
      y: y + subHeight,
      width: subWidth,
      height: subHeight
    }, node.level + 1);

    node.nodes[3] = this.createNode({
      x: x + subWidth,
      y: y + subHeight,
      width: subWidth,
      height: subHeight
    }, node.level + 1);
  }

  // 获取对象应该插入到哪个子节点
  private getIndex(node: QuadTreeNode, arrow: Arrow): number {
    const bounds = node.bounds;
    const verticalMidpoint = bounds.x + bounds.width / 2;
    const horizontalMidpoint = bounds.y + bounds.height / 2;

    const topQuadrant = arrow.y < horizontalMidpoint;
    const bottomQuadrant = arrow.y >= horizontalMidpoint;
    const leftQuadrant = arrow.x < verticalMidpoint;
    const rightQuadrant = arrow.x >= verticalMidpoint;

    if (leftQuadrant && topQuadrant) {
      return 1;
    } else if (rightQuadrant && topQuadrant) {
      return 0;
    } else if (leftQuadrant && bottomQuadrant) {
      return 2;
    } else if (rightQuadrant && bottomQuadrant) {
      return 3;
    }

    return -1; // 对象跨越多个象限
  }

  // 查询指定范围内的所有对象
  retrieve(arrow: Arrow, radius: number): Arrow[] {
    const bounds = {
      x: arrow.x - radius,
      y: arrow.y - radius,
      width: radius * 2,
      height: radius * 2
    };

    return this.retrieveFromNode(this.root, bounds);
  }

  private retrieveFromNode(node: QuadTreeNode, bounds: Bounds): Arrow[] {
    const returnObjects: Arrow[] = [];

    // 检查当前节点的对象
    for (const obj of node.objects) {
      returnObjects.push(obj);
    }

    // 如果有子节点，递归查询
    if (node.nodes.length > 0) {
      const index = this.getIndex(node, {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2
      } as Arrow);

      if (index !== -1) {
        returnObjects.push(...this.retrieveFromNode(node.nodes[index], bounds));
      } else {
        // 查询所有子节点
        for (const childNode of node.nodes) {
          returnObjects.push(...this.retrieveFromNode(childNode, bounds));
        }
      }
    }

    return returnObjects;
  }

  // 更新四叉树（重新构建）
  update(arrows: Arrow[]): void {
    this.clear();
    for (const arrow of arrows) {
      this.insert(arrow);
    }
  }
} 