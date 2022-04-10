import type {Snowflake} from 'discord.js'
// import type {GuildChannel} from './Channel'
// import type {Guild} from './Guild'
import type {User} from './User'

/** https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types */
export const enum WebhookType {
  INCOMING = 1,
  CHANNEL_FOLLOWER
}

interface WebhookBase {
  id: Snowflake
  guild_id?: Snowflake
  channel_id: Snowflake
  user?: User
  name: string | null
  avatar: string | null
}

interface IncomingWebhook extends WebhookBase {
  type: WebhookType.INCOMING
  token: string
}

interface ChannelFollowerWebhook extends WebhookBase {
  type: WebhookType.CHANNEL_FOLLOWER
  // source_guild: Pick<Guild, 'id' | 'name' | 'icon'>
  // source_channel: Pick<GuildChannel, 'id' | 'name'>
}

/** https://discord.com/developers/docs/resources/webhook#webhook-object */
export type Webhook = IncomingWebhook | ChannelFollowerWebhook

type SlackField = (
  | {title: string; value?: string}
  | {title?: string; value: string}
) & {short?: boolean}

interface SlackAttachmentBase {
  pretext?: string
  text?: string
  color?: string
  image_url?: string
  thumb_url?: string
  fields?: SlackField[]
  ts?: number
}

interface SlackAttachmentWithAuthor extends SlackAttachmentBase {
  author_name: string
  author_icon?: string
  author_link?: string
}

interface SlackAttachmentWithTitle extends SlackAttachmentBase {
  title: string
  title_link?: string
}

interface SlackAttachmentWithFooter extends SlackAttachmentBase {
  footer: string
  footer_icon?: string
}

type SlackAttachment =
  | SlackAttachmentBase
  | SlackAttachmentWithAuthor
  | SlackAttachmentWithTitle
  | SlackAttachmentWithFooter
  | (SlackAttachmentWithAuthor & SlackAttachmentWithTitle)
  | (SlackAttachmentWithAuthor & SlackAttachmentWithFooter)
  | (SlackAttachmentWithFooter & SlackAttachmentWithTitle)
  | (SlackAttachmentWithAuthor &
      SlackAttachmentWithFooter &
      SlackAttachmentWithTitle)

export interface SlackMessage {
  text?: string
  attachments?: SlackAttachment[]
}
