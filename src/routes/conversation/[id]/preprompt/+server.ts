import { collections } from "$lib/server/database";
import { ObjectId } from "mongodb";
import { json } from "@sveltejs/kit";

export async function GET({ params }) {
	if (!params.id) {
		return new Response(null, { status: 400, statusText: "Bad Request" }); // Return a 400 Bad Request if no ID is provided
	}

	const conversationId = new ObjectId(params.id);
	const conv = await collections.conversations.findOne({ _id: conversationId });

	if (conv?.preprompt) {
		return json(conv.preprompt); // Return the preprompt as JSON response
	} else {
		return new Response(null, { status: 204, statusText: "No Content" }); // Return a 204 No Content if there's no preprompt
	}
}
