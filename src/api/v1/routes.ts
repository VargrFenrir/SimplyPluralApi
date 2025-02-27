/* eslint-disable sonarjs/no-duplicate-string */
import * as core from "express-serve-static-core"
import { ApiKeyAccessType } from "../../modules/api/keys"
import { isUserAuthenticated, isUserAppJwtAuthenticated } from "../../security/auth"
import { validateAreFriends, validateBody, validateId, validateQuery, validateSelfOperation } from "../../util/validation"
import * as customFront from "./customFront"
import * as member from "./member"
import * as note from "./note"
import * as automatedTimer from "./automatedTimer"
import * as repeatedTimer from "./repeatedTimer"
import * as group from "./group"
import * as comment from "./comment"
import * as user from "./user"
import * as priv from "./private"
import * as friend from "./friend"
import * as poll from "./poll"
import * as storage from "./storage"
import * as friendActions from "./friendActions"
import * as frontHistory from "./frontHistory"
import * as pk from "./pk"
import * as token from "./tokens"
import * as analytics from "./analytics"
import * as messages from "./messages"
import * as board from "./board"
import * as chats from "./chats"
import * as auth from "./auth"
import * as event from "./events"
import * as customFields from "./customFields"
import { addPrivacyBucket, deletePrivacyBucket, getPrivacyBucket, getPrivacyBuckets, updatePrivacyBucket, validateBucketSchema } from "./buckets"
import { orderBuckets, validateOrderBucketsSchema } from "./privacy/privacy.buckets.order"
import { assignBucketsToFriend, assignFriendsToBucket, validateAssignBucketsToFriendSchema, validateAssignFriendsToBucketSchema } from "./privacy/privacy.bucket.assign"
import { setPrivacyBuckets, validateSetPrivacyBucketsSchema } from "./privacy/privacy.bucket.set"
import { isCatSetup } from "./subscriptions/subscriptions.core"
import { getSubscription } from "./subscriptions/subscriptions.get"
import { getStartupData } from "./startup"
import { orderFields, validateOrderFieldsScheme } from "./customFields/customFields.order"

export const setupV1routes = (app: core.Express) => {
	// Members
	app.get("/v1/member/:system/:id", isUserAuthenticated(ApiKeyAccessType.Read), validateAreFriends, member.get)
	app.get("/v1/members/:system", isUserAuthenticated(ApiKeyAccessType.Read), validateAreFriends, member.getMembers)
	app.post("/v1/member/:id?", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(member.validatePostMemberSchema), validateId, member.add)
	app.patch("/v1/member/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(member.validateMemberSchema), member.update)
	app.patch("/v1/member/fields/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(member.validateUpdateMemberFieldsSchema), member.updateInfo)
	app.delete("/v1/member/:id", isUserAuthenticated(ApiKeyAccessType.Delete), member.del)

	// Notes
	app.get("/v1/note/:system/:id", isUserAuthenticated(ApiKeyAccessType.Read), validateSelfOperation, note.get)
	app.get("/v1/notes/:system/:member", isUserAuthenticated(ApiKeyAccessType.Read), validateSelfOperation, note.getNotesForMember)
	app.post("/v1/note/:id?", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(note.validatePostNoteSchema), validateId, note.add)
	app.patch("/v1/note/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(note.validateNoteSchema), note.update)
	app.delete("/v1/note/:id", isUserAuthenticated(ApiKeyAccessType.Delete), note.del)

	// Custom front
	app.get("/v1/customFront/:system/:id", isUserAuthenticated(ApiKeyAccessType.Read), validateAreFriends, customFront.get)
	app.get("/v1/customFronts/:system", isUserAuthenticated(ApiKeyAccessType.Read), validateAreFriends, customFront.getCustomFronts)
	app.post("/v1/customFront/:id?", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(customFront.validatePostCustomFrontSchema), validateId, customFront.add)
	app.patch("/v1/customFront/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(customFront.validateCustomFrontSchema), customFront.update)
	app.delete("/v1/customFront/:id", isUserAuthenticated(ApiKeyAccessType.Delete), customFront.del)

	// Custom Fields
	app.get("/v1/customField/:system/:id", isUserAuthenticated(ApiKeyAccessType.Read), validateAreFriends, customFields.getCustomField)
	app.get("/v1/customFields/:system", isUserAuthenticated(ApiKeyAccessType.Read), validateAreFriends, customFields.getCustomFields)
	app.post("/v1/customField/:id?", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(customFields.validatePostCustomFieldSchema), validateId, customFields.addCustomField)
	app.patch("/v1/customField/order", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(validateOrderFieldsScheme), orderFields)
	app.patch("/v1/customField/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(customFields.validatePatchCustomFieldSchema), customFields.updateCustomField)
	app.delete("/v1/customField/:id", isUserAuthenticated(ApiKeyAccessType.Delete), customFields.deleteCustomField)

	// Comments
	app.get("/v1/comments/:type/:id", isUserAuthenticated(ApiKeyAccessType.Read), comment.getCommentsForDocument)
	app.get("/v1/comment/:system/:id", isUserAuthenticated(ApiKeyAccessType.Read), validateSelfOperation, comment.get)
	app.post("/v1/comment/:id?", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(comment.validateCommentSchema), validateId, comment.add)
	app.patch("/v1/comment/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(comment.validateCommentPatchSchema), comment.update)
	app.delete("/v1/comment/:id", isUserAuthenticated(ApiKeyAccessType.Delete), comment.del)

	// Polls
	app.get("/v1/polls/:system", isUserAuthenticated(ApiKeyAccessType.Read), validateSelfOperation, poll.getPolls)
	app.get("/v1/poll/:system/:id", isUserAuthenticated(ApiKeyAccessType.Read), validateSelfOperation, poll.get)
	app.post("/v1/poll/:id?", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(poll.validatePostPollSchema), validateId, poll.add)
	app.patch("/v1/poll/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(poll.validatePollSchema), poll.update)
	app.delete("/v1/poll/:id", isUserAuthenticated(ApiKeyAccessType.Delete), poll.del)

	// Automated timers
	app.get("/v1/timers/automated/:system/", isUserAuthenticated(ApiKeyAccessType.Read), validateSelfOperation, automatedTimer.getAutomatedTimers)
	app.get("/v1/timer/automated/:system/:id", isUserAuthenticated(ApiKeyAccessType.Read), validateSelfOperation, automatedTimer.get)
	app.post("/v1/timer/automated/:id?", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(automatedTimer.validateAutomatedTimerSchema), validateId, automatedTimer.add)
	app.patch("/v1/timer/automated/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(automatedTimer.validateAutomatedTimerSchema), automatedTimer.update)
	app.delete("/v1/timer/automated/:id", isUserAuthenticated(ApiKeyAccessType.Delete), automatedTimer.del)

	// Repeated timers
	app.get("/v1/timers/repeated/:system/", isUserAuthenticated(ApiKeyAccessType.Read), validateSelfOperation, repeatedTimer.getRepeatedTimers)
	app.get("/v1/timer/repeated/:system/:id", isUserAuthenticated(ApiKeyAccessType.Read), validateSelfOperation, repeatedTimer.get)
	app.post("/v1/timer/repeated/:id?", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(repeatedTimer.validateRepeatedTimerSchema), validateId, repeatedTimer.add)
	app.patch("/v1/timer/repeated/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(repeatedTimer.validateRepeatedTimerSchema), repeatedTimer.update)
	app.delete("/v1/timer/repeated/:id", isUserAuthenticated(ApiKeyAccessType.Delete), repeatedTimer.del)

	// Fronting
	app.get("/v1/fronters/", isUserAuthenticated(ApiKeyAccessType.Read), frontHistory.getFronters)

	// Front History
	app.get(
		"/v1/frontHistory/:system",
		isUserAuthenticated(ApiKeyAccessType.Read),
		validateSelfOperation,
		validateQuery(frontHistory.validateGetfrontHistorychema),
		frontHistory.getFrontHistoryInRange
	)
	app.get("/v1/frontHistory", isUserAuthenticated(ApiKeyAccessType.Read), frontHistory.getFrontHistory)
	app.get("/v1/frontHistory/member/:id", isUserAuthenticated(ApiKeyAccessType.Read), frontHistory.getFrontHistoryForMember)
	app.get("/v1/frontHistory/:system/:id", isUserAuthenticated(ApiKeyAccessType.Read), validateSelfOperation, frontHistory.get)
	app.post("/v1/frontHistory/:id?", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(frontHistory.validatefrontHistoryPostSchema), validateId, frontHistory.add)
	app.patch("/v1/frontHistory/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(frontHistory.validatefrontHistoryPatchSchema), frontHistory.update)
	app.delete("/v1/frontHistory/:id", isUserAuthenticated(ApiKeyAccessType.Delete), frontHistory.del)

	// Groups
	app.get("/v1/group/:system/:id", isUserAuthenticated(ApiKeyAccessType.Read), validateAreFriends, group.get)
	app.get("/v1/groups/:system", isUserAuthenticated(ApiKeyAccessType.Read), validateAreFriends, group.getGroups)
	app.post("/v1/group/:id?", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(group.validatePostGroupSchema), validateId, group.add)
	app.patch("/v1/group/members", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(group.validateSetMemberInGroupSchema), group.setMemberInGroups)
	app.patch("/v1/group/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(group.validateGroupSchema), group.update)
	app.delete("/v1/group/:id", isUserAuthenticated(ApiKeyAccessType.Delete), group.del)

	// Analytics
	app.get("/v1/user/analytics", isUserAuthenticated(ApiKeyAccessType.Read), validateQuery(analytics.validatGetAnalyticsSchema), analytics.get)

	// Audit
	//app.get("/v1/audit", isUserAuthenticated(ApiKeyAccessType.Read), validateQuery(validateGetAuditHistorySchema), getAuditHistory);
	//app.delete("/v1/audits", isUserAuthenticated(ApiKeyAccessType.Delete), deleteExpiredAuditEntries);
	//app.delete("/v1/audit/:id", isUserAuthenticated(ApiKeyAccessType.Delete), deleteAuditEntry);

	// User
	app.get("/v1/me", isUserAuthenticated(ApiKeyAccessType.Read), user.getMe)
	app.get("/v1/user/:id", isUserAuthenticated(ApiKeyAccessType.Read), user.get)
	app.get("/v1/user/:id/reports", isUserAuthenticated(ApiKeyAccessType.Read), user.getReports)
	app.delete("/v1/user/:id/report/:reportid", isUserAppJwtAuthenticated, user.deleteReport)
	app.post("/v1/user/:id/export", isUserAuthenticated(ApiKeyAccessType.Read, true), user.exportUserData)
	app.get("/v1/user/export/avatars", validateQuery(user.validateExportAvatarsSchema), user.exportAvatars)
	app.post("/v1/user/generateReport", isUserAuthenticated(ApiKeyAccessType.Read), validateBody(user.validateUserReportSchema), user.generateReport)
	app.patch("/v1/user/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(user.validateUserSchema), user.update)
	app.patch("/v1/user/username/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(user.validateUsernameSchema), user.SetUsername)
	app.delete("/v1/user/:id", isUserAppJwtAuthenticated, user.deleteAccount)

	// Messages
	app.get("/v1/messages", isUserAppJwtAuthenticated, messages.get)
	app.post("/v1/messages/read", isUserAppJwtAuthenticated, validateBody(messages.validateMarkReadSchema), messages.maskAsRead)

	// Board Messages
	app.get("/v1/board/unread", isUserAuthenticated(ApiKeyAccessType.Read), board.getUnreadMessages)
	app.get("/v1/board/:id", isUserAuthenticated(ApiKeyAccessType.Read), board.get)
	app.get("/v1/board/member/:id", isUserAuthenticated(ApiKeyAccessType.Read), board.getBoardMessagesForMember)
	app.post("/v1/board/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(board.validateBoardMessageSchema), board.add)
	app.patch("/v1/board/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(board.validateCommentPatchSchema), board.update)
	app.delete("/v1/board/:id", isUserAuthenticated(ApiKeyAccessType.Delete), board.del)

	// Chat channels
	app.get("/v1/chat/channel/:id", isUserAuthenticated(ApiKeyAccessType.Read), chats.getChannel)
	app.get("/v1/chat/channels", isUserAuthenticated(ApiKeyAccessType.Read), chats.getChannels)
	app.post("/v1/chat/channel/:id?", isUserAuthenticated(ApiKeyAccessType.Read), validateBody(chats.validateWriteChannelschema), chats.addChannel)
	app.patch("/v1/chat/channel/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(chats.validateWriteChannelschema), chats.updateChannel)
	app.delete("/v1/chat/channel/:id", isUserAuthenticated(ApiKeyAccessType.Delete), chats.deleteChannel)

	// Chat categories
	app.get("/v1/chat/category/:id", isUserAuthenticated(ApiKeyAccessType.Read), chats.getChannelCategory)
	app.get("/v1/chat/categories", isUserAuthenticated(ApiKeyAccessType.Read), chats.getChannelCategories)
	app.post("/v1/chat/category/:id?", isUserAuthenticated(ApiKeyAccessType.Read), validateBody(chats.validateChatCategorySchema), chats.addChannelCategory)
	app.patch("/v1/chat/category/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(chats.validateChatCategorySchema), chats.updateChannelCategory)
	app.delete("/v1/chat/category/:id", isUserAuthenticated(ApiKeyAccessType.Delete), chats.deleteChannelCategory)

	// Chat messages
	app.get("/v1/chat/message/:id", isUserAuthenticated(ApiKeyAccessType.Read), chats.getMessage)
	app.get("/v1/chat/messages/:id", isUserAuthenticated(ApiKeyAccessType.Read), validateQuery(chats.validateGetChannelHistorySchema), chats.getChannelHistory)
	app.post("/v1/chat/message/:id?", isUserAuthenticated(ApiKeyAccessType.Read), validateBody(chats.validateWriteMessageSchema), chats.writeMessage)
	app.patch("/v1/chat/message/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(chats.validateUpdateMessageSchema), chats.updateMessage)
	app.delete("/v1/chat/message/:id", isUserAuthenticated(ApiKeyAccessType.Delete), chats.deleteMessage)

	// Privacy buckets
	app.get("/v1/privacyBucket/:id", isUserAuthenticated(ApiKeyAccessType.Read), getPrivacyBucket)
	app.get("/v1/privacyBuckets", isUserAuthenticated(ApiKeyAccessType.Read), getPrivacyBuckets)
	app.post("/v1/privacyBucket/:id?", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(validateBucketSchema), addPrivacyBucket)
	app.patch("/v1/privacyBucket/order", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(validateOrderBucketsSchema), orderBuckets)
	app.patch("/v1/privacyBucket/setbuckets", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(validateSetPrivacyBucketsSchema), setPrivacyBuckets)
	app.patch("/v1/privacyBucket/assignbuckets", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(validateAssignBucketsToFriendSchema), assignBucketsToFriend)
	app.patch("/v1/privacyBucket/assignfriends", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(validateAssignFriendsToBucketSchema), assignFriendsToBucket)
	app.patch("/v1/privacyBucket/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(validateBucketSchema), updatePrivacyBucket)
	app.delete("/v1/privacyBucket/:id", isUserAuthenticated(ApiKeyAccessType.Delete), deletePrivacyBucket)

	// Private
	app.get("/v1/user/private/:id", isUserAppJwtAuthenticated, priv.get)
	app.patch("/v1/user/private/:id", isUserAppJwtAuthenticated, validateBody(priv.validatePrivateSchema), priv.update)
	app.get("/v1/private/:id", isUserAppJwtAuthenticated, priv.get)
	app.patch("/v1/private/:id", isUserAppJwtAuthenticated, validateBody(priv.validatePrivateSchema), priv.update)

	// Friends
	app.get("/v1/friends/", isUserAuthenticated(ApiKeyAccessType.Read), friend.getFriends)
	app.get("/v1/friends/settings", isUserAuthenticated(ApiKeyAccessType.Read), friend.getFriendsSettings)
	app.get("/v1/friends/requests/incoming", isUserAuthenticated(ApiKeyAccessType.Read), friend.getIngoingFriendRequests)
	app.get("/v1/friends/requests/outgoing", isUserAuthenticated(ApiKeyAccessType.Read), friend.getOutgoingFriendRequests)
	app.get("/v1/friends/getFrontValues", isUserAuthenticated(ApiKeyAccessType.Read), friend.getAllFriendFrontValues)
	app.get("/v1/friend/:system/getFrontValue", isUserAuthenticated(ApiKeyAccessType.Read), validateAreFriends, friend.getFriendFrontValues)
	app.post("/v1/friends/request/add/:usernameOrId", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(friendActions.validateAddFrienqRequestSchema), friendActions.AddFriend)
	app.post(
		"/v1/friends/request/respond/:usernameOrId",
		isUserAuthenticated(ApiKeyAccessType.Write),
		validateQuery(friendActions.validateRespondToFrienqRequestQuerySchema),
		friendActions.RespondToFriendRequest
	)
	app.delete("/v1/friends/request/:id", isUserAuthenticated(ApiKeyAccessType.Delete), friendActions.CancelFriendRequest)
	app.delete("/v1/friends/remove/:id", isUserAuthenticated(ApiKeyAccessType.Delete), friendActions.RemoveFriend)

	// Friend
	app.get("/v1/friend/:id/getFront", isUserAuthenticated(ApiKeyAccessType.Read), friend.getFriendFront)
	app.get("/v1/friend/:system/:id", isUserAuthenticated(ApiKeyAccessType.Read), friend.getFriend)
	app.patch("/v1/friend/:id", isUserAuthenticated(ApiKeyAccessType.Write), validateBody(friend.validatePatchFriendSchema), friend.updateFriend)

	// Avatar
	app.post("/v1/avatar/:dashedid", isUserAppJwtAuthenticated, validateBody(storage.validateStoreAvatarSchema), storage.Store)
	app.delete("/v1/avatar/:dashedid", isUserAppJwtAuthenticated, storage.Delete)

	// Sync members
	app.patch(
		"/v1/integrations/pluralkit/sync/member/:id",
		isUserAuthenticated(ApiKeyAccessType.Write),
		validateBody(pk.validateSyncMemberSchema),
		validateQuery(pk.validateSyncDirectionSchema),
		pk.performSyncMember
	)
	app.patch(
		"/v1/integrations/pluralkit/sync/members",
		isUserAuthenticated(ApiKeyAccessType.Write),
		validateBody(pk.validateSyncMembersSchema),
		validateQuery(pk.validateSyncDirectionSchema),
		pk.performSyncAllMembers
	)

	// Tokens
	app.get("/v1/tokens", isUserAppJwtAuthenticated, token.getAll)
	app.get("/v1/token/permissions", isUserAuthenticated(ApiKeyAccessType.Read | ApiKeyAccessType.Write | ApiKeyAccessType.Delete), token.getPermission)
	app.get("/v1/token/:id", isUserAppJwtAuthenticated, token.get)
	app.post("/v1/token/:id", isUserAppJwtAuthenticated, validateBody(token.validateApiKeySchema), validateId, token.add)
	app.delete("/v1/token/:id", isUserAppJwtAuthenticated, token.del)

	// Startup
	app.get("/v1/startup", isUserAppJwtAuthenticated, getStartupData)

	// Auth
	app.post("/v1/auth/login", validateBody(auth.validateRegisterSchema), auth.login)

	// OAuth2 providers
	{
		app.post("/v1/auth/login/oauth/google", validateBody(auth.validateLoginOAuth2Schema), auth.loginGoogle)
		app.post("/v1/auth/login/oauth/apple", validateBody(auth.validateLoginOAuth2Schema), auth.loginApple)
	}

	app.post("/v1/auth/register", validateBody(auth.validateRegisterSchema), auth.register)

	app.post("/v1/auth/forgotemail", validateBody(auth.validateForgotEmailSchema), auth.requestEmailFromUsername)

	app.post("/v1/auth/verification/request", isUserAppJwtAuthenticated, auth.requestConfirmationEmail)
	app.get("/v1/auth/verification/confirm", validateQuery(auth.validateConfirmEmailSchema), auth.confirmEmail)

	{
		app.get("/v1/auth/password/reset", validateQuery(auth.validateResetPasswordRequestSchema), auth.resetPasswordRequest)
		app.post("/v1/auth/password/reset/change", validateBody(auth.validateResetPasswordExecutionSchema), auth.resetPassword)
		app.post("/v1/auth/password/change", validateBody(auth.validateChangePasswordSchema), auth.changePassword)
	}

	{
		app.post("/v1/auth/email/change", validateBody(auth.validateChangeEmailSchema), auth.changeEmail)
	}

	app.get("/v1/auth/refresh", auth.refreshToken)
	app.get("/v1/auth/refresh/valid", auth.checkRefreshTokenValidity)

	app.get("/v1/auth/logs", isUserAuthenticated(ApiKeyAccessType.Read), auth.getAuthLogs)

	// Events
	app.post("/v1/event", isUserAppJwtAuthenticated, validateBody(event.validateEventSchema), event.event)

	// Subscriptions
	if (isCatSetup()) {
		app.get("/v1/subscription", isUserAppJwtAuthenticated, getSubscription)
	}

	// Specific events with per-event code
	{
		app.post("/v1/event/open", isUserAppJwtAuthenticated, event.openEvent)
	}
}
