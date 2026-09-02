// Circuit breaker - CLOSED → OPEN → HALF_OPEN state machine
// Prevents cascading failures from external API issues

import { logger } from '../../config/logger.js';
import { config } from '../../config/environment.js';
import { CircuitBreakerError } from '../../utils/errors.js';

export const CircuitState = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF_OPEN',
};

export class CircuitBreaker {
    constructor(name, options = {}) {
        this.name = name;
        this.failureThreshold = options.failureThreshold || config.circuitBreaker.threshold;
        this.resetTimeout = options.resetTimeout || config.circuitBreaker.resetTimeout;
        this.successThreshold = options.successThreshold || 2;
        this.onStateChange = options.onStateChange || null;

        // State
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.nextAttemptTime = null;
    }

    // Execute function through circuit breaker
    async execute(fn) {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() < this.nextAttemptTime) {
                throw new CircuitBreakerError(this.name);
            }
            this._setState(CircuitState.HALF_OPEN);
        }

        try {
            const result = await fn();
            this._onSuccess();
            return result;
        } catch (error) {
            this._onFailure();
            throw error;
        }
    }

    // Handle successful execution
    _onSuccess() {
        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= this.successThreshold) {
                this._setState(CircuitState.CLOSED);
            }
        } else if (this.state === CircuitState.CLOSED) {
            // Reset failure count on success
            this.failureCount = 0;
        }
    }

    // Handle failed execution
    _onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.state === CircuitState.HALF_OPEN) {
            this._setState(CircuitState.OPEN);
        } else if (this.failureCount >= this.failureThreshold) {
            this._setState(CircuitState.OPEN);
        }

        logger.warn(`Circuit breaker ${this.name}: failure ${this.failureCount}/${this.failureThreshold}`, {
            service: this.name,
            state: this.state,
            failureCount: this.failureCount,
        });
    }

    // Set circuit breaker state
    _setState(newState) {
        const oldState = this.state;
        this.state = newState;

        if (newState === CircuitState.OPEN) {
            this.nextAttemptTime = Date.now() + this.resetTimeout;
            this.successCount = 0;
        } else if (newState === CircuitState.CLOSED) {
            this.failureCount = 0;
            this.successCount = 0;
            this.nextAttemptTime = null;
        } else if (newState === CircuitState.HALF_OPEN) {
            this.successCount = 0;
        }

        logger.info(`Circuit breaker ${this.name}: ${oldState} → ${newState}`, {
            service: this.name,
            oldState,
            newState,
        });

        if (this.onStateChange) {
            this.onStateChange({
                service: this.name,
                oldState,
                newState,
                timestamp: new Date().toISOString(),
            });
        }
    }

    // Get current status
    getStatus() {
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            failureThreshold: this.failureThreshold,
            resetTimeout: this.resetTimeout,
            lastFailureTime: this.lastFailureTime,
            nextAttemptTime: this.nextAttemptTime,
        };
    }

    // Manually reset to closed state
    reset() {
        this._setState(CircuitState.CLOSED);
        logger.info(`Circuit breaker ${this.name}: manually reset`);
    }

    // Check if allowing requests
    isAllowingRequests() {
        if (this.state === CircuitState.CLOSED) return true;
        if (this.state === CircuitState.HALF_OPEN) return true;
        if (this.state === CircuitState.OPEN && Date.now() >= this.nextAttemptTime) return true;
        return false;
    }
}

export default CircuitBreaker;
