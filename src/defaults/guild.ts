import {
  GuildDefaultMessageNotifications,
  GuildExplicitContentFilter,
  GuildMFALevel,
  GuildPremiumTier,
  GuildVerificationLevel
} from 'discord-api-types/v8'
import {snowflake, timestamp} from '../utils'
import {DEFAULT_GUILD_NAME, DEFAULT_INTEGRATION_NAME} from './constants'
import {auditLogEntry} from './audit-log'
import {dataGuildEmoji} from './emoji'
import {dataGuildChannel} from './channel'
import {guildPresence} from './gateway'
import {partialApplication} from './oauth2'
import {role} from './permissions'
import {user} from './user'
import type {
  APIGuildIntegration,
  APIGuildIntegrationApplication,
  APIGuildWelcomeScreen,
  APIGuildWelcomeScreenChannel,
  APIIntegrationAccount,
  APIPartialGuild
} from 'discord-api-types/v8'
import type {DataGuild, DataGuildMember, DataGuildVoiceState} from '../Data'
import type {Defaults} from '../resolve-collection'
// eslint-disable-next-line import/max-dependencies -- type imports
import type {NonEmptyArray} from '../utils'

const welcomeScreenChannel: Defaults<APIGuildWelcomeScreenChannel> = _channel => ({
  channel_id: snowflake(),
  emoji_id: null,
  emoji_name: null,
  ..._channel
})

const welcomeScreen: Defaults<APIGuildWelcomeScreen> = screen => ({
  description: null,
  ...screen,
  welcome_channels: screen?.welcome_channels?.map(welcomeScreenChannel) ?? []
})

export const partialGuild: Defaults<APIPartialGuild> = guild => ({
  id: snowflake(),
  name: DEFAULT_GUILD_NAME,
  icon: null,
  splash: null,
  ...guild,
  welcome_screen: guild?.welcome_screen
    ? welcomeScreen(guild.welcome_screen)
    : undefined
})

const integrationAccount: Defaults<APIIntegrationAccount> = _account => ({
  id: snowflake(),
  name: 'Integration Account Name',
  ..._account
})

const integrationApplication: Defaults<APIGuildIntegrationApplication> = application => ({
  ...partialApplication(application),
  bot: application?.bot ? user(application.bot) : undefined
})

export const integration: Defaults<APIGuildIntegration> = _integration => ({
  id: snowflake(),
  name: DEFAULT_INTEGRATION_NAME,
  type: 'twitch',
  enabled: false,
  ..._integration,
  user: _integration?.user ? user(_integration.user) : undefined,
  account: integrationAccount(_integration?.account),
  application: _integration?.application
    ? integrationApplication(_integration.application)
    : undefined
})

const dataGuildMember: Defaults<DataGuildMember> = member => ({
  id: snowflake(),
  nick: null,
  roles: [],
  joined_at: timestamp(),
  premium_since: null,
  pending: false,
  ...member
})

const dataGuildVoiceState: Defaults<DataGuildVoiceState> = voiceState => ({
  channel_id: null,
  user_id: snowflake(),
  // TODO: investigate proper session_id
  session_id: snowflake(),
  deaf: false,
  mute: false,
  self_deaf: false,
  self_mute: false,
  self_stream: false,
  self_video: false,
  // TODO: find out what suppress actually does (muting another user doesn't
  // seem to make this true)
  suppress: false,
  ...voiceState
})

export const dataGuild: Defaults<DataGuild> = guild => {
  /** Includes extra properties from `Guild` not in `APIPartialGuild`. */
  const partial = partialGuild(guild)
  const _members = guild?.members?.map(dataGuildMember)
  const members: NonEmptyArray<DataGuildMember> =
    _members?.length ?? 0
      ? (_members as NonEmptyArray<DataGuildMember>)
      : [dataGuildMember()]
  return {
    discovery_splash: null,
    owner_id: members[0].id,
    region: 'us-west',
    afk_channel_id: null,
    afk_timeout: 300,
    widget_enabled: false,
    verification_level: GuildVerificationLevel.NONE,
    default_message_notifications:
      GuildDefaultMessageNotifications.ALL_MESSAGES,
    explicit_content_filter: GuildExplicitContentFilter.DISABLED,
    features: [],
    mfa_level: GuildMFALevel.NONE,
    application_id: null,
    system_channel_id: null,
    system_channel_flags: 0,
    rules_channel_id: null,
    max_members: 100_000,
    vanity_url_code: null,
    description: null,
    banner: null,
    premium_tier: GuildPremiumTier.NONE,
    preferred_locale: 'en-US',
    max_video_channel_users: 25,
    public_updates_channel_id: null,
    ...partial,
    members,
    roles: guild?.roles?.map(role) ?? [],
    emojis: guild?.emojis?.map(dataGuildEmoji) ?? [],
    voice_states: guild?.voice_states?.map(dataGuildVoiceState) ?? [],
    channels: guild?.channels?.map(dataGuildChannel) ?? [],
    presences: guild?.presences?.map(guildPresence) ?? [],
    audit_log_entries: guild?.audit_log_entries?.map(auditLogEntry) ?? [],
    integrations: guild?.integrations?.map(integration) ?? []
  }
}