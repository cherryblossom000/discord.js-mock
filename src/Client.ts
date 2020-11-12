import {GatewayDispatchEvents, GatewayOPCodes} from 'discord-api-types/v8'
import * as D from 'discord.js'
import WebSocketShard from '../node_modules/discord.js/src/client/websocket/WebSocketShard'
import {Backend, api} from './Backend'
import * as convert from './convert'
import * as defaults from './defaults'
import type {APIUser} from 'discord-api-types/v8'
import type {ClientOptions} from 'discord.js'
import type {EmitPacket} from './Backend'
import type {ClientData, ResolvedClientData} from './Data'

const _mockClient = (
  backend: Backend,
  client: D.Client,
  {userID, application}: ClientData = {}
): void => {
  const {resolvedData: data} = backend

  // Stop the RESTManager from setting an interval
  client.options.restSweepInterval = 0

  // Initialise the mocked API. This needs to be done with
  // Object.defineProperty because api is originally a getter
  const user: APIUser = {
    ...((userID === undefined ? undefined : data.users.get(userID)) ??
      defaults.user()),
    bot: true
  }
  data.users.set(user.id, user)

  const emitPacket: EmitPacket = (t, d) => {
    client.ws['handlePacket'](
      {op: GatewayOPCodes.Dispatch, t, d},
      client.ws.shards.first()
    )
  }
  const clientData: ResolvedClientData = {
    application: defaults.clientApplication(application),
    userID: user.id
  }
  Object.defineProperty(client, 'api', {
    value: api(backend, clientData, emitPacket),
    configurable: true
  })

  // Initialise the client user
  client.user = new D.ClientUser(client, user)

  // Create a shard
  const shard = new WebSocketShard(client.ws, 0)
  client.ws.shards.set(0, shard)

  // Make the websocket manager ready to receive packets
  client.ws['triggerClientReady']()

  if (data.guilds.size) {
    // Make each of the guilds available
    const convertGuild = convert.guildCreateGuild(data, clientData)
    for (const [, guild] of data.guilds)
      emitPacket(GatewayDispatchEvents.GuildCreate, convertGuild(guild))
  }
}

export const mockClient = (
  client: D.Client,
  data?: ClientData,
  backend: Backend = new Backend()
): void => {
  // Clear RESTManager interval
  client.options.restSweepInterval = 0
  for (const interval of client['_intervals']) client.clearInterval(interval)

  _mockClient(backend, client, data)
}

export class Client extends D.Client {
  declare user: D.ClientUser

  constructor(
    options?: Readonly<ClientOptions>,
    data?: ClientData,
    backend: Backend = new Backend()
  ) {
    // Stop the RESTManager from setting an interval
    super({...options, restSweepInterval: 0})

    _mockClient(backend, this, data)
  }
}
