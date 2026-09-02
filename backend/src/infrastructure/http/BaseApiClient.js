// Base API client with circuit breaker, retry logic, and error handling

import axios from 'axios';
import { configureRetry } from '../resilience/RetryStrategy.js';
import { CircuitBreaker } from '../resilience/CircuitBreaker.js';
import { ExternalAPIError } from '../../utils/errors.js';
import { logger } from '../../config/logger.js';

export class BaseApiClient {
    constructor(name, options) {
        this.name = name;
        this.baseURL = options.baseURL;

        this.client = axios.create({
            baseURL: options.baseURL,
            timeout: options.timeout || 10000,
            headers: {
                'Accept': 'application/json',
                ...options.headers,
            },
        });

        configureRetry(this.client, {
            retries: 3,
            retryDelay: 1000,
        });

        this.circuitBreaker = new CircuitBreaker(name, {
            onStateChange: options.onCircuitStateChange,
        });

        // Request logging
        this.client.interceptors.request.use((config) => {
            config.metadata = { startTime: Date.now() };
            logger.debug(`API Request: ${this.name}`, {
                url: config.url,
                method: config.method,
            });
            return config;
        });

        // Response logging
        this.client.interceptors.response.use(
            (response) => {
                const duration = Date.now() - response.config.metadata.startTime;
                logger.debug(`API Response: ${this.name}`, {
                    url: response.config.url,
                    status: response.status,
                    duration: `${duration}ms`,
                });
                return response;
            },
            (error) => {
                const duration = error.config?.metadata
                    ? Date.now() - error.config.metadata.startTime
                    : 0;
                logger.error(`API Error: ${this.name}`, {
                    url: error.config?.url,
                    status: error.response?.status,
                    message: error.message,
                    duration: `${duration}ms`,
                });
                return Promise.reject(error);
            }
        );
    }

    // Execute request through circuit breaker
    async executeWithCircuitBreaker(requestFn) {
        return this.circuitBreaker.execute(requestFn);
    }

    // Make GET request
    async get(endpoint, params = {}) {
        return this.executeWithCircuitBreaker(async () => {
            try {
                const response = await this.client.get(endpoint, { params });
                return response.data;
            } catch (error) {
                throw this._handleError(error);
            }
        });
    }

    // Transform API errors into ExternalAPIError
    _handleError(error) {
        // Timeout
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return new ExternalAPIError(`Request timeout for ${this.name}`, this.name, error.message);
        }

        // Rate limit (429)
        if (error.response?.status === 429) {
            return new ExternalAPIError(`Rate limit exceeded for ${this.name}`, this.name, error.message);
        }

        // Client error (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
            return new ExternalAPIError(`Invalid response ${error.response?.status} from ${this.name}`, this.name, error.message);
        }

        // Server error (5xx)
        if (error.response?.status >= 500) {
            return new ExternalAPIError(`Server error ${error.response?.status} from ${this.name}`, this.name, error.message);
        }

        // Network error
        return new ExternalAPIError(error.message || `Network error for ${this.name}`, this.name, error.message);
    }

    // Get circuit breaker status
    getCircuitBreakerStatus() {
        return this.circuitBreaker.getStatus();
    }
}

export default BaseApiClient;
