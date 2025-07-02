import Utils from "./Utils"

/**
 * 2D向量类
 * 提供二维向量的基本运算和操作
 */
class V2D {
  x: number;
  y: number;

  /**
   * 从数组创建新的V2D向量
   * @param {Array} array 包含x和y分量的数组 [x, y]
   * @returns {V2D} 新的V2D实例
   */
  static fromArray(array: [number, number] | number[]): V2D {
    if (!Array.isArray(array) || array.length < 2) {
      throw new Error('数组必须包含至少2个元素');
    }
    return new V2D(array[0], array[1]);
  }

  /**
   * 从对象创建新的V2D向量
   * @param {Object} obj 包含x和y属性的对象
   * @returns {V2D} 新的V2D实例
   */
  static fromObject(obj: { x: number; y: number }): V2D {
    if (!obj || typeof obj.x !== 'number' || typeof obj.y !== 'number') {
      throw new Error('对象必须包含有效的x和y数值属性');
    }
    return new V2D(obj.x, obj.y);
  }

  /**
   * 创建指定幅度的随机向量
   * @param {number} scale 随机向量的幅度，默认为1
   * @returns {V2D} 新的随机V2D实例
   */
  static random(scale: number = 1): V2D {
    if (scale < 0) {
      throw new Error('幅度不能为负数');
    }
    const r = Utils.random() * 2.0 * Math.PI;
    return new V2D(Math.cos(r) * scale, Math.sin(r) * scale);
  }

  /**
   * 两个向量相加并返回结果
   * @param {V2D} a 第一个向量
   * @param {V2D} b 第二个向量
   * @returns {V2D} 新的V2D实例，表示a + b
   */
  static add(a: V2D, b: V2D): V2D {
    if (!a || !b) {
      throw new Error('向量参数不能为空');
    }
    return new V2D(a.x + b.x, a.y + b.y);
  }

  /**
   * 两个向量相减并返回结果
   * @param {V2D} a 第一个向量
   * @param {V2D} b 第二个向量
   * @returns {V2D} 新的V2D实例，表示a - b
   */
  static sub(a: V2D, b: V2D): V2D {
    if (!a || !b) {
      throw new Error('向量参数不能为空');
    }
    return new V2D(a.x - b.x, a.y - b.y);
  }

  /**
   * 向量与标量相乘并返回结果
   * @param {V2D} v 向量
   * @param {number} scale 缩放因子
   * @returns {V2D} 新的V2D实例，表示v * scale
   */
  static mult(v: V2D, scale: number): V2D {
    if (!v) {
      throw new Error('向量参数不能为空');
    }
    if (typeof scale !== 'number' || !isFinite(scale)) {
      throw new Error('缩放因子必须是有限数值');
    }
    return new V2D(v.x * scale, v.y * scale);
  }

  /**
   * 向量与标量相除并返回结果
   * @param {V2D} v 向量
   * @param {number} scale 除数
   * @returns {V2D} 新的V2D实例，表示v / scale
   */
  static div(v: V2D, scale: number): V2D {
    if (!v) {
      throw new Error('向量参数不能为空');
    }
    if (scale === 0) {
      throw new Error('除数不能为零');
    }
    if (typeof scale !== 'number' || !isFinite(scale)) {
      throw new Error('除数必须是有限数值');
    }
    return new V2D(v.x / scale, v.y / scale);
  }

  /**
   * 创建新的2D向量
   * @param {number} x X分量，默认为0
   * @param {number} y Y分量，默认为0
   */
  constructor(x: number = 0, y: number = 0) {
    if (typeof x !== 'number' || !isFinite(x)) {
      throw new Error('x分量必须是有限数值');
    }
    if (typeof y !== 'number' || !isFinite(y)) {
      throw new Error('y分量必须是有限数值');
    }
    this.x = x;
    this.y = y;
  }

  /**
   * 将向量转换为字符串
   * @param {number} radix 指定分量的进制，默认为10
   * @returns {string} 格式为"x,y"的字符串
   */
  toString(radix: number = 10): string {
    return `${this.x.toString(radix)},${this.y.toString(radix)}`;
  }

  /**
   * 将向量转换为数组
   * @returns {Array} 包含x和y分量的数组 [x, y]
   */
  toArray(): [number, number] {
    return [this.x, this.y];
  }

  /**
   * 将向量转换为普通对象
   * @returns {Object} 包含x和y属性的对象
   */
  toObject(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * 设置向量的分量
   * @param {number} x X分量
   * @param {number} y Y分量
   * @returns {V2D} 当前向量实例（链式调用）
   */
  set(x: number, y: number): V2D {
    if (typeof x !== 'number' || !isFinite(x)) {
      throw new Error('x分量必须是有限数值');
    }
    if (typeof y !== 'number' || !isFinite(y)) {
      throw new Error('y分量必须是有限数值');
    }
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * 复制给定向量到当前向量
   * @param {V2D} v 要复制的向量
   * @returns {V2D} 当前向量实例（链式调用）
   */
  copy(v: V2D): V2D {
    if (!v) {
      throw new Error('向量参数不能为空');
    }
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  /**
   * 返回当前向量的副本
   * @returns {V2D} 新的V2D实例，与当前向量相同
   */
  clone(): V2D {
    return new V2D(this.x, this.y);
  }

  // 标量属性方法 ----------------------------

  /**
   * 返回向量的角度（弧度）
   * @returns {number} 向量的角度，范围[-π, π]
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * 返回向量长度的平方
   * @returns {number} 向量长度的平方
   */
  sqrMag(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * 返回向量的长度（模长）
   * @returns {number} 向量的长度
   */
  mag(): number {
    return Math.hypot(this.x, this.y);
  }

  /**
   * 返回当前向量与给定向量之间距离的平方
   * @param {V2D} v 给定向量
   * @returns {number} 距离的平方
   */
  sqrDist(v: V2D): number {
    if (!v) {
      throw new Error('向量参数不能为空');
    }
    const x = this.x - v.x;
    const y = this.y - v.y;
    return x * x + y * y;
  }

  /**
   * 返回当前向量与给定向量之间的距离
   * @param {V2D} v 给定向量
   * @returns {number} 距离
   */
  dist(v: V2D): number {
    if (!v) {
      throw new Error('向量参数不能为空');
    }
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  /**
   * 返回当前向量与给定向量的点积
   * @param {V2D} v 给定向量
   * @returns {number} 点积结果
   */
  dot(v: V2D): number {
    if (!v) {
      throw new Error('向量参数不能为空');
    }
    return v.x * this.x + v.y * this.y;
  }

  // 一元操作 -----------------------------------------

  /**
   * 检查向量是否为零向量
   * @returns {boolean} 如果向量为零向量则返回true
   */
  isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }

  /**
   * 将向量设置为零向量
   * @returns {V2D} 当前向量实例（链式调用）
   */
  zero(): V2D {
    this.x = 0;
    this.y = 0;
    return this;
  }

  /**
   * 将向量标准化（单位化）
   * @returns {V2D} 当前向量实例（链式调用）
   */
  normalize(): V2D {
    return this.setMag(1);
  }

  // 标量输入操作 ----------------------------------

  /**
   * 随机化向量并设置指定幅度
   * @param {number} scale 随机向量的幅度
   * @returns {V2D} 当前向量实例（链式调用）
   */
  random(scale: number): V2D {
    if (scale < 0) {
      throw new Error('幅度不能为负数');
    }
    const r = Utils.random() * 2.0 * Math.PI;
    this.x = Math.cos(r) * scale;
    this.y = Math.sin(r) * scale;
    return this;
  }

  /**
   * 将向量旋转指定角度
   * @param {number} angle 旋转角度（弧度）
   * @returns {V2D} 当前向量实例（链式调用）
   */
  rotate(angle: number): V2D {
    if (typeof angle !== 'number' || !isFinite(angle)) {
      throw new Error('角度必须是有限数值');
    }
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rx = this.x * cos - this.y * sin;
    this.y = this.x * sin + this.y * cos;
    this.x = rx;
    return this;
  }

  /**
   * 将向量乘以指定缩放因子
   * @param {number} scale 缩放因子
   * @returns {V2D} 当前向量实例（链式调用）
   */
  mult(scale: number): V2D {
    if (typeof scale !== 'number' || !isFinite(scale)) {
      throw new Error('缩放因子必须是有限数值');
    }
    this.x *= scale;
    this.y *= scale;
    return this;
  }

  /**
   * 将向量除以指定除数
   * @param {number} scale 除数
   * @returns {V2D} 当前向量实例（链式调用）
   */
  div(scale: number): V2D {
    if (scale === 0) {
      throw new Error('除数不能为零');
    }
    if (typeof scale !== 'number' || !isFinite(scale)) {
      throw new Error('除数必须是有限数值');
    }
    this.x /= scale;
    this.y /= scale;
    return this;
  }

  /**
   * 设置向量的长度
   * @param {number} mag 目标长度
   * @returns {V2D} 当前向量实例（链式调用）
   */
  setMag(mag: number): V2D {
    if (typeof mag !== 'number' || !isFinite(mag)) {
      throw new Error('长度必须是有限数值');
    }
    if (mag < 0) {
      throw new Error('长度不能为负数');
    }
    if (this.isZero()) {
      return this;
    }
    const ratio = mag / this.mag();
    return this.mult(ratio);
  }

  /**
   * 限制向量的最大长度
   * @param {number} mag 最大长度
   * @returns {V2D} 当前向量实例（链式调用）
   */
  max(mag: number): V2D {
    if (typeof mag !== 'number' || !isFinite(mag)) {
      throw new Error('最大长度必须是有限数值');
    }
    if (mag < 0) {
      throw new Error('最大长度不能为负数');
    }
    const l1 = this.sqrMag();
    const l2 = mag * mag;
    if (l1 <= l2) {
      return this;
    }
    this.setMag(mag);
    return this;
  }

  /**
   * 限制向量的最小长度
   * @param {number} mag 最小长度
   * @returns {V2D} 当前向量实例（链式调用）
   */
  min(mag: number): V2D {
    if (typeof mag !== 'number' || !isFinite(mag)) {
      throw new Error('最小长度必须是有限数值');
    }
    if (mag < 0) {
      throw new Error('最小长度不能为负数');
    }
    const l1 = this.sqrMag();
    const l2 = mag * mag;
    if (l1 >= l2) {
      return this;
    }
    this.setMag(mag);
    return this;
  }

  // 向量输入操作 -----------------------------------

  /**
   * 将给定向量加到当前向量上
   * @param {V2D} v 要加的向量
   * @returns {V2D} 当前向量实例（链式调用）
   */
  add(v: V2D): V2D {
    if (!v) {
      throw new Error('向量参数不能为空');
    }
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  /**
   * 从当前向量中减去给定向量
   * @param {V2D} v 要减的向量
   * @returns {V2D} 当前向量实例（链式调用）
   */
  sub(v: V2D): V2D {
    if (!v) {
      throw new Error('向量参数不能为空');
    }
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  /**
   * 将给定向量乘以缩放因子后加到当前向量上
   * @param {V2D} v 要缩放并加的向量
   * @param {number} scale 缩放因子
   * @returns {V2D} 当前向量实例（链式调用）
   */
  sclAdd(v: V2D, scale: number): V2D {
    if (!v) {
      throw new Error('向量参数不能为空');
    }
    if (typeof scale !== 'number' || !isFinite(scale)) {
      throw new Error('缩放因子必须是有限数值');
    }
    this.x += v.x * scale;
    this.y += v.y * scale;
    return this;
  }

  /**
   * 计算向量在给定法向量上的反射
   * @param {V2D} normal 法向量（必须已标准化）
   * @returns {V2D} 反射后的向量
   */
  reflect(normal: V2D): V2D {
    if (!normal) {
      throw new Error('法向量不能为空');
    }
    // 检查法向量是否已标准化
    const normalMag = normal.mag();
    if (Math.abs(normalMag - 1) > 1e-6) {
      throw new Error('法向量必须已标准化（长度为1）');
    }
    const dot = this.dot(normal);
    return this.sub(normal.clone().mult(2 * dot));
  }
}

export default V2D;
