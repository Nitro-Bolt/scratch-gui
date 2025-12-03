/* eslint-disable no-alert */
/* eslint-disable indent */
// eslint-disable-next-line
import Peer, {DataConnection, PeerJSOption} from 'peerjs';
import {EventEmitter} from 'events';
import bindAll from 'lodash.bindall';

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
    // eslint-disable-next-line valid-jsdoc
    /** @type {JoinRequestHandler} */
    this.joinRequestHandler = username => confirm(`Allow ${username} to join?`); // overrideable

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
    this.username = username;
    this.peer = new Peer(connectionSettings ?? {
      host: 'localhost',
      port: 1296,
      path: '/peerjs',
      debug: 3
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
    if (!this.initialized) return;
    if (this.connectionLocked) return;

    this.connectionLocked = true;
    this.emit(this.Event.JOINLOCK);

    if (this.connected) this.close();
    this.host = this.peer.connect(roomId); // try to connect to the host of the room
    let promiseResolution; /* so that we can resolve the returned promise
                              when we have either connected or failed to connected */

    const handleFail = err => {
      this.host.close();
      this.host = null;
      this.connectionLocked = false;
      this.emit(this.Event.JOINUNLOCK);
      this._clearRoomInUrl();

      console.log(err);
      promiseResolution(false);
    };


    this.peer.once('error', handleFail); // if connecting fails we give up and close the connection
    this.host.on('open', () => {
      this.hostId = roomId;
      this.roomId = roomId;
      this.connected = true;
      this.connectionLocked = false;

      this.peer.off('error', handleFail);
      this.emit(this.Event.JOINUNLOCK);
      this._setRoomInUrl(roomId);
      this._handleConnection(this.host, true, false);
      this.emit(this.Event.ROOMJOIN, roomId, this.host);
      this.emit(this.Event.ROOMCHANGE, roomId);

      promiseResolution(true);
    });
    
    return new Promise(resolve => {
      promiseResolution = resolve; // this is super freaky
    });
  }

  /**
   * Create a new room
   * @returns {boolean} A boolean representing whether or not room creation was successful
   */
  createRoom () {
    if (!this.initialized) return console.error('Client not initialized!') && false;
    if (this.connectionLocked) return console.log('Connection locked!') && false;
    this.connectionLocked = true;
    this.emit(this.Event.JOINLOCK);

    if (this.connected) this.close();

    this.hostId = this.peerId;
    this.isHost = true;
    this.authenticated = true;
    this.connected = true;
    this.host = null;

    this.roomId = this.peerId
    
    this._setRoomInUrl(this.peerId);

    this.connectionLocked = false;

    this.emit(this.Event.ROOMCREATE, this.peerId);
    this.emit(this.Event.ROOMCHANGE, this.peerId);
    this.emit(this.Event.JOINUNLOCK);

    return true;
  }

  /**
   * Set the username of this client
   * @param {string} username The username to use
   */
  setUsername (username) {
    this.username = username;

    this.sendToAll({
      type: this.PacketType.CHANGEUSERNAME,
      payload: username
    });

    this.emit(this.Event.USERNAMEUPDATE, null, username);
  }

  /**
   * Send a packet to a specific peer
   * @param {PeerId} peerId The id of the peer to send the packet to
   * @param {*} packet The data to send to the peer
   */
  sendTo (peerId, packet) {
    this.connections[peerId].send(packet);
  }

  /**
   * Send a packet to a list of peers
   * @param {PeerId[]} peerIds An array of PeerIds to send the packet to
   * @param {*} packet The data to send to the peer
   */
  sendToList (peerIds, packet) {
    peerIds.forEach((id) => this.connections[id].send(packet))
  }

  /**
   * Send some data to all authenticated and open peers
   * @param {*} packet The data to send to all peers
   */
  sendToAll (packet) {
    for (const peer of Object.values(this.connections)) {
      if (peer.authenticated && peer.open) peer.send(packet);
    }
  }

  /**
   * Destroy all connections and leave the current room
   * @param {boolean} silent Whether to emit update events
   */
  destroy (silent) {
    if (!silent) {
      this.emit(this.Event.DESTROY);
      this.emit(this.Event.SERVERDISCONNECT);
      this.emit(this.Event.ROOMCHANGE, null);
      this.emit(this.Event.ROOMLEAVE, this.roomId, this.host);
      this.emit(this.Event.CONNECTIONSUPDATE, Object.values(this.connections));
    }
    
    if (this.isHost) {
      this.sendToAll({
        type: this.PacketType.ROOMCLOSED
      });
    }

    this.username = null;
    this.roomId = null;
    this.peerId = null;
    this.hostId = null;
    this.host = null;

    this.connected = false;
    this.isHost = false;
    this.initialized = false;
    this.authenticated = false;

    this.users.clear();
    this.connections = {};

    this.peer?.destroy();
    this.peer = null;

    
  }

  /**
   * Disconnect from the current room
   * @param {boolean} silent Whether to emit room and connection update events
   */
  close (silent) {
    if (!silent) {
      this.emit(this.Event.ROOMLEAVE, this.roomId, this.host);
      this.emit(this.Event.ROOMCHANGE, null);
      this.emit(this.Event.CONNECTIONSUPDATE, Object.values(this.connections));
    }

    if (this.isHost) {
      this.sendToAll({
        type: this.PacketType.ROOMCLOSED
      });
    }

    this.roomId = null;
    this.peerId = null;
    this.hostId = null;
    this.host?.close();
    this.host = null;

    this.connected = false;
    this.isHost = false;
    this.authenticated = false;

    this.users.clear();
    Object.values(this.connections).forEach(c => c.close());
    this.connections = {};
  }

  kickPeer (peer) {
    if (this.isHost && this.connected) {
      if (Object.prototype.hasOwnProperty.call(this.connections, peer)) {
        const candidates = Object.keys(this.connections).filter((id ) => id !== peer)
        console.log(candidates)
        this.sendToList(Object.keys(this.connections).filter((id) => id !== peer), 
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
    peer.username = null; // not yet set
    peer.killTimeout = null;
    this.connections[peer.peer] = peer;
    this.users.set(peer.peer, null);
    this.emit(this.Event.CONNECTIONSUPDATE, Object.values(this.connections));

    if (this.isHost) { // we are the host, this is a client
      peer.authenticated = false;
      peer.killTimeout = setTimeout(() => {
        if (!peer.authenticated) {
          console.warn('Client failed to join', peer);
          peer.close();
        }
      }, 25000);

      peer.on('data', packet => this._handlePacket(packet, peer));
      peer.on('close', () => this._handleDisconnection(peer));

      this.emit(this.Event.CLIENTCONNECT, peer);

    } else if (isHost) { // this connection is the host

      peer.authenticated = true;
      peer.send({
        type: this.PacketType.REQUESTJOIN,
        username: this.username
      });

      peer.on('data', packet => this._handlePacket(packet, peer));
      peer.on('close', () => this._handleDisconnection(peer));
    } else if (isPeer) { // we are a client, this is a peer
      peer.authenticated = true;

      peer.send({
        type: this.PacketType.VERIFYKEY,
        key: this.authKeys[this.peerId],
        username: this.username
      });

      peer.on('data', packet => this._handlePacket(packet, peer));
      peer.on('close', () => this._handleDisconnection(peer));

    } else { // we are a peer, this is a client
      peer.authenticated = false;
      peer.killTimeout = setTimeout(() => {
        if (!peer.authenticated) {
          console.log('Client failed to join', peer);
          peer.close();
        }
      }, 25000);

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
    if (this.host === peer) {
      this.close(true);

      this.emit(this.Event.HOSTDISCONNECT, peer);
      this.emit(this.Event.ROOMCLOSE, peer.peer, peer);
      this.emit(this.Event.ROOMCHANGE, null);
      this.emit(this.Event.CONNECTIONSUPDATE, Object.values(this.connections));
    } else {
      this._killPeer(peer);
      this.emit(this.Event.CONNECTIONSUPDATE, Object.values(this.connections));
      if (Object.prototype.hasOwnProperty.call(this.authKeys, peer.peer)) delete this.authKeys[peer.peer];
    }
  }

  /**
   * Handle a packet from a peer
   * @param {object} packet The received packet
   * @param {CollaborationPeer} peer The peer who sent the packet
   * @returns {void}
   */
  _handlePacket (packet, peer) {
    if (typeof packet !== 'object') return console.error('Received malformed packet', packet);
    if (typeof packet?.type !== 'string') return console.error('Received malformed packet', packet);

    switch (packet.type) {
      case (this.PacketType.REQUESTJOIN): {
        if (typeof packet?.username !== 'string') return console.error('Received malformed packet', packet);
        if (!this.isHost) return console.error('Client attempted to authenticate with incorrect peer!', peer, packet);

        if (this.joinRequestHandler(packet.username, peer)) {
          peer.authenticated = true;
          peer.username = packet.username;
          this.users.set(peer.peer, packet.username);
          this.emit(this.Event.USERNAMEUPDATE, peer, packet.username);

          clearTimeout(peer.killTimeout);
          peer.killTimeout = null;

          const key = crypto.randomUUID();
          const clients = Object.values(this.connections).filter(p => p.authenticated && p.open && p !== peer);

          clients.forEach(c =>
            c.send({
              type: this.PacketType.AUTHKEY,
              id: peer.peer,
              key: key
            })
          );

          peer.send({/* this is sent after giving the key to all existing peers
            so that if the new peer tries to authenticate immediately after receiving the key,
            it's less likely to cause issues */
            type: this.PacketType.ALLOWJOIN,
            key: key,
            clients: clients.map(c => c.peer),
            username: this.username
          });

          this.emit(this.Event.PEERUPGRADE, peer, peer.username);
        } else {
          peer.authenticated = false;
          peer.send({
            type: this.PacketType.DENYJOIN
          });

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

        this.authenticated = true;
        this.host.username = packet.username;
        this.users.set(this.hostId, this.host.username);
        this.emit(this.Event.USERNAMEUPDATE, this.host, this.host.username);
        this.authKeys[this.peerId] = packet.key;

        for (const id of packet.clients) {
          const conn = this.peer.connect(id);

          conn.on('open', () => {
            this._handleConnection(conn, false, true);
          });
        }

        break;
      }

      case (this.PacketType.DENYJOIN): {
        console.error('We weren\'t allowed to connect :(');

        this._killPeer(this.host);
        this.close();

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

        break;
      }

      case (this.PacketType.VERIFYKEY): {
        if (peer.authenticated) return console.error('Peer repeated authentication!', peer, packet);

        if (typeof packet?.key !== 'string') return console.error('Received malformed packet', packet);
        if (typeof packet?.username !== 'string') return console.error('Received malformed packet', packet);

        if (!Object.prototype.hasOwnProperty.call(this.authKeys, peer.peer)) {
          return console.error('Client attempted to authenticate but a key was not yet received!', peer, packet);
          // todo: maybe add a listener for a packet here just in case it's the next packet received
        }
        

        if (this.authKeys[peer.peer] === packet.key) {
          peer.authenticated = true;
          peer.username = packet.username;
          this.users.set(peer.peer, peer.username);
          this.emit(this.Event.USERNAMEUPDATE, peer, peer.username);

          clearTimeout(peer.killTimeout);
          peer.killTimeout = null;

          peer.send({
            type: this.PacketType.ACCEPT,
            username: this.username
          });

          this.emit(this.Event.PEERUPGRADE, peer, peer.username)
        } else return console.error('Client attempted to authenticate with the incorrect key', peer, packet);
        
        break;
      }

      case (this.PacketType.ACCEPT): {
        if (typeof packet?.username !== 'string') return console.error('Received malformed packet', packet);

        peer.username = packet.username;
        this.users.set(peer.peer, peer.username);
        this.emit(this.Event.USERNAMEUPDATE, peer, peer.username);

        break;
      }

      case (this.PacketType.PACKET): {
        if (!peer.authenticated) return console.error('Received unauthenticated packet', peer, packet);
        if (!Object.prototype.hasOwnProperty.call(packet, 'payload')) {
          return console.error('Received malformed packet', peer, packet);
        }

        console.log('authenticated packet', packet);
        this.emit(this.Event.PACKET, packet.payload, peer);
        break;
      }

      case (this.PacketType.CHANGEUSERNAME): {
        if (typeof packet?.payload !== 'string') return console.error('Received malformed packet', packet);

        peer.username = packet.payload;
        this.users.set(peer.peer, packet.payload);
        this.emit(this.Event.USERNAMEUPDATE, peer, peer.username);

        break;
      }

      case (this.PacketType.KICK): {
        if (peer !== this.host) return console.error('Peer impersonating host!', peer, packet);
        if (typeof packet?.payload !== 'string') return console.error('Received malformed packet', packet);
        if (!Object.prototype.hasOwnProperty.call(this.connections, packet.payload)) {
          return console.warn('Failed to kicked non existent peer(this should probably happen!)', peer, packet, this.connections); 
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
        this.emit(this.Event.ROOMCHANGE, null);
        this.emit(this.Event.CONNECTIONSUPDATE, Object.values(this.connections));
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
    peer.close();
    peer.authenticated = false;
    if (peer.killTimeout) clearTimeout(peer.killTimeout);
    delete this.connections[peer.peer];
    this.users.delete(peer.peer);
  }

  /**
   * Handle the disconnection from the peerjs server
   */
  _handleServerDisconnect () {
    this.destroy(true); // todo: this is kinda freaky, maybe it should be changed
    this.emit(this.Event.SERVERDISCONNECT);
    this.emit(this.Event.ROOMCHANGE, null);
    this.emit(this.Event.ROOMLEAVE, this.roomId, null);
    this.emit(this.Event.CONNECTIONSUPDATE, Object.values(this.connections));
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
