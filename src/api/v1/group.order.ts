import { Request, Response } from "express";

import { getCollection, parseId } from "../../../modules/mongo";

import { ajv, validateSchema } from "../../../util/validation";

export const orderGroups = async (req: Request, res: Response) => {
    const groups: { id: string; order: string }[] = req.body.groups;

    for (let i = 0; i < groups.length; ++i) {
        await getCollection("groups").updateOne(
            { uid: res.locals.uid, _id: parseId(groups[i].id) },
            { $set: { order: groups[i].order } }
        );
    }

    res.status(200).send();
}

const s_validateOrderGroupsScheme = {
    type: "object",
    properties: {
        groups: {
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
    required: ["groups"],
    nullable: false,
    additionalProperties: false,
}

const v_validateOrderGroupsScheme = ajv.compile(s_validateOrderGroupsScheme);

export const validateOrderGroupsScheme = (body: unknown): { success: boolean; msg: string } => {
    return validateSchema(v_validateOrderGroupsScheme, body);
}
