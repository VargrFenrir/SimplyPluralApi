import { Request, Response } from "express";

import { getCollection, parseId } from "../../../modules/mongo";

import { ajv, validateSchema } from "../../../util/validation";

export const orderMembers = async (req: Request, res: Response) => {
    const members: { id: string; order: string }[] = req.body.members;

    for (let i = 0; i < members.length; ++i) {
        await getCollection("members").updateOne(
            { uid: res.locals.uid, _id: parseId(members[i].id) },
            { $set: { order: members[i].order } }
        );
    }

    res.status(200).send();
}

const s_validateOrderMembersScheme = {
    type: "object",
    properties: {
        members: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string", pattern: "^[A-Za-z0-9]{20,50}$" },
                    order: { type: "string", pattern: "^0|[a-z0-9]{6,}:[a-z0-9]{0,}$" },
                },
                required: ["id", "order"],
                nullable: false,
                additionalProperties: false,
            },
        },
    },
    required: ["members"],
    nullable: false,
    additionalProperties: false,
}

const v_validateOrderMembersScheme = ajv.compile(s_validateOrderMembersScheme);

export const validateOrderMembersScheme = (body: unknown): { success: boolean; msg: string } => {
    return validateSchema(v_validateOrderMembersScheme, body);
}
