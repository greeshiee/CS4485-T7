export declare const hasAuthParams: (searchParams?: string) => boolean;
export declare const loginError: (error: unknown) => Error;
export declare const tokenError: (error: unknown) => Error;
/**
 * @ignore
 * Helper function to map the v1 `redirectUri` option to the v2 `authorizationParams.redirect_uri`
 * and log a warning.
 */
export declare const deprecateRedirectUri: (options?: any) => void;
//# sourceMappingURL=utils.d.ts.map