// Socket.io manager for real-time connections and broadcasting

import { logger } from '../../config/logger.js';

export class SocketManager {
    constructor(io) {
        this.io = io;
        this.LIVE_STREAM_ROOM = 'live-stream';
        this._setupEventHandlers();
    }

    _setupEventHandlers() {
        this.io.on('connection', (socket) => {
            logger.info('Socket connected', { socketId: socket.id });

            socket.emit('connection-acknowledged', {
                socketId: socket.id,
                timestamp: new Date().toISOString(),
            });

            socket.on('join-live-stream', (payload) => {
                socket.join(this.LIVE_STREAM_ROOM);
                logger.debug('Socket joined live-stream', {
                    socketId: socket.id,
                    userId: payload?.userId,
                });
            });

            socket.on('leave-live-stream', (payload) => {
                socket.leave(this.LIVE_STREAM_ROOM);
                logger.debug('Socket left live-stream', {
                    socketId: socket.id,
                    userId: payload?.userId,
                });
            });

            socket.on('request-current-data', () => {
                logger.debug('Current data requested', { socketId: socket.id });
                socket.emit('data-request-acknowledged', {
                    message: 'Request received, fetching data...',
                });
            });

            socket.on('disconnect', (reason) => {
                logger.info('Socket disconnected', {
                    socketId: socket.id,
                    reason,
                });
            });

            socket.on('error', (error) => {
                logger.error('Socket error', {
                    socketId: socket.id,
                    error: error.message,
                });
            });
        });
    }

    broadcastFinancialData(data) {
        this.io.to(this.LIVE_STREAM_ROOM).emit('financial-data-update', data);
        logger.debug('Financial data broadcast', {
            room: this.LIVE_STREAM_ROOM,
            requestId: data.requestId,
        });
    }

    broadcastSystemWarning(warning) {
        const payload = {
            service: warning.service,
            message: warning.message,
            severity: warning.severity || 'warning',
            timestamp: new Date().toISOString(),
        };
        this.io.to(this.LIVE_STREAM_ROOM).emit('system-warning', payload);
        logger.warn('System warning broadcast', payload);
    }

    broadcastCircuitBreakerStateChange(stateChange) {
        const payload = {
            service: stateChange.service,
            state: stateChange.newState,
            timestamp: new Date().toISOString(),
        };
        this.io.to(this.LIVE_STREAM_ROOM).emit('circuit-breaker-state-change', payload);
        logger.info('Circuit breaker state change broadcast', payload);
    }

    sendError(socketId, code, message) {
        this.io.to(socketId).emit('error', { code, message });
    }

    async getLiveStreamClientCount() {
        const sockets = await this.io.in(this.LIVE_STREAM_ROOM).fetchSockets();
        return sockets.length;
    }

    async close() {
        return new Promise((resolve) => {
            this.io.close(() => {
                logger.info('Socket.io server closed');
                resolve();
            });
        });
    }
}

export default SocketManager;
