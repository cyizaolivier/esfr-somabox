export function parseJsonSafe<T>(data: string | null, fallback: T): T {
    if (!data) return fallback;
    try {
        const parsed = JSON.parse(data);
        // If the string was "null", result is null. 
        // If we have a non-null fallback (like []), use the fallback instead.
        if (parsed === null && fallback !== null) return fallback;
        return parsed as T;
    } catch (error) {
        console.warn('Failed to parse JSON data from storage:', error);
        return fallback;
    }
}

/**
 * Self-healing localStorage sanitizer.
 *
 * Runs ONCE at app startup (called from main.tsx before React mounts).
 * It checks every critical key and removes any value that is:
 *   - Not valid JSON
 *   - The wrong type (e.g. the API returned an object but the app expects an array)
 *   - Structurally invalid (e.g. soma_auth without required email/role fields)
 *
 * This means users never need to manually run localStorage.clear() again —
 * bad data is detected and wiped automatically on the next page load.
 */
export function sanitizeStorage(): void {
    const ARRAY_KEYS = [
        'soma_users',
        'soma_student_progress',
        'soma_enrollments',
        'soma_courses',
        'soma_notifications',
        'soma_course_comments',
    ];

    // Rule 1: These keys must always be JSON arrays
    for (const key of ARRAY_KEYS) {
        const raw = localStorage.getItem(key);
        if (raw === null) continue; // missing is fine

        try {
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                console.warn(`[storage] Removing corrupt "${key}": expected array, got`, typeof parsed);
                localStorage.removeItem(key);
            }
        } catch {
            console.warn(`[storage] Removing unparseable "${key}"`);
            localStorage.removeItem(key);
        }
    }

    // Rule 2: soma_auth must be a valid user object with email + role
    const rawAuth = localStorage.getItem('soma_auth');
    if (rawAuth !== null) {
        try {
            const parsed = JSON.parse(rawAuth);
            if (
                typeof parsed !== 'object' ||
                parsed === null ||
                typeof parsed.email !== 'string' ||
                typeof parsed.role !== 'string'
            ) {
                console.warn('[storage] Removing corrupt "soma_auth": missing email or role');
                localStorage.removeItem('soma_auth');
                localStorage.removeItem('soma_token'); // always pair-remove
            }
        } catch {
            console.warn('[storage] Removing unparseable "soma_auth"');
            localStorage.removeItem('soma_auth');
            localStorage.removeItem('soma_token');
        }
    }

    // Rule 3: soma_profile must be an object (not null, array, or primitive)
    const rawProfile = localStorage.getItem('soma_profile');
    if (rawProfile !== null) {
        try {
            const parsed = JSON.parse(rawProfile);
            if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                console.warn('[storage] Removing corrupt "soma_profile"');
                localStorage.removeItem('soma_profile');
            }
        } catch {
            console.warn('[storage] Removing unparseable "soma_profile"');
            localStorage.removeItem('soma_profile');
        }
    }
}
