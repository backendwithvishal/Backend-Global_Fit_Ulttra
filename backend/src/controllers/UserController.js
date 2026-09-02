// User management - CRUD operations for user accounts

export class UserController {
    constructor({ userService }) {
        this.userService = userService;
    }

    // Get list of users with pagination
    async listUsers(req, res, next) {
        try {
            const { page, limit, isActive, sort } = req.query;

            const filter = {};
            if (isActive !== undefined) {
                filter.isActive = isActive;
            }

            const result = await this.userService.listUsers({
                page: page || 1,
                limit: limit || 20,
                filter,
                sort: sort || '-createdAt',
            });

            res.json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get single user by ID
    async getUser(req, res, next) {
        try {
            const user = await this.userService.getUser(req.params.id);

            res.json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                user,
            });
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({
                    error: 'User not found',
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Create new user account
    async createUser(req, res, next) {
        try {
            const result = await this.userService.createUser(req.body);

            res.status(201).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'User created successfully',
                user: result.user,
                token: result.token,
            });
        } catch (error) {
            if (error.message === 'Email already in use') {
                return res.status(409).json({
                    error: 'Email already in use',
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Update existing user
    async updateUser(req, res, next) {
        try {
            const user = await this.userService.updateUser(req.params.id, req.body);

            res.json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'User updated successfully',
                user,
            });
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({
                    error: 'User not found',
                    requestId: req.requestId,
                });
            }
            if (error.message === 'Email already in use') {
                return res.status(409).json({
                    error: 'Email already in use',
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Partial update (same as full update in our case)
    async patchUser(req, res, next) {
        return this.updateUser(req, res, next);
    }

    // Soft delete user (sets isActive to false)
    async deleteUser(req, res, next) {
        try {
            await this.userService.deleteUser(req.params.id);

            res.json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'User deleted successfully',
            });
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({
                    error: 'User not found',
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Login user with email and password
    async loginUser(req, res, next) {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({
                    error: {
                        code: 'E1008',
                        message: 'Email and password are required'
                    },
                    requestId: req.requestId,
                });
            }

            const result = await this.userService.loginUser(email, password);

            res.json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Login successful',
                token: result.token,  // JWT token
                user: {
                    _id: result.user._id,
                    email: result.user.email,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName,
                    fullName: result.user.fullName,
                    isActive: result.user.isActive,
                    preferences: result.user.preferences,
                    createdAt: result.user.createdAt,
                    updatedAt: result.user.updatedAt,
                }
            });
        } catch (error) {
            if (error.message === 'Invalid credentials') {
                return res.status(401).json({
                    error: {
                        code: 'E1004',
                        message: 'Invalid email or password'
                    },
                    requestId: req.requestId,
                });
            }
            if (error.message === 'Account is inactive') {
                return res.status(403).json({
                    error: {
                        code: 'E1005',
                        message: 'Account is inactive'
                    },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }
}

export default UserController;