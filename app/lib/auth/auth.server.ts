import { redirect } from 'react-router';
import { Authenticator } from 'remix-auth';
import { OIDCStrategy } from 'remix-auth-openid';
import { prisma } from '../db';
import { env } from '../env.server';
import { clearSession, getSession, setSession } from './session.server';
export interface User extends OIDCStrategy.BaseUser {
	id: string;
	name: string;
	displayName: string | null;
	avatarUrl?: string | null;
	bannerUrl?: string | null;
}

interface Profile {
	sub: string;
	name: string;
	given_name: string;
	family_name: string;
	nickname: string;
	picture: string;
	locale: string;
	updated_at: number;
	preferred_username: string;
	email: string;
	email_verified: boolean;
}

const authenticator = new Authenticator<User>();
const strategy = await OIDCStrategy.init<User>(
	{
		issuer: env.OIDC_ISSUER,
		client_id: env.OIDC_CLIENT_ID,
		redirect_uris: [`${env.VITE_ORIGIN}/auth/callback`],
		response_type: 'code',
		scopes: ['openid', 'profile', 'email'],
		token_endpoint_auth_method: 'none',
		post_logout_redirect_uris: [`${env.VITE_ORIGIN}/`],
		revocation_endpoint: 'https://auth.akarinext.org/oauth/v2/revoke',
		end_session_endpoint: 'https://auth.akarinext.org/oidc/v1/end_session',
		userinfo_endpoint: 'https://auth.akarinext.org/oidc/v1/userinfo',
		https: process.env.NODE_ENV === 'production',
	},
	async ({ tokens, request }): Promise<User> => {
		if (!tokens.id_token) {
			throw new Error('No id_token in response');
		}

		if (!tokens.access_token) {
			throw new Error('No access_token in response');
		}

		const sub = tokens.claims().sub;

		let foundUser = await prisma.user.findFirst({
			select: {
				id: true,
				name: true,
				displayName: true,
				avatarUrl: true,
				bannerUrl: true,
			},
			where: {
				sub,
			},
		});

		if (!foundUser) {
			const profileResponse = await fetch(env.OIDC_USERINFO_ENDPOINT, {
				headers: {
					Authorization: `Bearer ${tokens.access_token}`,
				},
			});

			const profile: Profile = await profileResponse.json();

			const createdUser = await prisma.user.create({
				data: {
					sub,
					name: profile.name,
					displayName: profile.preferred_username,
					avatarUrl: profile.picture,
				},
			});

			foundUser = {
				id: createdUser.id,
				name: profile.name,
				displayName: profile.preferred_username,
				avatarUrl: profile.picture,
				bannerUrl: null,
			};
		}

		return {
			sub,
			accessToken: tokens.access_token,
			idToken: tokens.id_token,
			refreshToken: tokens.refresh_token,
			...foundUser,
			expiredAt:
				Math.floor(new Date().getTime() / 1000) + (tokens.expires_in ?? 0),
		};
	},
);

authenticator.use(strategy, 'zitadel');

async function getUserSession(request: Request): Promise<User | null> {
	const user = await getSession<User>(request);
	if (!user) {
		try {
			const user = await authenticator.authenticate('zitadel', request);
			const headers = await setSession(request, user);
			throw redirect('/', { headers: headers });
		} catch (e) {
			if (e instanceof Response) {
				throw e;
			}
			throw redirect('/');
		}
	}
	return user;
}
async function logout(request: Request) {
	const user = await getUserSession(request);
	if (!user) {
		return redirect('/auth/login');
	}

	try {
		await strategy.postLogoutUrl(user.idToken ?? '');
		const header = await clearSession(request);
		return redirect('/', { headers: header });
	} catch (e) {
		if (e instanceof Response) {
			return e.url;
		}
		throw e;
	}
}

export { authenticator, getUserSession, logout };
