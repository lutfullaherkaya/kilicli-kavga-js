export class TwoDVector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    set(vector: TwoDVector): void {
        this.x = vector.x;
        this.y = vector.y;
    }

    add(vector: TwoDVector) {
        return new TwoDVector(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector: TwoDVector) {
        return new TwoDVector(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar: number) {
        return new TwoDVector(this.x * scalar, this.y * scalar);
    }

    divide(scalar: number) {
        return new TwoDVector(this.x / scalar, this.y / scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        return this.divide(this.magnitude());
    }

    limit(max: number) {
        if (this.magnitude() > max) {
            return this.normalize().multiply(max);
        }
        return this;
    }

    static distance(vector1: TwoDVector, vector2: TwoDVector) {
        return vector1.subtract(vector2).magnitude();
    }
}
