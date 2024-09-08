import { collections } from "$lib/server/database";
import { z } from "zod";
import { authCondition } from "$lib/server/auth";
import { DEFAULT_SETTINGS, type SettingsEditable } from "$lib/types/Settings";
import { ObjectId } from "mongodb";

export async function POST({ request, locals }) {
	const body = await request.json();

	const { ethicsModalAccepted, ...settings } = z
		.object({
			shareConversationsWithModelAuthors: z
				.boolean()
				.default(DEFAULT_SETTINGS.shareConversationsWithModelAuthors),
			hideEmojiOnSidebar: z.boolean().default(DEFAULT_SETTINGS.hideEmojiOnSidebar),
			ethicsModalAccepted: z.boolean().optional(),
			activeModel: z.string().default(DEFAULT_SETTINGS.activeModel),
			customPrompts: z.record(z.string()).default({}),
			tools: z.record(z.boolean()).optional(),
			disableStream: z.boolean().default(false),
			currentConvId: z.string().optional(),
		})
		.parse(body) satisfies SettingsEditable;

	await collections.settings.updateOne(
		authCondition(locals),
		{
			$set: {
				...settings,
				...(ethicsModalAccepted && { ethicsModalAcceptedAt: new Date() }),
				updatedAt: new Date(),
			},
			$setOnInsert: {
				createdAt: new Date(),
			},
		},
		{
			upsert: true,
		}
	);

	if (settings.currentConvId && settings.customPrompts[settings.currentConvId]) {
		await collections.conversations.updateOne(
			{ _id: new ObjectId(settings.currentConvId) },
			{ $set: { preprompt: settings.customPrompts[settings.currentConvId] } }
		);
	}

	// return ok response
	return new Response();
}
