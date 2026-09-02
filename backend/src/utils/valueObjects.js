// Value objects for precise monetary calculations

export class Money {
    constructor(value) {
        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
            throw new Error('Invalid monetary value');
        }
        this.value = parsed;
    }

    static of(value) {
        return new Money(value);
    }

    static zero() {
        return new Money(0);
    }

    plus(other) {
        const otherVal = other instanceof Money ? other.value : parseFloat(other);
        return new Money(+(this.value + otherVal).toFixed(10));
    }

    minus(other) {
        const otherVal = other instanceof Money ? other.value : parseFloat(other);
        return new Money(+(this.value - otherVal).toFixed(10));
    }

    times(factor) {
        return new Money(+(this.value * factor).toFixed(10));
    }

    div(divisor) {
        if (divisor === 0) throw new Error('Division by zero');
        return new Money(+(this.value / divisor).toFixed(10));
    }

    gt(other) {
        const otherVal = other instanceof Money ? other.value : parseFloat(other);
        return this.value > otherVal;
    }

    lt(other) {
        const otherVal = other instanceof Money ? other.value : parseFloat(other);
        return this.value < otherVal;
    }

    eq(other) {
        const otherVal = other instanceof Money ? other.value : parseFloat(other);
        return Math.abs(this.value - otherVal) < Number.EPSILON;
    }

    toFixed(decimals) {
        return this.value.toFixed(decimals);
    }

    round(decimals) {
        const factor = Math.pow(10, decimals);
        return new Money(Math.round(this.value * factor) / factor);
    }

    toNumber() {
        return this.value;
    }

    toString() {
        return String(this.value);
    }
}

export class Percentage {
    constructor(value) {
        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
            throw new Error('Invalid percentage value');
        }
        this.value = parsed;
    }

    static of(value) {
        return new Percentage(value);
    }

    static fromDecimal(decimal) {
        return new Percentage(decimal * 100);
    }

    toDecimal() {
        return this.value / 100;
    }

    apply(amount) {
        const amountVal = amount instanceof Money ? amount.toNumber() : parseFloat(amount);
        return new Money(amountVal * this.toDecimal());
    }

    toString() {
        return `${this.value}%`;
    }

    toNumber() {
        return this.value;
    }
}

export default { Money, Percentage };
