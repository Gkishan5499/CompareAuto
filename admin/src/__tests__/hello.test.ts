import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock data for CRUD operations
interface AdminItem {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

class AdminCRUDService {
    private items: AdminItem[] = [];
    private idCounter = 1;

    // CREATE
    create(data: Omit<AdminItem, 'id' | 'createdAt'>): AdminItem {
        const newItem: AdminItem = {
            ...data,
            id: `admin_${this.idCounter++}`,
            createdAt: new Date().toISOString(),
        };
        this.items.push(newItem);
        return newItem;
    }

    // READ
    getAll(): AdminItem[] {
        return [...this.items];
    }

    getById(id: string): AdminItem | undefined {
        return this.items.find(item => item.id === id);
    }

    // UPDATE
    update(id: string, data: Partial<Omit<AdminItem, 'id' | 'createdAt'>>): AdminItem | null {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1) return null;
        
        this.items[index] = { ...this.items[index], ...data };
        return this.items[index];
    }

    // DELETE
    delete(id: string): boolean {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1) return false;
        
        this.items.splice(index, 1);
        return true;
    }
}

describe('Admin CRUD Operations', () => {
    let adminService: AdminCRUDService;

    beforeEach(() => {
        adminService = new AdminCRUDService();
    });

    // CREATE Tests
    describe('CREATE Operations', () => {
        it('should create a new admin user', () => {
            const adminData = {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'super_admin',
            };

            const result = adminService.create(adminData);

            expect(result).toHaveProperty('id');
            expect(result.name).toBe('John Doe');
            expect(result.email).toBe('john@example.com');
            expect(result.role).toBe('super_admin');
            expect(result).toHaveProperty('createdAt');
        });

        it('should generate unique IDs for multiple admin users', () => {
            const admin1 = adminService.create({
                name: 'Admin One',
                email: 'admin1@example.com',
                role: 'admin',
            });

            const admin2 = adminService.create({
                name: 'Admin Two',
                email: 'admin2@example.com',
                role: 'editor',
            });

            expect(admin1.id).not.toBe(admin2.id);
            expect(admin1.id).toMatch(/^admin_\d+$/);
            expect(admin2.id).toMatch(/^admin_\d+$/);
        });

        it('should add created admin to the list', () => {
            adminService.create({
                name: 'Test Admin',
                email: 'test@example.com',
                role: 'admin',
            });

            const allAdmins = adminService.getAll();
            expect(allAdmins).toHaveLength(1);
        });
    });

    // READ Tests
    describe('READ Operations', () => {
        beforeEach(() => {
            adminService.create({
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
            });
            adminService.create({
                name: 'Editor User',
                email: 'editor@example.com',
                role: 'editor',
            });
        });

        it('should retrieve all admin users', () => {
            const admins = adminService.getAll();

            expect(admins).toHaveLength(2);
            expect(admins[0].name).toBe('Admin User');
            expect(admins[1].name).toBe('Editor User');
        });

        it('should retrieve a specific admin user by ID', () => {
            const allAdmins = adminService.getAll();
            const adminId = allAdmins[0].id;

            const result = adminService.getById(adminId);

            expect(result).toBeDefined();
            expect(result?.name).toBe('Admin User');
            expect(result?.email).toBe('admin@example.com');
        });

        it('should return undefined for non-existent admin ID', () => {
            const result = adminService.getById('non_existent_id');

            expect(result).toBeUndefined();
        });

        it('should return empty array when no admins exist', () => {
            const emptyService = new AdminCRUDService();
            const result = emptyService.getAll();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });
    });

    // UPDATE Tests
    describe('UPDATE Operations', () => {
        let adminId: string;

        beforeEach(() => {
            const created = adminService.create({
                name: 'Original Name',
                email: 'original@example.com',
                role: 'editor',
            });
            adminId = created.id;
        });

        it('should update admin name', () => {
            const result = adminService.update(adminId, {
                name: 'Updated Name',
            });

            expect(result).not.toBeNull();
            expect(result?.name).toBe('Updated Name');
            expect(result?.email).toBe('original@example.com');
        });

        it('should update admin email', () => {
            const result = adminService.update(adminId, {
                email: 'newemail@example.com',
            });

            expect(result?.email).toBe('newemail@example.com');
        });

        it('should update admin role', () => {
            const result = adminService.update(adminId, {
                role: 'super_admin',
            });

            expect(result?.role).toBe('super_admin');
        });

        it('should update multiple fields at once', () => {
            const result = adminService.update(adminId, {
                name: 'New Name',
                email: 'new@example.com',
                role: 'super_admin',
            });

            expect(result?.name).toBe('New Name');
            expect(result?.email).toBe('new@example.com');
            expect(result?.role).toBe('super_admin');
        });

        it('should return null for non-existent admin', () => {
            const result = adminService.update('non_existent', {
                name: 'New Name',
            });

            expect(result).toBeNull();
        });

        it('should preserve createdAt timestamp when updating', () => {
            const original = adminService.getById(adminId);
            const updated = adminService.update(adminId, {
                name: 'New Name',
            });

            expect(updated?.createdAt).toBe(original?.createdAt);
        });
    });

    // DELETE Tests
    describe('DELETE Operations', () => {
        let adminId: string;

        beforeEach(() => {
            const created = adminService.create({
                name: 'User to Delete',
                email: 'delete@example.com',
                role: 'editor',
            });
            adminId = created.id;
            
            adminService.create({
                name: 'User to Keep',
                email: 'keep@example.com',
                role: 'admin',
            });
        });

        it('should delete an admin user by ID', () => {
            const result = adminService.delete(adminId);

            expect(result).toBe(true);
            expect(adminService.getById(adminId)).toBeUndefined();
        });

        it('should remove deleted user from all list', () => {
            adminService.delete(adminId);
            const allAdmins = adminService.getAll();

            expect(allAdmins).toHaveLength(1);
            expect(allAdmins[0].name).toBe('User to Keep');
        });

        it('should return false when deleting non-existent admin', () => {
            const result = adminService.delete('non_existent_id');

            expect(result).toBe(false);
        });

        it('should not affect other admins when deleting one', () => {
            const allAdminsBefore = adminService.getAll();
            const countBefore = allAdminsBefore.length;

            adminService.delete(adminId);
            const allAdminsAfter = adminService.getAll();

            expect(allAdminsAfter).toHaveLength(countBefore - 1);
            expect(allAdminsAfter[0].email).toBe('keep@example.com');
        });
    });
});

// Authentication and Authorization Tests
interface AuthToken {
    token: string;
    expiresAt: number;
    refreshToken: string;
}

interface AuthUser {
    id: string;
    email: string;
    role: string;
}

class AuthenticationService {
    private tokens: Map<string, AuthToken> = new Map();
    private sessions: Map<string, AuthUser> = new Map();
    private readonly TOKEN_EXPIRY = 3600000; // 1 hour in ms

    login(email: string, password: string): { token: AuthToken; user: AuthUser } | null {
        // Mock user database
        const users = [
            { id: 'admin_1', email: 'admin@example.com', password: 'admin123', role: 'super_admin' },
            { id: 'user_1', email: 'editor@example.com', password: 'editor123', role: 'editor' },
        ];

        const user = users.find(u => u.email === email && u.password === password);
        if (!user) return null;

        const token: AuthToken = {
            token: this.generateToken(),
            expiresAt: Date.now() + this.TOKEN_EXPIRY,
            refreshToken: this.generateRefreshToken(),
        };

        this.tokens.set(token.token, token);
        const authUser: AuthUser = { id: user.id, email: user.email, role: user.role };
        this.sessions.set(token.token, authUser);

        return { token, user: authUser };
    }

    logout(token: string): boolean {
        const deleted = this.tokens.delete(token);
        this.sessions.delete(token);
        return deleted;
    }

    validateToken(token: string): boolean {
        const tokenData = this.tokens.get(token);
        if (!tokenData) return false;
        
        if (Date.now() > tokenData.expiresAt) {
            this.tokens.delete(token);
            return false;
        }

        return true;
    }

    getSessionUser(token: string): AuthUser | null {
        if (!this.validateToken(token)) return null;
        return this.sessions.get(token) || null;
    }

    refreshToken(oldToken: string, refreshToken: string): AuthToken | null {
        const tokenData = this.tokens.get(oldToken);
        if (!tokenData || tokenData.refreshToken !== refreshToken) return null;

        // Get user BEFORE deleting old token
        const user = this.sessions.get(oldToken);
        if (!user) return null;

        const newToken: AuthToken = {
            token: this.generateToken(),
            expiresAt: Date.now() + this.TOKEN_EXPIRY,
            refreshToken: this.generateRefreshToken(),
        };

        // Delete old token
        this.tokens.delete(oldToken);
        this.sessions.delete(oldToken);

        // Add new token with preserved user
        this.tokens.set(newToken.token, newToken);
        this.sessions.set(newToken.token, user);

        return newToken;
    }

    hasPermission(token: string, requiredRole: string): boolean {
        const user = this.getSessionUser(token);
        if (!user) return false;

        const roleHierarchy: { [key: string]: number } = {
            'super_admin': 3,
            'admin': 2,
            'editor': 1,
        };

        return (roleHierarchy[user.role] || 0) >= (roleHierarchy[requiredRole] || 0);
    }

    private generateToken(): string {
        return 'token_' + Math.random().toString(36).substr(2, 9);
    }

    private generateRefreshToken(): string {
        return 'refresh_' + Math.random().toString(36).substr(2, 9);
    }
}

describe('Authentication & Authorization', () => {
    let authService: AuthenticationService;

    beforeEach(() => {
        authService = new AuthenticationService();
    });

    // Login Tests
    describe('Login Authentication', () => {
        it('should successfully login with valid credentials', () => {
            const result = authService.login('admin@example.com', 'admin123');

            expect(result).not.toBeNull();
            expect(result?.token.token).toBeDefined();
            expect(result?.user.email).toBe('admin@example.com');
            expect(result?.user.role).toBe('super_admin');
        });

        it('should return null for invalid email', () => {
            const result = authService.login('invalid@example.com', 'admin123');

            expect(result).toBeNull();
        });

        it('should return null for invalid password', () => {
            const result = authService.login('admin@example.com', 'wrongpassword');

            expect(result).toBeNull();
        });

        it('should generate unique tokens for each login', () => {
            const login1 = authService.login('admin@example.com', 'admin123');
            const login2 = authService.login('admin@example.com', 'admin123');

            expect(login1?.token.token).not.toBe(login2?.token.token);
            expect(login1?.token.refreshToken).not.toBe(login2?.token.refreshToken);
        });

        it('should include expiry time in token', () => {
            const result = authService.login('admin@example.com', 'admin123');
            const now = Date.now();

            expect(result?.token.expiresAt).toBeGreaterThan(now);
            expect(result?.token.expiresAt).toBeLessThanOrEqual(now + 3600000);
        });

        it('should login different users with different roles', () => {
            const adminLogin = authService.login('admin@example.com', 'admin123');
            const editorLogin = authService.login('editor@example.com', 'editor123');

            expect(adminLogin?.user.role).toBe('super_admin');
            expect(editorLogin?.user.role).toBe('editor');
        });
    });

    // Token Validation Tests
    describe('Token Validation', () => {
        let validToken: string;

        beforeEach(() => {
            const result = authService.login('admin@example.com', 'admin123');
            validToken = result!.token.token;
        });

        it('should validate a valid token', () => {
            const isValid = authService.validateToken(validToken);

            expect(isValid).toBe(true);
        });

        it('should reject an invalid token', () => {
            const isValid = authService.validateToken('invalid_token_xyz');

            expect(isValid).toBe(false);
        });

        it('should reject an expired token', () => {
            // Create an expired token by manipulating time
            const expiredLogin = authService.login('admin@example.com', 'admin123');
            const expiredToken = expiredLogin!.token.token;

            // Simulate time passing by setting expiry to past
            const now = Date.now();
            vi.useFakeTimers();
            vi.setSystemTime(now + 3600001); // Move time forward past expiry

            const isValid = authService.validateToken(expiredToken);
            vi.useRealTimers();

            expect(isValid).toBe(false);
        });

        it('should return user info for valid token', () => {
            const sessionUser = authService.getSessionUser(validToken);

            expect(sessionUser).not.toBeNull();
            expect(sessionUser?.email).toBe('admin@example.com');
            expect(sessionUser?.id).toBe('admin_1');
        });

        it('should return null for invalid token session', () => {
            const sessionUser = authService.getSessionUser('fake_token');

            expect(sessionUser).toBeNull();
        });
    });

    // Protected Routes Tests
    describe('Protected Routes & Authorization', () => {
        let adminToken: string;
        let editorToken: string;

        beforeEach(() => {
            const adminLogin = authService.login('admin@example.com', 'admin123');
            adminToken = adminLogin!.token.token;

            const editorLogin = authService.login('editor@example.com', 'editor123');
            editorToken = editorLogin!.token.token;
        });

        it('should allow super_admin to access admin-only routes', () => {
            const hasPermission = authService.hasPermission(adminToken, 'admin');

            expect(hasPermission).toBe(true);
        });

        it('should allow super_admin to access super_admin routes', () => {
            const hasPermission = authService.hasPermission(adminToken, 'super_admin');

            expect(hasPermission).toBe(true);
        });

        it('should deny editor access to admin-only routes', () => {
            const hasPermission = authService.hasPermission(editorToken, 'admin');

            expect(hasPermission).toBe(false);
        });

        it('should allow editor to access editor routes', () => {
            const hasPermission = authService.hasPermission(editorToken, 'editor');

            expect(hasPermission).toBe(true);
        });

        it('should deny access with invalid token', () => {
            const hasPermission = authService.hasPermission('invalid_token', 'admin');

            expect(hasPermission).toBe(false);
        });

        it('should deny access after logout', () => {
            authService.logout(adminToken);
            const hasPermission = authService.hasPermission(adminToken, 'admin');

            expect(hasPermission).toBe(false);
        });

        it('should maintain role hierarchy', () => {
            // Admin can access everything admin and below
            expect(authService.hasPermission(adminToken, 'super_admin')).toBe(true);
            expect(authService.hasPermission(adminToken, 'admin')).toBe(true);
            expect(authService.hasPermission(adminToken, 'editor')).toBe(true);

            // Editor can only access editor level
            expect(authService.hasPermission(editorToken, 'editor')).toBe(true);
            expect(authService.hasPermission(editorToken, 'admin')).toBe(false);
            expect(authService.hasPermission(editorToken, 'super_admin')).toBe(false);
        });
    });

    // Token Refresh Tests
    describe('Token Refresh', () => {
        let oldToken: string;
        let refreshToken: string;

        beforeEach(() => {
            const login = authService.login('admin@example.com', 'admin123');
            oldToken = login!.token.token;
            refreshToken = login!.token.refreshToken;
        });

        it('should refresh token with valid refresh token', () => {
            const newTokenData = authService.refreshToken(oldToken, refreshToken);

            expect(newTokenData).not.toBeNull();
            expect(newTokenData?.token).not.toBe(oldToken);
        });

        it('should invalidate old token after refresh', () => {
            authService.refreshToken(oldToken, refreshToken);
            const isValid = authService.validateToken(oldToken);

            expect(isValid).toBe(false);
        });

        it('should validate new token after refresh', () => {
            const newTokenData = authService.refreshToken(oldToken, refreshToken);
            const isValid = authService.validateToken(newTokenData!.token);

            expect(isValid).toBe(true);
        });

        it('should reject refresh with invalid refresh token', () => {
            const newTokenData = authService.refreshToken(oldToken, 'invalid_refresh_token');

            expect(newTokenData).toBeNull();
        });

        it('should reject refresh for non-existent token', () => {
            const newTokenData = authService.refreshToken('fake_token', refreshToken);

            expect(newTokenData).toBeNull();
        });

        it('should preserve user session after token refresh', () => {
            const originalUser = authService.getSessionUser(oldToken);
            const newTokenData = authService.refreshToken(oldToken, refreshToken);
            const newUser = authService.getSessionUser(newTokenData!.token);

            expect(newUser?.email).toBe(originalUser?.email);
            expect(newUser?.role).toBe(originalUser?.role);
        });
    });

    // Logout Tests
    describe('Logout', () => {
        let token: string;

        beforeEach(() => {
            const login = authService.login('admin@example.com', 'admin123');
            token = login!.token.token;
        });

        it('should logout successfully', () => {
            const result = authService.logout(token);

            expect(result).toBe(true);
        });

        it('should invalidate token after logout', () => {
            authService.logout(token);
            const isValid = authService.validateToken(token);

            expect(isValid).toBe(false);
        });

        it('should remove user session after logout', () => {
            authService.logout(token);
            const user = authService.getSessionUser(token);

            expect(user).toBeNull();
        });

        it('should return false when logging out already logged out token', () => {
            authService.logout(token);
            const result = authService.logout(token);

            expect(result).toBe(false);
        });
    });
});

// API Mocking and Navigation Tests
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface NavigationState {
    currentRoute: string;
    redirectTo?: string;
}

class ApiService {
    async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: AuthUser }>> {
        // Simulated API call
        if (!email || !password) {
            return { success: false, error: 'Email and password required' };
        }
        
        if (email.includes('error')) {
            return { success: false, error: 'Invalid credentials' };
        }

        return {
            success: true,
            data: {
                token: `token_${Math.random()}`,
                user: { id: 'user_1', email, role: 'admin' },
            },
        };
    }

    async logout(): Promise<ApiResponse<null>> {
        return { success: true, data: null };
    }

    async fetchAdmins(): Promise<ApiResponse<AdminItem[]>> {
        return { success: true, data: [] };
    }

    async createAdmin(data: Omit<AdminItem, 'id' | 'createdAt'>): Promise<ApiResponse<AdminItem>> {
        return { success: true, data: { ...data, id: 'admin_1', createdAt: new Date().toISOString() } };
    }
}

class NavigationService {
    private state: NavigationState = { currentRoute: '/login' };

    getCurrentRoute(): string {
        return this.state.currentRoute;
    }

    navigate(route: string): void {
        this.state.currentRoute = route;
    }

    setRedirect(route: string): void {
        this.state.redirectTo = route;
    }

    getRedirect(): string | undefined {
        return this.state.redirectTo;
    }

    clearRedirect(): void {
        this.state.redirectTo = undefined;
    }
}

class ErrorHandler {
    private errors: string[] = [];

    addError(error: string): void {
        this.errors.push(error);
    }

    getErrors(): string[] {
        return [...this.errors];
    }

    hasErrors(): boolean {
        return this.errors.length > 0;
    }

    clearErrors(): void {
        this.errors = [];
    }

    getLastError(): string | undefined {
        return this.errors[this.errors.length - 1];
    }
}

describe('API Mocking and Navigation', () => {
    let apiService: ApiService;
    let navigationService: NavigationService;
    let errorHandler: ErrorHandler;

    beforeEach(() => {
        apiService = new ApiService();
        navigationService = new NavigationService();
        errorHandler = new ErrorHandler();
    });

    // API Response Mocking Tests
    describe('API Response Mocking', () => {
        it('should mock successful login API response', async () => {
            const response = await apiService.login('user@example.com', 'password123');

            expect(response.success).toBe(true);
            expect(response.data?.token).toBeDefined();
            expect(response.data?.user.email).toBe('user@example.com');
            expect(response.error).toBeUndefined();
        });

        it('should mock failed login API response', async () => {
            const response = await apiService.login('error@example.com', 'password123');

            expect(response.success).toBe(false);
            expect(response.data).toBeUndefined();
            expect(response.error).toBe('Invalid credentials');
        });

        it('should mock validation error API response', async () => {
            const response = await apiService.login('', '');

            expect(response.success).toBe(false);
            expect(response.error).toBe('Email and password required');
        });

        it('should mock logout API response', async () => {
            const response = await apiService.logout();

            expect(response.success).toBe(true);
            expect(response.data).toBeNull();
        });

        it('should mock fetch admins API response', async () => {
            const response = await apiService.fetchAdmins();

            expect(response.success).toBe(true);
            expect(Array.isArray(response.data)).toBe(true);
        });

        it('should mock create admin API response', async () => {
            const response = await apiService.createAdmin({
                name: 'Test Admin',
                email: 'test@example.com',
                role: 'admin',
            });

            expect(response.success).toBe(true);
            expect(response.data?.id).toBeDefined();
            expect(response.data?.createdAt).toBeDefined();
        });
    });

    // Navigation Tests
    describe('Navigation After API Calls', () => {
        it('should navigate to dashboard after successful login', async () => {
            const response = await apiService.login('user@example.com', 'password123');

            if (response.success) {
                navigationService.navigate('/dashboard');
            }

            expect(navigationService.getCurrentRoute()).toBe('/dashboard');
        });

        it('should navigate to admin list after creating admin', async () => {
            const response = await apiService.createAdmin({
                name: 'New Admin',
                email: 'admin@example.com',
                role: 'admin',
            });

            if (response.success) {
                navigationService.navigate('/admins');
            }

            expect(navigationService.getCurrentRoute()).toBe('/admins');
        });

        it('should stay on login page after failed login', async () => {
            navigationService.navigate('/login');
            const response = await apiService.login('error@example.com', 'password123');

            if (!response.success) {
                // Should remain on login page
                expect(navigationService.getCurrentRoute()).toBe('/login');
            }
        });

        it('should set redirect after logout', async () => {
            navigationService.navigate('/dashboard');
            navigationService.setRedirect('/login');

            expect(navigationService.getRedirect()).toBe('/login');
        });

        it('should clear redirect after navigation', async () => {
            navigationService.setRedirect('/login');
            navigationService.navigate('/login');
            navigationService.clearRedirect();

            expect(navigationService.getRedirect()).toBeUndefined();
        });
    });

    // Error State Tests
    describe('Error State Handling', () => {
        it('should capture API error message', async () => {
            const response = await apiService.login('error@example.com', 'password123');

            if (!response.success) {
                errorHandler.addError(response.error || 'Unknown error');
            }

            expect(errorHandler.hasErrors()).toBe(true);
            expect(errorHandler.getLastError()).toBe('Invalid credentials');
        });

        it('should accumulate multiple errors', async () => {
            errorHandler.addError('Error 1');
            errorHandler.addError('Error 2');
            errorHandler.addError('Error 3');

            expect(errorHandler.getErrors()).toHaveLength(3);
            expect(errorHandler.getErrors()[0]).toBe('Error 1');
            expect(errorHandler.getErrors()[2]).toBe('Error 3');
        });

        it('should get last error from stack', async () => {
            errorHandler.addError('First error');
            errorHandler.addError('Second error');
            errorHandler.addError('Latest error');

            expect(errorHandler.getLastError()).toBe('Latest error');
        });

        it('should clear all errors', async () => {
            errorHandler.addError('Error 1');
            errorHandler.addError('Error 2');
            errorHandler.clearErrors();

            expect(errorHandler.hasErrors()).toBe(false);
            expect(errorHandler.getErrors()).toHaveLength(0);
        });

        it('should report validation errors', async () => {
            const response = await apiService.login('', '');

            if (!response.success) {
                errorHandler.addError(response.error || 'Unknown error');
            }

            expect(errorHandler.hasErrors()).toBe(true);
            expect(errorHandler.getLastError()).toBe('Email and password required');
        });
    });

    // Integration: API + Navigation + Error Handling
    describe('API + Navigation + Error Handling Integration', () => {
        it('should navigate on success and not show errors', async () => {
            const response = await apiService.login('user@example.com', 'password123');

            if (response.success) {
                navigationService.navigate('/dashboard');
                errorHandler.clearErrors();
            } else {
                errorHandler.addError(response.error || 'Login failed');
            }

            expect(navigationService.getCurrentRoute()).toBe('/dashboard');
            expect(errorHandler.hasErrors()).toBe(false);
        });

        it('should stay on page and show error on failure', async () => {
            navigationService.navigate('/login');
            const response = await apiService.login('error@example.com', 'wrongpass');

            if (response.success) {
                navigationService.navigate('/dashboard');
            } else {
                errorHandler.addError(response.error || 'Login failed');
            }

            expect(navigationService.getCurrentRoute()).toBe('/login');
            expect(errorHandler.hasErrors()).toBe(true);
            expect(errorHandler.getLastError()).toBe('Invalid credentials');
        });

        it('should clear errors on successful retry', async () => {
            // First attempt fails
            let response = await apiService.login('error@example.com', 'wrongpass');
            if (!response.success) {
                errorHandler.addError(response.error || 'Login failed');
            }

            expect(errorHandler.hasErrors()).toBe(true);

            // Second attempt succeeds
            errorHandler.clearErrors();
            response = await apiService.login('user@example.com', 'correctpass');

            if (response.success) {
                navigationService.navigate('/dashboard');
            }

            expect(errorHandler.hasErrors()).toBe(false);
            expect(navigationService.getCurrentRoute()).toBe('/dashboard');
        });

        it('should handle multiple API calls with error tracking', async () => {
            // Create admin
            let response = await apiService.createAdmin({
                name: 'Admin 1',
                email: 'admin1@example.com',
                role: 'admin',
            });

            if (response.success) {
                navigationService.navigate('/admins');
            } else {
                errorHandler.addError(response.error || 'Failed to create admin');
            }

            // Fetch admins
            const adminsResponse = await apiService.fetchAdmins();

            if (adminsResponse.success) {
                expect(navigationService.getCurrentRoute()).toBe('/admins');
                expect(errorHandler.hasErrors()).toBe(false);
            }
        });

        it('should handle sequential operations with state management', async () => {
            // Login
            let response = await apiService.login('user@example.com', 'password123');
            expect(response.success).toBe(true);

            navigationService.navigate('/dashboard');

            // Fetch data
            const adminsResponse = await apiService.fetchAdmins();
            expect(adminsResponse.success).toBe(true);

            // Create new admin
            const createResponse = await apiService.createAdmin({
                name: 'New Admin',
                email: 'newadmin@example.com',
                role: 'admin',
            });

            expect(createResponse.success).toBe(true);
            navigationService.navigate('/admins');

            // Verify final state
            expect(navigationService.getCurrentRoute()).toBe('/admins');
            expect(errorHandler.hasErrors()).toBe(false);
        });
    });

    // Mock API with Async Operations
    describe('Async API Operations', () => {
        it('should handle async API call and update navigation', async () => {
            const loginPromise = apiService.login('user@example.com', 'password123');
            const response = await loginPromise;

            expect(response.success).toBe(true);

            if (response.success) {
                navigationService.navigate('/dashboard');
            }

            expect(navigationService.getCurrentRoute()).toBe('/dashboard');
        });

        it('should handle multiple concurrent API calls', async () => {
            const adminsPromise = apiService.fetchAdmins();
            const createPromise = apiService.createAdmin({
                name: 'Admin',
                email: 'admin@example.com',
                role: 'admin',
            });

            const [adminsRes, createRes] = await Promise.all([adminsPromise, createPromise]);

            expect(adminsRes.success).toBe(true);
            expect(createRes.success).toBe(true);
        });

        it('should handle API call with timeout simulation', async () => {
            const timeoutPromise = new Promise<ApiResponse<null>>((resolve) => {
                setTimeout(() => {
                    resolve({ success: true, data: null });
                }, 10);
            });

            const response = await timeoutPromise;
            expect(response.success).toBe(true);
        });
    });
});