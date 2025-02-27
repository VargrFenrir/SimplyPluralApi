import { Request, Response } from "express";
import { fetchSimpleDocument, addSimpleDocument, updateSimpleDocument, deleteSimpleDocument, fetchCollection } from "../../util";
import { ajv, validateSchema } from "../../util/validation";

export const getPolls = async (req: Request, res: Response) => {
	fetchCollection(req, res, "polls", {});
};

export const get = async (req: Request, res: Response) => {
	fetchSimpleDocument(req, res, "polls");
};

export const add = async (req: Request, res: Response) => {
	addSimpleDocument(req, res, "polls");
};

export const update = async (req: Request, res: Response) => {
	updateSimpleDocument(req, res, "polls");
};

export const del = async (req: Request, res: Response) => {
	deleteSimpleDocument(req, res, "polls");
};

const voteType = {
	type: "object",
	properties: {
		id: { type: "string" },
		comment: { type: "string" },
		vote: { type: "string" },
	},
	nullable: false,
	additionalProperties: false,
};

const normalVote = {
	type: "object",
	properties: {
		name: { type: "string" },
		desc: { type: "string" },
		allowAbstain: { type: "boolean" },
		allowVeto: { type: "boolean" },
		endTime: { type: "number" },
		custom: {
			type: "boolean",
			enum: [false],
		},
		votes: {
			type: "array",
			items: voteType,
		},
		supportDescMarkdown: { type: "boolean" },
	},
	nullable: false,
	additionalProperties: false,
};

const customVote = {
	type: "object",
	properties: {
		name: { type: "string" },
		desc: { type: "string" },
		endTime: { type: "number" },
		custom: {
			type: "boolean",
			enum: [true],
		},
		options: {
			type: "array",
			items: {
				type: "object",
				properties: {
					name: { type: "string" },
					color: { type: "string" },
				},
				nullable: false,
				additionalProperties: false,
			},
		},
		votes: {
			type: "array",
			items: voteType,
		},
		supportDescMarkdown: { type: "boolean" },
	},
	nullable: false,
	additionalProperties: false,
};

const s_validatePollSchema = {
	anyOf: [normalVote, customVote],
};
const v_validatePollSchema = ajv.compile(s_validatePollSchema)

export const validatePollSchema = (body: unknown): { success: boolean; msg: string } => {
	const result = validateSchema(v_validatePollSchema, body);
	if (!result.success) {
		return result;
	}

	return result;
};

const normalPostVote = {
	type: "object",
	properties: {
		name: { type: "string" },
		desc: { type: "string" },
		allowAbstain: { type: "boolean" },
		allowVeto: { type: "boolean" },
		endTime: { type: "number" },
		custom: {
			type: "boolean",
			enum: [false],
		},
		votes: {
			type: "array",
			items: voteType,
		},
		supportDescMarkdown: { type: "boolean" },
	},
	nullable: false,
	required: ["name", "desc", "custom", "endTime"],
	additionalProperties: false,
};

const customPostVote = {
	type: "object",
	properties: {
		name: { type: "string" },
		desc: { type: "string" },
		endTime: { type: "number" },
		custom: {
			type: "boolean",
			enum: [true],
		},
		options: {
			type: "array",
			items: {
				type: "object",
				properties: {
					name: { type: "string" },
					color: { type: "string" },
				},
				nullable: false,
				additionalProperties: false,
			},
		},
		votes: {
			type: "array",
			items: voteType,
		},
		supportDescMarkdown: { type: "boolean" },
	},
	required: ["name", "desc", "custom", "endTime"],
	nullable: false,
	additionalProperties: false,
};

const s_validatePostPollSchema = {
	anyOf: [normalPostVote, customPostVote],
};
const v_validatePostPollSchema = ajv.compile(s_validatePostPollSchema)

export const validatePostPollSchema = (body: unknown): { success: boolean; msg: string } => {
	const result = validateSchema(v_validatePostPollSchema, body);
	if (!result.success) {
		return result;
	}

	return result;
};
