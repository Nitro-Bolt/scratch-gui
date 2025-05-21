import Peer from "peerjs";

class NBConnectionManager {
  constructor() {
    this.peer = null;
    this.peerId = null;
    this.host = null;
    this.hostId = null;
    this.roomId = null;
    this.isHost = false;
    this.connected = false;
    this.initialized = false;

    this.username = "Anonymous";
    this.connections = {};
    this.authKeys = {};
    this.users = [];

    this.callbacks = {
      onPeerConnected: () => {},
      onPeerDisconnected: () => {},
      onMessage: () => {},
      onUpdatePeers: () => {},
      onHostDisconnected: () => {},
      onRoomLeft: () => {},
    };
  }

  on(event, handler) {
    if (this.callbacks[event]) this.callbacks[event] = handler;
  }

  init(username = "Anonymous") {
    if (this.initialized) return;
    this.initialized = true;
    this.username = username;

    this.peer = new Peer({
      // host: "nitrobolt-backend.derpygamer2142.com",
      host: "localhost",
      port: 1296,
      path: "/peerjs",
      // secure: true,
      secure: false,
      debug: 2,
    });

    this.peer.on("open", (id) => {
      this.peerId = id;
      const room = this._getRoomFromUrl();
      if (room) this.joinRoom(room);
    });

    this.peer.on("connection", (conn) => this._handleIncomingConnection(conn));
    this.peer.on("error", () => this.leaveRoom());
    this.peer.on("close", () => this.destroy());
  }

  createRoom() {
    if (!this.peerId) throw new Error("Peer not ready");
    this.isHost = true;
    this.connected = true;
    this.roomId = this.hostId = this.peerId;
    this._setRoomInUrl(this.roomId);
    return this.roomId;
  }

  joinRoom(roomId) {
    if (!roomId || !this.peer) return;
    this.isHost = false;
    this.roomId = roomId;
    this.hostId = roomId;
    this._setRoomInUrl(roomId);

    const conn = this.peer.connect(roomId);
    this.host = conn;

    conn.on("open", () => {
      this.connected = true;
      this._bindHost(conn);
      conn.send({ type: "REQUESTJOIN", username: this.username });
    });
  }

  shutdownRoom() {
    if (!this.isHost) return;

    this.sendToAll({ type: "ROOMCLOSED" });
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
      users: [],
    });
  }

  leaveRoom() {
    this._clearRoomInUrl();
    this.roomId = null;
    this.hostId = null;
    this.isHost = false;
    this.connected = false;

    this.host?.close();
    this.host = null;

    this.disconnectAll();
    this.callbacks.onRoomLeft();
  }

  destroy() {
    this.disconnectAll();
    this.peer?.destroy();
    this._clearRoomInUrl();
    Object.assign(this, {
      peer: null,
      host: null,
      hostId: null,
      initialized: false,
      connected: false,
    });
  }

  disconnectAll() {
    Object.values(this.connections).forEach((conn) => conn.close());
    this.connections = {};
    this.users = [];
  }

  sendToAll(packet) {
    Object.values(this.connections).forEach((conn) => conn.send(packet));
  }

  setUsername(username) {
    this.username = username;
    this.sendToAll({ type: "CHANGEUSERNAME", payload: username });
  }

  kickPeer(peerId) {
    this.sendToAll({ type: "KICK", payload: peerId });
    this.connections[peerId]?.close();
    delete this.connections[peerId];
    this.users = this.users.filter(
      (entry) => Object.values(entry)[0] !== peerId
    );
  }

  getUsernameByPeerId(peerId) {
    const entry = this.users.find((e) => Object.values(e)[0] === peerId);
    return entry ? Object.keys(entry)[0] : null;
  }

  // --- Internal Handlers ---

  _handleIncomingConnection(conn) {
    conn.authenticated = false;
    this.connections[conn.peer] = conn;

    conn.on("open", () => {
      setTimeout(() => {
        if (!conn.authenticated) conn.close();
      }, 25000);
    });

    conn.on("data", (data) => this._handlePacket(conn, data));
    conn.on("close", () => {
      delete this.connections[conn.peer];
      this.users = this.users.filter(
        (entry) => Object.values(entry)[0] !== conn.peer
      );

      if (!this.isHost && conn === this.host) {
        this.connected = false;
        this.callbacks.onHostDisconnected();
      }

      this.callbacks.onPeerDisconnected(conn.peer);
      this.callbacks.onUpdatePeers(Object.keys(this.connections));
    });
  }

  _bindHost(conn) {
    conn.authenticated = true;
    conn.on("data", (data) => this._handlePacket(conn, data));
    conn.on("close", () => {
      this.connected = false;
      this.host = null;
      this.disconnectAll();
      this.callbacks.onHostDisconnected();
    });
  }

  _bindClient(conn, key) {
    conn.on("open", () =>
      conn.send({ type: "VERIFYKEY", key, username: this.username })
    );
    conn.on("data", (data) => this._handlePacket(conn, data));
    conn.on("close", () => {
      delete this.connections[conn.peer];
      this.users = this.users.filter(
        (entry) => Object.values(entry)[0] !== conn.peer
      );
      this.callbacks.onPeerDisconnected(conn.peer);
      this.callbacks.onUpdatePeers(Object.keys(this.connections));
    });

    this.connections[conn.peer] = conn;
  }

  _handlePacket(conn, data) {
    if (!data?.type) return;

    const sendTo = (peerId, msg) => this.connections[peerId]?.send(msg);

    switch (data.type) {
      case "REQUESTJOIN": {
        if (!this.isHost) return;
        if (!window.confirm(`Allow ${data.username} to join?`))
          return conn.close();

        const key = crypto.randomUUID();
        conn.authenticated = true;
        conn.username = data.username;
        this.users.push({ [data.username]: conn.peer });

        conn.send({
          type: "ALLOWJOIN",
          key,
          clients: Object.keys(this.connections).filter((p) => p !== conn.peer),
          username: this.username,
        });

        Object.keys(this.connections).forEach((peerId) =>
          sendTo(peerId, { type: "AUTHKEY", id: conn.peer, key })
        );

        this.callbacks.onPeerConnected(conn.peer, data.username);
        this.callbacks.onUpdatePeers(Object.keys(this.connections));
        break;
      }

      case "ALLOWJOIN": {
        if (conn !== this.host) return;
        this.hostId = conn.peer;

        data.clients.forEach((peerId) => {
          const peerConn = this.peer.connect(peerId);
          this._bindClient(peerConn, data.key);
        });

        this.users.push({ [data.username]: conn.peer });
        this.callbacks.onPeerConnected(conn.peer, data.username);
        this.callbacks.onUpdatePeers(Object.keys(this.connections));
        break;
      }

      case "AUTHKEY": {
        if (conn !== this.host) return;
        this.authKeys[data.key] = {
          id: data.id,
          timeout: setTimeout(() => delete this.authKeys[data.key], 25000),
        };
        break;
      }

      case "VERIFYKEY": {
        const auth = this.authKeys[data.key];
        if (!auth || auth.id !== conn.peer) return conn.close();

        clearTimeout(auth.timeout);
        delete this.authKeys[data.key];

        conn.authenticated = true;
        conn.username = data.username;
        this.users.push({ [data.username]: conn.peer });

        conn.send({ type: "ACCEPT", username: this.username });
        this.callbacks.onPeerConnected(conn.peer, data.username);
        this.callbacks.onUpdatePeers(Object.keys(this.connections));
        break;
      }

      case "ACCEPT": {
        conn.authenticated = true;
        conn.username = data.username;
        this.users.push({ [data.username]: conn.peer });
        this.callbacks.onPeerConnected(conn.peer, data.username);
        this.callbacks.onUpdatePeers(Object.keys(this.connections));
        break;
      }

      case "PACKET": {
        if (conn.authenticated) {
          this.callbacks.onMessage(conn.peer, conn.username, data.payload);
        }
        break;
      }

      case "CHANGEUSERNAME": {
        if (!conn.authenticated) return;
        conn.username = data.payload;
        this.users = this.users.filter(
          (entry) => Object.values(entry)[0] !== conn.peer
        );
        this.users.push({ [conn.username]: conn.peer });
        this.callbacks.onUpdatePeers(Object.keys(this.connections));
        break;
      }

      case "KICK": {
        if (this.isHost && conn === this.host) this.kickPeer(data.payload);
        break;
      }

      case "ROOMCLOSED": {
        if (!this.isHost) this.leaveRoom();
        break;
      }
    }
  }

  _getRoomFromUrl() {
    return new URLSearchParams(window.location.search).get("room");
  }

  _setRoomInUrl(roomId) {
    const url = new URL(window.location.href);
    url.searchParams.set("room", roomId);
    window.history.replaceState({}, "", url.toString());
  }

  _clearRoomInUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("room");
    window.history.replaceState({}, "", url.toString());
  }
}

export default new NBConnectionManager();