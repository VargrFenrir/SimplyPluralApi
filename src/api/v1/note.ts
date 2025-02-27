import { Request, Response } from "express";
import { getCollection } from "../../modules/mongo";
import { fetchSimpleDocument, addSimpleDocument, updateSimpleDocument, sendQuery, deleteSimpleDocument } from "../../util";
import { ajv, validateSchema } from "../../util/validation";

export const getNotesForMember = async (req: Request, res: Response) => {
	const documents = await getCollection("notes").find({ uid: req.params.system, member: req.params.member });
	sendQuery(req, res, "notes", documents.stream());
};

export const get = async (req: Request, res: Response) => {
	fetchSimpleDocument(req, res, "notes");
};

export const add = async (req: Request, res: Response) => {
	addSimpleDocument(req, res, "notes");
};

export const update = async (req: Request, res: Response) => {
	updateSimpleDocument(req, res, "notes");
};

export const del = async (req: Request, res: Response) => {
	deleteSimpleDocument(req, res, "notes");
};

const s_validateNoteSchema = {
	type: "object",
	properties: {
		title: { type: "string" },
		note: { type: "string" },
		color: { type: "string" },
		supportMarkdown: { type: "boolean" },
	},
	nullable: false,
	additionalProperties: false,
};
const v_validateNoteSchema = ajv.compile(s_validateNoteSchema)

export const validateNoteSchema = (body: unknown): { success: boolean; msg: string } => {
	return validateSchema(v_validateNoteSchema, body);
};

const s_validatePostNoteSchema = {
	type: "object",
	properties: {
		title: { type: "string" },
		note: { type: "string" },
		color: { type: "string" },
		member: { type: "string" },
		date: { type: "number" },
		supportMarkdown: { type: "boolean" },
	},
	required: ["title", "note", "color", "member", "date"],
	nullable: false,
	additionalProperties: false,
};
const v_validatePostNoteSchema = ajv.compile(s_validatePostNoteSchema)

export const validatePostNoteSchema = (body: unknown): { success: boolean; msg: string } => {
	return validateSchema(v_validatePostNoteSchema, body);
};
