// Message queue wrapper for RabbitMQ operations

import { getRabbitMQChannel, isRabbitMQConnected } from '../../config/rabbitmq.js';
import { config } from '../../config/environment.js';
import { logger } from '../../config/logger.js';

export class MessageQueue {
    constructor() {
        this.prefix = config.rabbitmq.queuePrefix;
        this.queues = {
            financialData: `${this.prefix}-financial-data`,
            auditLogs: `${this.prefix}-audit-logs`,
            notifications: `${this.prefix}-notifications`,
        };
    }

    async publish(queueName, message) {
        const channel = getRabbitMQChannel();

        if (!channel) {
            logger.warn('Cannot publish message: RabbitMQ not connected');
            return false;
        }

        const fullQueueName = `${this.prefix}-${queueName}`;
        const messageBuffer = Buffer.from(JSON.stringify({
            ...message,
            timestamp: new Date().toISOString(),
            messageId: crypto.randomUUID(),
        }));

        try {
            await channel.assertQueue(fullQueueName, { durable: true });
            channel.sendToQueue(fullQueueName, messageBuffer, { persistent: true });

            logger.debug(`Message published to ${fullQueueName}`, {
                queueName: fullQueueName,
                messageSize: messageBuffer.length,
            });

            return true;
        } catch (error) {
            logger.error(`Failed to publish message to ${fullQueueName}`, {
                error: error.message
            });
            return false;
        }
    }

    async consume(queueName, handler) {
        const channel = getRabbitMQChannel();

        if (!channel) {
            logger.warn('Cannot consume messages: RabbitMQ not connected');
            return;
        }

        const fullQueueName = `${this.prefix}-${queueName}`;

        try {
            await channel.assertQueue(fullQueueName, { durable: true });

            channel.consume(fullQueueName, async (msg) => {
                if (msg) {
                    try {
                        const content = JSON.parse(msg.content.toString());
                        await handler(content);
                        channel.ack(msg);

                        logger.debug(`Message processed from ${fullQueueName}`);
                    } catch (error) {
                        logger.error(`Error processing message from ${fullQueueName}`, {
                            error: error.message,
                        });
                        // Reject and requeue the message
                        channel.nack(msg, false, true);
                    }
                }
            });

            logger.info(`Started consuming from ${fullQueueName}`);
        } catch (error) {
            logger.error(`Failed to start consumer for ${fullQueueName}`, {
                error: error.message,
            });
        }
    }

    async publishFinancialData(data) {
        return this.publish('financial-data', {
            type: 'financial-data',
            data,
        });
    }

    async publishAuditLog(log) {
        return this.publish('audit-logs', {
            type: 'audit-log',
            data: log,
        });
    }

    async publishNotification(notification) {
        return this.publish('notifications', {
            type: 'notification',
            data: notification,
        });
    }

    isConnected() {
        return isRabbitMQConnected();
    }
}
