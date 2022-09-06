import { Request, Response } from "express";
import { getCollection } from "../../modules/mongo";
import { validateSchema } from "../../util/validation";
import { randomBytes, timingSafeEqual } from "crypto"; 
import { getConfirmationKey, sendConfirmationEmail } from "./auth/auth.confirmation";
import { base64decodeJwt, getNewUid, isJwtValid, jwtForUser } from "./auth/auth.jwt";
import { hash } from "./auth/auth.hash";

export const login = async (req: Request, res: Response) => {
	const user = await getCollection("accounts").findOne({email: req.body.email})
	if (!user)
	{
		res.status(401).send("Unknown user or password")
		return
	}

	const hashedPasswd = await hash(req.body.password, user.salt)

	const knownHash = base64decodeJwt(user.password)
	const bGeneratedHash = base64decodeJwt(hashedPasswd.hashed)
	if (bGeneratedHash.length !== knownHash.length) {
		res.status(401).send("Unknown user or password")
		return
	}
	
	if (timingSafeEqual(bGeneratedHash, knownHash)) {
		res.status(200).send(jwtForUser(user.uid));
	} else {
		res.status(401).send("Unknown user or password")
	}
}

export const refreshToken = async (req: Request, res: Response) => {
	if (!req.headers.authorization)
	{
		res.status(400).send("You need to include the authorization header")
		return
	}

	const validResult = await isJwtValid(req.headers.authorization);
	if (validResult.valid) {
		const invalidatedToken = await getCollection("invalidJwtTokens").findOne({jwt: req.headers.authorization})
		if (invalidatedToken) {
			res.status(401).send("Invalid jwt")
		} else {
			res.status(200).send(jwtForUser(validResult.decoded.uid))
		}
	} else {
		res.status(401).send("Invalid jwt")
	}
}

export const register = async (req: Request, res: Response) => {
	const existingUser = await getCollection("accounts").findOne({email: req.body.email})
	if (existingUser)
	{
		res.status(409).send("User already exists")
		return;
	}

	const salt = randomBytes(16).toString("hex")
	const newUserId = await getNewUid()
	const hashedPasswd = await hash(req.body.password, salt)
	const verificationCode = getConfirmationKey()
	await getCollection("accounts").insertOne({uid: newUserId, email: req.body.email, password: hashedPasswd.hashed, salt, verificationCode});
	res.status(200).send({uid: newUserId, jwt: jwtForUser(newUserId)})
	sendConfirmationEmail(res.locals.uid)
}

export const requestConfirmationEmail = async (req: Request, res: Response) => {
	const result = await sendConfirmationEmail(res.locals.uid)
	if (result)
	{
		res.status(200).send()
	} 
	else 
	{
		res.status(500).send()
	}
}

export const confirmEmail = (req: Request, res: Response) => {
	
}

export const validateRegisterSchema = (body: any): { success: boolean, msg: string } => {
	const schema = {
		type: "object",
		properties: {
			email: { type: "string", format: "email"  },
			password: { type: "string", pattern: "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{10,100}$",  }
		},
		nullable: false,
		additionalProperties: false,
		required: ["email", "password"]
	};

	return validateSchema(schema, body);
}

export const validateConfirmEmailSchema = (body: any): { success: boolean, msg: string } => {
	const schema = {
		type: "object",
		properties: {
			user: { type: "string", pattern: "^[a-zA-Z0-9]{100}$" },
			key: { type: "string", pattern: "^[a-zA-Z0-9]{100}$" }
		},
		nullable: false,
		additionalProperties: false,
		required: ["key"]
	};

	return validateSchema(schema, body);
}