/* eslint-disable indent */
// eslint-disable-next-line
import Peer, { DataConnection } from 'peerjs';
import {EventEmitter} from 'events';

class NBConnectionManager extends EventEmitter {
  constructor () {
    super();
    /**
     * @typedef {DataConnection} CollaborationPeer
     * @property {Boolean} authenticated Whether this peer has been authenticated
     * @property {string} username The username of this peer
     */

    /**
     * @typedef {string} PeerId
     */

    /** @type {Peer} */
    this.peer = null;
    /** @type {string} */
    this.peerId = null;
    /** @type {CollaborationPeer | null} */
    this.host = null;
    /** @type {string | null} */
    this.hostId = null;
    /** @type {string | null} */
    this.roomId = null;
    /** @type {Boolean} */
    this.isHost = false;
    /** @type {Boolean} */
    this.connected = false;
    /** @type {Boolean} */
    this.initialized = false;

    /** @type {string} */
    this.username = 'Anonymous';
    /** @type {{ [s: string]: CollaborationPeer}} */
    this.connections = {};
    /** @type {{ [s: string]: string }} */
    this.authKeys = {};
    /** @type {Map<PeerId, string>} */
    this.users = new Map(); // PeerId, username

    /**
     * Event types fired by various connection events
     * @readonly
     * @enum {string}
     */
    this.Event = {
      /**
       * @description Fired when this client connects to the peerjs server
       * @event SERVERCONNECT
       * @param {string} id The id of this client
       */
      SERVERCONNECT: 'SERVERCONNECT',
      /**
       * @description Fired when this client disconnects from the peerjs server
       * @event SERVERDISCONNECT
       */
      SERVERDISCONNECT: 'SERVERDISCONNECT',
      /** @description Fired when, as a peer, a new peer connects to this client
       * @event PEERCONNECT
       * @param {CollaborationPeer} peer The {@link CollaborationPeer} object of the connected peer
       * @param {string} username The username of the connected peer
      */
      PEERCONNECT: 'PEERCONNECT',
      /**
       * @description Fired when, as a peer, a connected peer disconnects from this client
       * @event PEERDISCONNECT
       * @param {CollaborationPeer} peer The {@link CollaborationPeer} object of the disconnected peer
       */
      PEERDISCONNECT: 'PEERDISCONNECT',
      /**
       * @description Fired when, as a host, a client connects to this client
       * @event CLIENTCONNECT
       * @param {CollaborationPeer} peer The {@link CollaborationPeer} object of the connected client
       */
      CLIENTCONNECT: 'CLIENTCONNECT',
      /**
       * @description Fired when, as a host, a client disconnects from this client
       * @event CLIENTDISCONNECT
       * @param {string} id The id of the disconnected client
       */
      CLIENTDISCONNECT: 'CLIENTDISCONNECT',
      /**
       * @description Fired when, as a client, this client joins a new room
       * @event ROOMJOIN
       * @param {string} id The id of the room that was joined(this is the same as the peer id of the host)
       * @param {CollaborationPeer} host The {@link CollaborationPeer} object of the host of the room that was joined
       */
      ROOMJOIN: 'ROOMJOIN',
      /**
       * @description Fired when this client creates a room, upgrading this client to a host
       * @event ROOMCREATE
       * @param {string} id The id of the room created(this is the same as the client's peer id)

       */
      ROOMCREATE: 'ROOMCREATE',
      /**
       * @description Fired when this client leaves a room
       * @event ROOMLEAVE
       * @param {string} id The id of the room that was left
       * @param {CollaborationPeer} host The {@link CollaborationPeer} object of the host of the room that was left
       */
      ROOMLEAVE: 'ROOMLEAVE',
      /**
       * @description Fired when the room this client is connected to is closed due to the host disconnecting or the host closing the room
       * @event ROOMCLOSE
       * @param {string} id The id of the room that was closed
       * @param {CollaborationPeer} host The {@link CollaborationPeer} object of the host of the room that disconnected
       */
      ROOMCLOSE: 'ROOMCLOSE',
      /**
       * @description Fired when the room this client is connected to(if any) changes
       * @event ROOMCHANGE
       * @param {string | null} room The id of the room this client is connected to, or null if none
       */
      ROOMCHANGE: "ROOMCHANGE",
      /**
       * @description Fired when a peer is kicked from a room
       * @event PEERKICK
       * @param {CollaborationPeer} peer The {@link CollaborationPeer} object of the peer that was kicked
       */
      PEERKICK: 'PEERKICK',
      /**
       * @description Fired when the host(when it isn't this client) disconnects from a room
       * @event HOSTDISCONNECT
       * @param {CollaborationPeer} host The {@link CollaborationPeer} object of the host that disconnected
       */
      HOSTDISCONNECT: 'HOSTDISCONNECT',
      /**
       * @description Fired when the list of peers connected to this client is updated
       * @event PEERSUPDATE
       * @param {Array<CollaborationPeer>} peers An array of the peers connected to this client
       */
      PEERSUPDATE: 'PEERSUPDATE',
      /**
       * @description Fired when a packet is received from any peer
       * @event PACKET
       * @param {*} data The data from the packet
       * @param {CollaborationPeer} peer The peer who sent this packet
       */
      PACKET: 'PACKET'
    };

    
  }

  /**
   * Initialize the connection to peerjs
   * @param {string} username The username to set this peer to
   */
  init (username = 'Anonymous') {
    if (this.initialized) return;
    this.initialized = true;
    this.username = username;

    this.peer = new Peer({
      // host: "nitrobolt-backend.derpygamer2142.com",
      host: 'localhost',
      port: 1296,
      path: '/peerjs',
      //secure: true,
      debug: 2
    });

    this.peer.on('open', id => {
      this.peerId = id;
      this.emit(this.Event.SERVERCONNECT, id);
      const room = this._getRoomFromUrl();
      if (room) this.joinRoom(room);
    });

    this.peer.on('connection', conn => this._handleIncomingConnection(conn));
    this.peer.on('error', () => this.leaveRoom(false)); // todo: should this be handled more gracefully?
    this.peer.on('close', () => this.destroy());
  }

  /**
   * Create a new room using this peer's id
   * @returns {string} The room id that was created
   */
  createRoom () {
    if (!this.peerId || !this.initialized) throw new Error('Peer not ready');
    this.isHost = true;
    this.connected = true;
    this.roomId = this.hostId = this.peerId;
    this.emit(this.Event.ROOMCREATE, this.roomId);
    this.emit(this.Event.ROOMCHANGE, this.roomId);
    this._setRoomInUrl(this.roomId);
    return this.roomId;
  }

  /**
   * Join a room with the given id, leaving the current room if needed
   * @param {string} roomId The id of the room to join
   */
  joinRoom (roomId) {
    if (!roomId || this.peer.disconnected) return;
    if (this.roomId) {
      this.leaveRoom(false);
    }
    this.isHost = false;
    this.roomId = roomId;
    this.hostId = roomId;
    this._setRoomInUrl(roomId);

    const conn = this.peer.connect(roomId);
    this.host = conn;

    conn.on('open', () => {
      this.connected = true;
      this._bindHost(conn);
      this.emit(this.Event.ROOMJOIN, this.roomId, conn);
      this.emit(this.Event.ROOMCHANGE, this.roomId);
      conn.send({type: 'REQUESTJOIN', username: this.username});
    });
  }

  /**
   * Shut down a room and destroy all connections, requires this peer to be the host
   */
  shutdownRoom () {
    if (!this.isHost) return;

    this.sendToAll({type: 'ROOMCLOSED'});
    this.disconnectAll();

    this._clearRoomInUrl();
    this.peer?.destroy();

    Object.assign(this, {
      peer: null,
      host: null,
      hostId: null,
      roomId: null,
      isHost: false,
      connected: false,
      initialized: false,
      connections: {},
      users: []
    });
  }

  /**
   * Leave the room this peer is currently connected to
   * @param {boolean} silent If false a ROOMLEAVE event will be emitted
   */
  leaveRoom (silent) {
    if (!silent) this.emit(this.Event.ROOMLEAVE, this.roomId, this.host);
    if (!silent) this.emit(this.Event.ROOMCHANGE, null);
    this.disconnectAll();
    this._clearRoomInUrl();
    this.roomId = null;
    this.hostId = null;
    this.isHost = false;
    this.connected = false;

    this.host?.close();
    this.host = null;
  }

  /**
   * Safely close all connections and disconnect from peerjs
   */
  destroy () {
    this.disconnectAll();
    this.peer?.destroy();
    this._clearRoomInUrl();
    Object.assign(this, {
      peer: null,
      host: null,
      hostId: null,
      initialized: false,
      connected: false
    });
  }

  /**
   * Disconnect from all peers currently connected to this peer
   */
  disconnectAll () {
    Object.values(this.connections).forEach(conn => conn.close());
    this.connections = {};
    this.users.clear();
  }

  /**
   * Send a packet to all connected users
   * @param {*} packet The data to send to all peers
   */
  sendToAll (packet) {
    Object.values(this.connections).forEach(conn => {
      if (conn.open) conn.send(packet);
    });
    if (this.host?.open) this.host.send(packet);
  }

  /**
   * Set this peer's username to a given string
   * @param {string} username What this peer's username should be set to
   */
  setUsername (username) {
    this.username = username;
    this.sendToAll({type: 'CHANGEUSERNAME', payload: username});
  }

  /**
   * Kick a given peer, this peer must be the host
   * @param {string} peerId The id of the peer to kick
   * @param {boolean} sendPacket Whether to send a kick packet to peers
   */
  kickPeer (peerId, sendPacket) {
    if (sendPacket) this.sendToAll({type: 'KICK', payload: peerId});
    this.connections[peerId]?.close();
    delete this.connections[peerId];
    this.users.delete(peerId);
  }
  
  /**
   * Get a user's username by their id
   * @param {string} peerId  The id to get
   * @returns {string | null} The username of the given peer id
   */
  getUsernameByPeerId (peerId) {
    return this.users.get(peerId) ?? null;
  }

  // --- Internal Handlers ---
  /**
   * As a peer, handle the connection of a new client
   * @param {CollaborationPeer} conn The peer to handle the connection of
   */
  _handleIncomingConnection (conn) {
    conn.authenticated = false;
    this.connections[conn.peer] = conn;

    conn.on('open', () => {
      // PEERCONNECT event is emitted when the connection has been authenticated
      setTimeout(() => {
        if (!conn.authenticated) conn.close();
      }, 25000);
    });

    conn.on('data', data => this._handlePacket(conn, data));
    conn.on('close', () => {
      this.emit(this.Event.PEERDISCONNECT, conn);
      delete this.connections[conn.peer];
      this.users.delete(conn.peer);

      // we don't handle the host disconnecting here because conn should never be the host

      this.emit(this.Event.PEERSUPDATE, Object.keys(this.connections));
    });

    
  }

  /**
   * As a client connecting to a room, bind connection to a host
   * @param {CollaborationPeer} conn The peer connection of the host to bind
   */
  _bindHost (conn) {
    conn.authenticated = true;
    conn.on('data', data => this._handlePacket(conn, data));
    conn.on('close', () => {
      this.emit(this.Event.HOSTDISCONNECT, this.host);
      this.emit(this.Event.ROOMCLOSE, conn.peer, conn);
      this.emit(this.Event.ROOMCHANGE, null);
      this.leaveRoom(true);
    });
  }

  /**
   * Bind the connection to a client, upgrading them to a peer by providing them with the authentication key
   * @param {CollaborationPeer} conn The peer connection to bind to
   * @param {string} key The key to send to the client which they will use to authenticate with other clients
   */
  _bindPeer (conn, key) {
    conn.on('open', () => {
      this.emit(this.Event.CLIENTCONNECT, conn);
      conn.send({type: 'VERIFYKEY', key, username: this.username});
    });
    conn.on('data', data => this._handlePacket(conn, data));
    conn.on('close', () => {
      this.emit(this.Event.CLIENTDISCONNECT, conn.id);
      delete this.connections[conn.peer];
      this.users.delete(conn.peer);
      this.emit(this.Event.PEERSUPDATE, Object.keys(this.connections));
    });

    this.connections[conn.peer] = conn;
  }

  /**
   * Handle a packet from a peer
   * @param {CollaborationPeer} conn The peer who sent this packet
   * @param {{ "type": string }} data The packet sent by the peer
   * @returns {void}
   */
  _handlePacket (conn, data) {
    if (typeof data !== 'object') return;
    if (!data?.type) return;

    const sendTo = (peerId, msg) => this.connections[peerId]?.send(msg);

    switch (data.type) {
      case 'REQUESTJOIN': {
        if (!this.isHost) return;
        // eslint-disable-next-line no-alert
        if (!window.confirm(`Allow ${data.username} to join?`)) return conn.close();

        const key = crypto.randomUUID();
        conn.authenticated = true;
        conn.username = data.username;
        this.users.set(conn.peer, data.username);

        conn.send({
          type: 'ALLOWJOIN',
          key,
          clients: Object.keys(this.connections).filter(p => p !== conn.peer),
          username: this.username
        });

        Object.keys(this.connections).forEach(peerId =>
          sendTo(peerId, {type: 'AUTHKEY', id: conn.peer, key})
        );

        this.emit(this.Event.PEERCONNECT, conn, data.username);
        this.emit(this.Event.PEERSUPDATE, Object.keys(this.connections));
        break;
      }

      case 'ALLOWJOIN': {
        if (conn !== this.host) return;
        this.hostId = conn.peer;

        data.clients.forEach(peerId => {
          const peerConn = this.peer.connect(peerId);
          this._bindPeer(peerConn, data.key);
        });

        this.users.set(conn.peer, data.username);
        this.emit(this.Event.PEERCONNECT, conn, data.username);
        this.emit(this.Event.PEERSUPDATE, Object.keys(this.connections));
        break;
      }

      case 'AUTHKEY': {
        if (conn !== this.host) return;
        this.authKeys[data.key] = {
          id: data.id,
          timeout: setTimeout(() => delete this.authKeys[data.key], 25000)
        };
        break;
      }

      case 'VERIFYKEY': {
        const auth = this.authKeys[data.key];
        if (!auth || auth.id !== conn.peer) return conn.close();

        clearTimeout(auth.timeout);
        delete this.authKeys[data.key];

        conn.authenticated = true;
        conn.username = data.username;
        this.users.set(conn.peer, data.username);

        conn.send({type: 'ACCEPT', username: this.username});
        this.emit(this.Event.PEERCONNECT, conn, data.username);
        this.emit(this.Event.PEERSUPDATE, Object.keys(this.connections));
        break;
      }

      case 'ACCEPT': {
        conn.authenticated = true;
        conn.username = data.username;
        this.users.set(conn.peer, data.username);
        this.emit(this.Event.PEERCONNECT, conn, data.username);
        this.emit(this.Event.PEERSUPDATE, Object.keys(this.connections));
        break;
      }

      case 'PACKET': {
        if (conn.authenticated) {
          this.emit(this.Event.PACKET, conn, data.payload);
        }
        break;
      }

      case 'CHANGEUSERNAME': {
        if (!conn.authenticated) return;
        conn.username = data.payload;
        this.users.delete(conn.peer);
        this.users.set(conn.peer, conn.username);
        this.emit(this.Event.PEERSUPDATE, Object.keys(this.connections));
        break;
      }

      case 'KICK': {
        if (this.isHost && conn === this.host && Object.prototype.hasOwnProperty.call(this.connections, data.payload)) {
          if (this.connections[data.payload].open) {
            this.emit(this.Event.PEERKICK, this.connections[data.payload]);
            this.kickPeer(data.payload);
          }
        }
        break;
      }

      case 'ROOMCLOSED': {

        if (!this.isHost && conn === this.host) {
          this.emit(this.Event.ROOMCLOSE, this.roomId, this.host);
          this.emit(this.Event.ROOMCHANGE, null);          
          this.leaveRoom(true);
        }
        break;
      }
    }
  }

  /**
   * Get the room from the "room" url parameter
   * @returns {string} The current room
   */
  _getRoomFromUrl () {
    return new URLSearchParams(window.location.search).get('room');
  }

  /**
   * Set the room id in the url without reloading the page
   * @param {string} roomId The room id to connect to
   */
  _setRoomInUrl (roomId) {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    window.history.replaceState({}, '', url.toString());
  }

  /**
   * Remove the room id from the url without reloading the page
   */
  _clearRoomInUrl () {
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.replaceState({}, '', url.toString());
  }
}

export default new NBConnectionManager();
