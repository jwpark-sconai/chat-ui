import { base } from "$app/paths";
import { redirect } from "@sveltejs/kit";
import { collections } from "$lib/server/database";
import { authCondition } from "$lib/server/auth";

export const actions = {
	async delete({ locals }) {
		// double check we have a user to delete conversations for
		if (locals.user?._id || locals.sessionId) {
			await collections.conversations.deleteMany({
				...authCondition(locals),
			});
			console.log("deleted sessionId.");
		}

		redirect(303, `${base}/`);
	},
};
