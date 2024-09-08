import type { Conversation } from "$lib/types/Conversation";
import type { SharedConversation } from "$lib/types/SharedConversation";

export async function attachFilename(
	sha256: string,
	convId: Conversation["_id"] | SharedConversation["_id"]
): Promise<string> {
	const filename = `${convId.toString()}-${sha256}`;
	return filename;
}
