/* eslint-disable indent */
// eslint-disable-next-line
import Peer, {DataConnection, PeerJSOption} from 'peerjs';
import {EventEmitter} from 'events';
import bindAll from 'lodash.bindall';

const AUTHENTICATION_TIMEOUT = 25000;
const JOIN_TIMEOUT = 30000;

/**
 * @typedef {DataConnection} CollaborationPeer
 * @property {Boolean} authenticated Whether this peer has been authenticated
 * @property {string} username The username of this peer
 * @property {NodeJS.Timeout} killTimeout The timeout which will be fired to check if this peer is authenticated
 */

/**
 * @typedef {string} PeerId
 */

/**
 * @callback JoinRequestHandler
 * @param {string} username The username of the peer attempting to join the room
 * @param {CollaborationPeer} peer The {@link DataConnection} object of the peer attempting to join
 */

class NBConnectionManager extends EventEmitter {
  constructor () {
    super();

    bindAll(this, [
      'init',
      'joinRoom',
      'createRoom',
      'setUsername',
      'sendTo',
      'sendToAll',
      'destroy',
      'close',
      '_handleConnection',
      '_handleDisconnection',
      '_handlePacket',
      '_killPeer',
      '_handleServerDisconnect'
    ]);

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
    /** @type {boolean} */
    this.isHost = false;
    /** @type {boolean} */
    this.connected = false;
    /** @type {boolean} */
    this.initialized = false;
    /** @type {boolean} */
    this.authenticated = false;

    /** @type {string} */
    this.username = 'Anonymous';
    /** @type {{ [s: PeerId]: CollaborationPeer}} */
    this.connections = {};
    /** @type {{ [s: PeerId]: string }} */
    this.authKeys = {}; // PeerId, auth key
    /** @type {Map<PeerId, string | null>} */
    this.users = new Map(); // PeerId, username
    /** @type {boolean} */
    this.connectionLocked = false; // whether the ability to connect to new rooms is locked
    /** @type {?object} */
    this.pendingJoin = null;
    // eslint-disable-next-line valid-jsdoc
    /** @type {JoinRequestHandler} */
    // The always-mounted native join request controller replaces this handler.
    // If it is unavailable, deny instead of falling back to an easy-to-miss
    // browser confirmation dialog.
    this.joinRequestHandler = () => false; // overrideable

    /**
     * Event types fired by various connection events
     * @readonly
     * @constant
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
      /**
       * @description Fired when, as a peer, a new possible peer connects to this client
       * @event PEERCONNECT
       * @param {CollaborationPeer} peer The {@link CollaborationPeer} object of the connected peer
      */
      PEERCONNECT: 'PEERCONNECT',
      /**
       * @description Fired when, as a peer or host, a connected client is upgraded to a peer
       * @event PEERUPGRADE
       * @param {CollaborationPeer} peer The {@link CollaborationPeer} object of the upgraded peer
       * @param {string} username The username of the upgraded peer
       */
      PEERUPGRADE: 'PEERUPGRADE',
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
       * @description Fired when the room this client is connected to is closed
       * due to the host disconnecting or the host closing the room
       * @event ROOMCLOSE
       * @param {string} id The id of the room that was closed
       * @param {CollaborationPeer} host The {@link CollaborationPeer} object of the host of the room that disconnected
       */
      ROOMCLOSE: 'ROOMCLOSE',
      /**
       * @description Fired when the room this client is connected to(if any) changes
       * @event ROOMCHANGE
       * @param {string | null} room The id of the room this client is now connected to, or null if none
       */
      ROOMCHANGE: 'ROOMCHANGE',
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
       * @event CONNECTIONSUPDATE
       * @param {Array<CollaborationPeer>} peers An array of the peers connected to this client
       */
      CONNECTIONSUPDATE: 'CONNECTIONSUPDATE',
      /**
       * @description Fired when a peer changes their username
       * @event USERNAMEUPDATE
       * @param {CollaborationPeer | null} peer The {@link CollaborationPeer} object of the peer
       * that updated its username, or null if it was this client
       * @param {string} username The new username of the peer
       */
      USERNAMEUPDATE: 'USERNAMEUPDATE',
      /**
       * @description Fired when a packet is received from any peer
       * @event PACKET
       * @param {*} data The data from the packet
       * @param {CollaborationPeer} peer The peer who sent this packet
       */
      PACKET: 'PACKET',
      /**
       * @description Fired when the connection manager is destroyed, requiring a new initialization.
       * @event DESTROY
       */
      DESTROY: 'DESTROY',
      /**
       * @description Fired when the ability to join a room locks
       * @event JOINLOCK
       */
      JOINLOCK: 'JOINLOCK',
      /**
       * @description Fired when the ability to join a room unlocks
       * @event JOINUNLOCK
       */
      JOINUNLOCK: 'JOINUNLOCK'
    };

    /**
     * Types of protocol packets send between peers
     * @readonly
     * @constant
     * @enum {string}
     */
    this.PacketType = {
      REQUESTJOIN: 'REQUESTJOIN',
      ALLOWJOIN: 'ALLOWJOIN',
      DENYJOIN: 'DENYJOIN',
      AUTHKEY: 'AUTHKEY',
      VERIFYKEY: 'VERIFYKEY',
      ACCEPT: 'ACCEPT',
      PACKET: 'PACKET',
      CHANGEUSERNAME: 'CHANGEUSERNAME',
      KICK: 'KICK',
      ROOMCLOSED: 'ROOMCLOSED'
    };
  }

  /**
   * Initialize the peerjs connection
   * @param {string} username The username to give this client
   * @param {PeerJSOption | null} connectionSettings Optional, the settings to use when connecting to the peerjs server
   */
  init (username = 'Anonymous', connectionSettings = null) {
    this.initialized = false;
    if (this.peer) {
      this.destroy();
    }
    this.username = typeof username === 'string' ?
      (username.trim().slice(0, 64) || 'Anonymous') :
      'Anonymous';
    this.peer = new Peer(connectionSettings ?? {
      host: 'api.nitrobolt.org',
      port: 80,
      path: '/peerjs',
      debug: 3,
      config: {
        iceServers: [
          {
            urls: 'turn:dellr630.derpygamer2142.com:3478', // temporary url
            username: 'nitrobolt',
            credential: 'somethingsecure'
          },
          {
            urls: 'stun:stun.l.google.com:19302'
          },
          { // additional default peerjs servers
            urls: [
              'turn:eu-0.turn.peerjs.com:3478',
              'turn:us-0.turn.peerjs.com:3478'
            ],
            username: 'peerjs',
            credential: 'peerjsp'
          }
        ],
        sdpSemantics: 'unified-plan'
      }
    });

    this.peer.on('open', id => {
      this.peerId = id;
      this.emit(this.Event.SERVERCONNECT, id);
      this.initialized = true;

      const roomId = this._getRoomFromUrl();
      if (roomId) this.joinRoom(roomId);
    });
    this.peer.on('connection', peer => {
      this._handleConnection(peer, false, false);
    });
    this.peer.on('close', this._handleServerDisconnect);
  }

  /**
   * Connect to a given room's host
   * @param {string} roomId The id of the room to join
   * @returns {Promise<boolean>} A promise that will resolve to true if joining was successful and false otherwise
   */
  joinRoom (roomId) {
    if (!this.initialized || !this.peer || this.connectionLocked) return Promise.resolve(false);
    if (typeof roomId !== 'string' || !roomId.trim()) return Promise.resolve(false);

    if (this.connected || this.host) this.close();
    const normalizedRoomId = roomId.trim();
    this._setConnectionLocked(true);

    let host;
    try {
      host = this.peer.connect(normalizedRoomId);
    } catch (error) {
      console.warn('Unable to connect to collaboration host', error);
      this._setConnectionLocked(false);
      return Promise.resolve(false);
    }

    this.host = host;
    this.hostId = normalizedRoomId;
    return new Promise(resolve => {
      const handleFail = error => this._failPendingJoin(host, error);
      this.pendingJoin = {
        peer: host,
        resolve,
        handleFail,
        timeout: setTimeout(() => {
          this._failPendingJoin(host, new Error('Collaboration join request timed out'));
        }, JOIN_TIMEOUT)
      };

      this.peer.once('error', handleFail);
      host.on('error', handleFail);
      host.on('open', () => {
        if (!this.pendingJoin || this.pendingJoin.peer !== host || this.host !== host) return;
        this._handleConnection(host, true, false);
      });
    });
  }

  /**
   * Create a new room
   * @returns {boolean} A boolean representing whether or not room creation was successful
   */
  createRoom () {
    if (!this.initialized || !this.peerId || this.connectionLocked) return false;
    if (this.connected || this.host) this.close();
    this._setConnectionLocked(true);

    this.hostId = this.peerId;
    this.isHost = true;
    this.authenticated = true;
    this.connected = true;
    this.host = null;

    this.roomId = this.peerId;

    this._setRoomInUrl(this.peerId);

    this.emit(this.Event.ROOMCREATE, this.peerId);
    this.emit(this.Event.ROOMCHANGE, this.peerId);
    this._setConnectionLocked(false);

    return true;
  }

  /**
   * Leaves the current room that the client is in. Just calls this.close().
   */
  leaveRoom () {
    this.close(false);
  }

  /**
   * Set the username of this client
   * @param {string} username The username to use
   */
  setUsername (username) {
    this.username = typeof username === 'string' ?
      (username.trim().slice(0, 64) || 'Anonymous') :
      'Anonymous';

    this.sendToAll({
      type: this.PacketType.CHANGEUSERNAME,
      payload: this.username
    });

    this.emit(this.Event.USERNAMEUPDATE, null, this.username);
  }

  /**
   * Update the join lock and emit only when its state changes.
   * @param {boolean} locked New lock state.
   */
  _setConnectionLocked (locked) {
    if (this.connectionLocked === locked) return;
    this.connectionLocked = locked;
    this.emit(locked ? this.Event.JOINLOCK : this.Event.JOINUNLOCK);
  }

  /**
   * Resolve and clean up the current join attempt.
   * @param {boolean} joined Whether admission succeeded.
   */
  _finishPendingJoin (joined) {
    const pendingJoin = this.pendingJoin;
    if (!pendingJoin) return;
    this.pendingJoin = null;
    clearTimeout(pendingJoin.timeout);
    if (this.peer) this.peer.off('error', pendingJoin.handleFail);
    pendingJoin.peer.off('error', pendingJoin.handleFail);
    pendingJoin.resolve(joined);
  }

  /**
   * Fail a join attempt without turning a raw data-channel connection into a
   * joined room.
   * @param {CollaborationPeer} peer Host connection for this attempt.
   * @param {*} error Optional connection error.
   */
  _failPendingJoin (peer, error) {
    if (!this.pendingJoin || this.pendingJoin.peer !== peer) return;
    if (error) console.warn('Unable to join collaboration room', error);
    peer.managerClosing = true;
    this._finishPendingJoin(false);
    this._killPeer(peer);
    if (this.host === peer) this.host = null;
    this.hostId = null;
    this.roomId = null;
    this.connected = false;
    this.authenticated = false;
    this._clearRoomInUrl();
    this._setConnectionLocked(false);
  }

  /**
   * Send a packet only while the connection is usable.
   * @param {CollaborationPeer} peer Destination connection.
   * @param {*} packet Packet payload.
   * @param {boolean} requireAuthentication Whether the peer must be authenticated.
   * @returns {boolean} Whether the packet was handed to PeerJS.
   */
  _safeSend (peer, packet, requireAuthentication = true) {
    if (!peer || !peer.open || (requireAuthentication && !peer.authenticated)) return false;
    try {
      peer.send(packet);
      return true;
    } catch (error) {
      console.warn('Unable to send collaboration packet', error);
      return false;
    }
  }

  /**
   * Close a peer without allowing a transport exception to interrupt cleanup.
   * @param {CollaborationPeer} peer Connection to close.
   */
  _safeClose (peer) {
    if (!peer) return;
    try {
      peer.close();
    } catch (error) {
      console.warn('Unable to close collaboration connection', error);
    }
  }

  /**
   * Send a packet to a specific peer
   * @param {PeerId} peerId The id of the peer to send the packet to
   * @param {*} packet The data to send to the peer
   * @returns {boolean} Whether the packet was sent.
   */
  sendTo (peerId, packet) {
    return this._safeSend(this.connections[peerId], packet);
  }

  /**
   * Send a packet to a list of peers
   * @param {PeerId[]} peerIds An array of PeerIds to send the packet to
   * @param {*} packet The data to send to the peer
   * @returns {number} Number of peers the packet was sent to.
   */
  sendToList (peerIds, packet) {
    if (!Array.isArray(peerIds)) return 0;
    return peerIds.reduce((sent, id) => sent + (this.sendTo(id, packet) ? 1 : 0), 0);
  }

  /**
   * Send some data to all authenticated and open peers
   * @param {*} packet The data to send to all peers
   * @returns {number} Number of peers the packet was sent to.
   */
  sendToAll (packet) {
    let sent = 0;
    for (const peer of Object.values(this.connections)) {
      if (this._safeSend(peer, packet)) sent++;
    }
    return sent;
  }

  /**
   * Destroy all connections and leave the current room
   * @param {boolean} silent Whether to emit update events
   */
  destroy (silent) {
    const oldRoomId = this.roomId;
    const oldHost = this.host;
    const wasConnected = this.connected;
    this.close(true);
    const peer = this.peer;
    this.username = null;
    this.peerId = null;
    this.initialized = false;
    this.peer = null;
    if (peer && !peer.destroyed) {
      peer.off('close', this._handleServerDisconnect);
      peer.destroy();
    }

    if (!silent) {
      this.emit(this.Event.DESTROY);
      this.emit(this.Event.SERVERDISCONNECT);
      if (wasConnected) this.emit(this.Event.ROOMLEAVE, oldRoomId, oldHost);
      this.emit(this.Event.ROOMCHANGE, null);
      this.emit(this.Event.CONNECTIONSUPDATE, []);
    }
  }

  /**
   * Disconnect from the current room
   * @param {boolean} silent Whether to emit room and connection update events
   */
  close (silent) {
    const oldRoomId = this.roomId;
    const oldHost = this.host;
    const wasConnected = this.connected;
    const connections = Object.values(this.connections);
    if (this.isHost && wasConnected) {
      this.sendToAll({
        type: this.PacketType.ROOMCLOSED
      });
    }

    this._finishPendingJoin(false);
    this.roomId = null;
    this.hostId = null;
    this.host = null;
    this.connected = false;
    this.isHost = false;
    this.authenticated = false;
    this.users.clear();
    this.authKeys = {};
    this.connections = {};
    connections.forEach(connection => {
      connection.managerClosing = true;
      this._safeClose(connection);
      if (connection.killTimeout) clearTimeout(connection.killTimeout);
    });
    if (oldHost && !connections.includes(oldHost)) {
      oldHost.managerClosing = true;
      this._safeClose(oldHost);
    }
    this._clearRoomInUrl();
    this._setConnectionLocked(false);

    if (!silent) {
      if (wasConnected) this.emit(this.Event.ROOMLEAVE, oldRoomId, oldHost);
      this.emit(this.Event.ROOMCHANGE, null);
      this.emit(this.Event.CONNECTIONSUPDATE, []);
    }
  }

  kickPeer (peer) {
    if (this.isHost && this.connected) {
      if (Object.prototype.hasOwnProperty.call(this.connections, peer)) {

        this.sendToList(Object.keys(this.connections).filter(id => id !== peer),
        {
          type: this.PacketType.KICK,
          payload: peer
        });

        this._killPeer(this.connections[peer]);
      }
    }
  }

  // internal handlers

  /**
   * Handle the connection of a peer
   * @param {CollaborationPeer} peer The peer to handle the connection of
   * @param {boolean} isHost Whether this peer is the host
   * @param {boolean} isPeer Whether this peer is an existing peer
   */
  _handleConnection (peer, isHost, isPeer) {
    const existingPeer = this.connections[peer.peer];
    if (existingPeer && existingPeer !== peer && existingPeer.open) {
      peer.managerClosing = true;
      this._safeClose(peer);
      return;
    }
    if (existingPeer && existingPeer !== peer) {
      existingPeer.managerClosing = true;
      if (existingPeer.killTimeout) clearTimeout(existingPeer.killTimeout);
    }
    peer.username = null; // not yet set
    peer.killTimeout = null;
    peer.pendingVerification = null;
    peer.managerClosing = false;
    this.connections[peer.peer] = peer;
    this.emit(this.Event.CONNECTIONSUPDATE, Object.values(this.connections));

    if (this.isHost) { // we are the host, this is a client
      peer.authenticated = false;
      peer.killTimeout = setTimeout(() => {
        if (!peer.authenticated) {
          console.warn('Client failed to join', peer);
          this._safeClose(peer);
        }
      }, AUTHENTICATION_TIMEOUT);

      peer.on('data', packet => this._handlePacket(packet, peer));
      peer.on('close', () => this._handleDisconnection(peer));

      this.emit(this.Event.CLIENTCONNECT, peer);

    } else if (isHost) { // this connection is the host

      peer.authenticated = false;
      peer.on('data', packet => this._handlePacket(packet, peer));
      peer.on('close', () => this._handleDisconnection(peer));
      this._safeSend(peer, {
        type: this.PacketType.REQUESTJOIN,
        username: this.username
      }, false);
    } else if (isPeer) { // we are a client, this is a peer
      peer.authenticated = true;

      peer.on('data', packet => this._handlePacket(packet, peer));
      peer.on('close', () => this._handleDisconnection(peer));
      this._safeSend(peer, {
        type: this.PacketType.VERIFYKEY,
        key: this.authKeys[this.peerId],
        username: this.username
      });

    } else { // we are a peer, this is a client
      peer.authenticated = false;
      peer.killTimeout = setTimeout(() => {
        if (!peer.authenticated) {
          console.warn('Client failed to join', peer);
          this._safeClose(peer);
        }
      }, AUTHENTICATION_TIMEOUT);

      peer.on('data', packet => this._handlePacket(packet, peer));
      peer.on('close', () => this._handleDisconnection(peer));

      this.emit(this.Event.PEERCONNECT, peer);
    }
  }

  /**
   * Handle the disconnection of a given peer
   * @param {CollaborationPeer} peer The peer to handle the disconnection of
   */
  _handleDisconnection (peer) {
    if (peer.managerClosing) return;
    const currentPeer = this.connections[peer.peer];
    if (currentPeer && currentPeer !== peer) {
      // A closed PeerJS object can report its close after a replacement
      // connection with the same peer ID has already authenticated. It must not
      // remove the replacement's key, user, or session readiness.
      return;
    }
    if (this.pendingJoin && this.pendingJoin.peer === peer) {
      this._failPendingJoin(peer);
      return;
    }
    if (this.host === peer) {
      const oldRoomId = this.roomId;
      this.close(true);

      this.emit(this.Event.HOSTDISCONNECT, peer);
      this.emit(this.Event.ROOMCLOSE, oldRoomId, peer);
      this.emit(this.Event.ROOMCHANGE, null);
      this.emit(this.Event.CONNECTIONSUPDATE, []);
    } else {
      const event = this.isHost ? this.Event.CLIENTDISCONNECT : this.Event.PEERDISCONNECT;
      const eventValue = this.isHost ? peer.peer : peer;
      this._killPeer(peer);
      this.emit(event, eventValue);
      this.emit(this.Event.CONNECTIONSUPDATE, Object.values(this.connections));
      if (Object.prototype.hasOwnProperty.call(this.authKeys, peer.peer)) delete this.authKeys[peer.peer];
    }
  }

  /**
   * Mark an admitted client as authenticated. Kept synchronous so the state is
   * revalidated before any assignment following an asynchronous UI decision.
   * @param {CollaborationPeer} peer Admitted peer.
   * @param {string} username Display name supplied by the peer.
   * @returns {boolean} Whether the peer was admitted.
   */
  _approvePeer (peer, username) {
    if (!this.isHost || !peer || !peer.open || this.connections[peer.peer] !== peer) return false;
    peer.authenticated = true;
    peer.username = username.trim().slice(0, 64) || 'Anonymous';
    this.users.set(peer.peer, peer.username);
    clearTimeout(peer.killTimeout);
    peer.killTimeout = null;
    this.emit(this.Event.USERNAMEUPDATE, peer, peer.username);
    return true;
  }

  /**
   * Handle a packet from a peer
   * @param {object} packet The received packet
   * @param {CollaborationPeer} peer The peer who sent the packet
   * @returns {void}
   */
  async _handlePacket (packet, peer) {
    if (typeof packet !== 'object') return console.error('Received malformed packet', packet);
    if (typeof packet?.type !== 'string') return console.error('Received malformed packet', packet);

    switch (packet.type) {
      case (this.PacketType.REQUESTJOIN): {
        if (typeof packet?.username !== 'string') return console.error('Received malformed packet', packet);
        if (!this.isHost) return console.error('Client attempted to authenticate with incorrect peer!', peer, packet);
        if (peer.authenticated || peer.joinRequestPending) return;

        peer.joinRequestPending = true;
        let allowJoin = false;
        try {
          allowJoin = await this.joinRequestHandler(packet.username, peer);
        } catch (e) {
          console.error('Failed to handle collaboration join request', e);
        }

        if (allowJoin && this._approvePeer(peer, packet.username)) {
          const key = crypto.randomUUID();
          const clients = Object.values(this.connections).filter(p => p.authenticated && p.open && p !== peer);

          clients.forEach(c => {
            this._safeSend(c, {
              type: this.PacketType.AUTHKEY,
              id: peer.peer,
              key: key
            });
          });

          this._safeSend(peer, {/* this is sent after giving the key to all existing peers
            so that if the new peer tries to authenticate immediately after receiving the key,
            it's less likely to cause issues */
            type: this.PacketType.ALLOWJOIN,
            key: key,
            clients: clients.map(c => c.peer),
            username: this.username
          });

          this.emit(this.Event.PEERUPGRADE, peer, peer.username);
        } else {
          this._safeSend(peer, {
            type: this.PacketType.DENYJOIN
          }, false);
          this._killPeer(peer);
        }

        break;
      }

      case (this.PacketType.ALLOWJOIN): {
        if (this.host !== peer) return console.error('Client impersonating host!', peer, packet);
        if (this.authenticated) return console.error('Host repeated authentication!', peer, packet);

        if (typeof packet?.key !== 'string') return console.error('Received malformed packet', packet);
        if (!Array.isArray(packet?.clients)) return console.error('Received malformed packet', packet);
        if (typeof packet?.username !== 'string') return console.error('Received malformed packet', packet);

        peer.authenticated = true;
        this.authenticated = true;
        this.connected = true;
        this.roomId = this.hostId;
        peer.username = packet.username.trim().slice(0, 64) || 'Anonymous';
        this.users.set(this.hostId, peer.username);
        this.emit(this.Event.USERNAMEUPDATE, peer, peer.username);
        this.authKeys[this.peerId] = packet.key;
        this._setRoomInUrl(this.roomId);
        this._setConnectionLocked(false);

        const acceptedRoomId = this.roomId;
        const acceptedHost = this.host;
        for (const id of packet.clients) {
          if (typeof id !== 'string' || id === this.peerId || id === this.hostId) continue;
          const conn = this.peer.connect(id);

          conn.on('open', () => {
            // A mesh connection may finish opening after this client has
            // already left or switched rooms. Never authenticate that stale
            // connection into the current session.
            if (!this.connected || this.roomId !== acceptedRoomId || this.host !== acceptedHost) {
              conn.managerClosing = true;
              this._safeClose(conn);
              return;
            }
            this._handleConnection(conn, false, true);
          });
        }

        this.emit(this.Event.ROOMJOIN, this.roomId, this.host);
        this.emit(this.Event.ROOMCHANGE, this.roomId);
        this._finishPendingJoin(true);
        break;
      }

      case (this.PacketType.DENYJOIN): {
        if (peer !== this.host) return console.error('Peer impersonating host!', peer, packet);
        this._failPendingJoin(peer);
        break;
      }

      case (this.PacketType.AUTHKEY): {
        if (this.host !== peer) return console.error('Client impersonating host!', peer, packet);

        if (typeof packet?.key !== 'string') return console.error('Received malformed packet', packet);
        if (typeof packet?.id !== 'string') return console.error('Received malformed packet', packet);

        if (this.connections[packet.id]?.authenticated ||
          Object.prototype.hasOwnProperty.call(this.authKeys, packet.id)) {
            return console.error('Host repeated authentication!', peer, packet);
        }

        this.authKeys[packet.id] = packet.key;
        const pendingPeer = this.connections[packet.id];
        if (pendingPeer && pendingPeer.pendingVerification) {
          const pendingVerification = pendingPeer.pendingVerification;
          pendingPeer.pendingVerification = null;
          await this._handlePacket(pendingVerification, pendingPeer);
        }

        break;
      }

      case (this.PacketType.VERIFYKEY): {
        if (peer.authenticated) return console.error('Peer repeated authentication!', peer, packet);

        if (typeof packet?.key !== 'string') return console.error('Received malformed packet', packet);
        if (typeof packet?.username !== 'string') return console.error('Received malformed packet', packet);

        if (!Object.prototype.hasOwnProperty.call(this.authKeys, peer.peer)) {
          peer.pendingVerification = packet;
          break;
        }

        if (this.authKeys[peer.peer] === packet.key) {
          peer.authenticated = true;
          peer.username = packet.username;
          this.users.set(peer.peer, peer.username);
          this.emit(this.Event.USERNAMEUPDATE, peer, peer.username);

          clearTimeout(peer.killTimeout);
          peer.killTimeout = null;

          this._safeSend(peer, {
            type: this.PacketType.ACCEPT,
            username: this.username
          });

          this.emit(this.Event.PEERUPGRADE, peer, peer.username);
        } else return console.error('Client attempted to authenticate with the incorrect key', peer, packet);

        break;
      }

      case (this.PacketType.ACCEPT): {
        if (!peer.authenticated) return console.error('Received unauthenticated acceptance', peer, packet);
        if (typeof packet?.username !== 'string') return console.error('Received malformed packet', packet);

        peer.username = packet.username.trim().slice(0, 64) || 'Anonymous';
        this.users.set(peer.peer, peer.username);
        this.emit(this.Event.USERNAMEUPDATE, peer, peer.username);

        break;
      }

      case (this.PacketType.PACKET): {
        if (!peer.authenticated) return console.error('Received unauthenticated packet', peer, packet);
        if (!Object.prototype.hasOwnProperty.call(packet, 'payload')) {
          return console.error('Received malformed packet', peer, packet);
        }

        this.emit(this.Event.PACKET, packet.payload, peer);
        break;
      }

      case (this.PacketType.CHANGEUSERNAME): {
        if (!peer.authenticated) return console.error('Received unauthenticated username change', peer, packet);
        if (typeof packet?.payload !== 'string') return console.error('Received malformed packet', packet);

        peer.username = packet.payload.trim().slice(0, 64) || 'Anonymous';
        this.users.set(peer.peer, peer.username);
        this.emit(this.Event.USERNAMEUPDATE, peer, peer.username);

        break;
      }

      case (this.PacketType.KICK): {
        if (peer !== this.host) return console.error('Peer impersonating host!', peer, packet);
        if (typeof packet?.payload !== 'string') return console.error('Received malformed packet', packet);
        if (!Object.prototype.hasOwnProperty.call(this.connections, packet.payload)) {
          return console.warn('Host attempted to remove a peer which is no longer connected',
            packet.payload);
          // peers automatically disconnect from a room when they are no longer connected to the host
          // because of this, it's likely when the host kicks a peer that if they are using a vanilla
          // client that it will have already disconnected from the other peers.
        }

        this.emit(this.Event.PEERKICK, this.connections[packet.payload]);
        this._killPeer(this.connections[packet.payload]);

        break;
      }

      case (this.PacketType.ROOMCLOSED): {
        if (peer !== this.host) return console.error('Peer impersonating host!"-', peer, packet);

        this.emit(this.Event.ROOMCLOSE, this.roomId, this.host);
        this.close(false);

        break;
      }

      default: {
        console.error('Received invalid packet type:', packet, peer);
      }
    }

  }

  /**
   * Disconnect a peer
   * @param {CollaborationPeer} peer The peer to kill connection with
   */
  _killPeer (peer) {
    if (!peer) return;
    if (peer.killTimeout) clearTimeout(peer.killTimeout);
    peer.killTimeout = null;
    peer.authenticated = false;
    if (this.connections[peer.peer] === peer) {
      delete this.connections[peer.peer];
      this.users.delete(peer.peer);
    }
    this._safeClose(peer);
  }

  /**
   * Handle the disconnection from the peerjs server
   */
  _handleServerDisconnect () {
    const oldRoomId = this.roomId;
    const oldHost = this.host;
    const wasConnected = this.connected;
    this.destroy(true);
    this.emit(this.Event.SERVERDISCONNECT);
    this.emit(this.Event.ROOMCHANGE, null);
    if (wasConnected) this.emit(this.Event.ROOMLEAVE, oldRoomId, oldHost);
    this.emit(this.Event.CONNECTIONSUPDATE, []);
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
