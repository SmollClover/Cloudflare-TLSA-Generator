export interface CFMessage {
	code: number;
	message: string;
}

export interface CFResponse<CFResult> {
	errors: CFMessage[];
	messages: CFMessage[];
	success: boolean;
	result_info: {
		count: number;
		page: number;
		per_page: number;
		total_count: number;
	};
	result: CFResult;
}

export interface CFVerifyToken {
	expires_on: string;
	id: string;
	not_before: string;
	status: string;
}
