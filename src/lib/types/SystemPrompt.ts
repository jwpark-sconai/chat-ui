import type { Timestamps } from "./Timestamps";
import type { ObjectId } from "mongodb";
import type { User } from "$lib/types/User";

export interface SystemPrompt extends Timestamps {
	_id: ObjectId;
	convId: ObjectId;
	createdBy: User["_id"] | string;
	prompt: string;
}
