import 'dotenv/config';

import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	server: {
		VITE_ORIGIN: z.string(),
		S3_BUCKET_NAME: z.string(),
		S3_ACCESS_KEY: z.string(),
		S3_SECRET_KEY: z.string(),
		S3_REGION: z.string(),
		S3_ENDPOINT: z.string(),
		S3_PREFIX: z.string().default('*'),

		// OIDCはPKCEを使うので、クライアントシークレットは不要
		OIDC_CLIENT_ID: z.string(),
		OIDC_ISSUER: z.string(),
		OIDC_REDIRECT_URIS: z.string().transform((value) => value.split(',')),
		OIDC_USERINFO_ENDPOINT: z.string(),
		SESSION_SECRET: z.string(),

		// REDIS系
		REDIS_HOST: z.string(),
		REDIS_PORT: z.string().transform((v) => Number(v)),
		REDIS_PASSWORD: z.string().optional(),
	},
	runtimeEnv: process.env,
	isServer: typeof window === 'undefined',
});
