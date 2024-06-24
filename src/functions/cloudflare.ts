import type { CFResponse, CFVerifyToken } from '../interfaces/cloudflare';

const BASE = 'https://api.cloudflare.com/client/v4';
const HEADERS = {
	Authorization: `Bearer ${Bun.env.CF_API_TOKEN}`,
	'Content-Type': 'application/json',
};

async function handleResponse<CFType>(response: Response) {
	const data = (await response.json()) as CFResponse<CFType>;

	if (!data.success || data.errors.length > 0) throw new Error(JSON.stringify(data.errors, null, 2));

	return data;
}

export async function verifyToken() {
	const response = await fetch(`${BASE}/user/tokens/verify`, {
		method: 'GET',
		headers: HEADERS,
	});

	const result = await handleResponse<CFVerifyToken>(response);
	if (result.result.status === 'active') return true;

	console.log('Token not valid');
	console.log(`Status: ${result.result.status}`);
	console.log(`Not before: ${result.result.not_before}`);
	console.log(`Expires on: ${result.result.expires_on}`);
	return false;
}

// export async function listZones() {
// 	const response = await fetch(`${BASE}/zones`, {
// 		method: 'GET',
// 		headers: HEADERS,
// 	});

// 	console.log(response);
// }
