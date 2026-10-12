import { EventEmitter } from 'events';

const RECONNECT_DELAY_MS = 5000;

const VERSION = 1;
const SCHEMA = 1;

export class RoomSyncClient extends EventEmitter {
    constructor(settingsManager) {
        super();

        this.settingsManager = settingsManager;
        this.socket = null;
        this.host = null;
        this.connected = false;
        this.outdated = false;
        this.reconnectTimeout = null;
    }

    get status() {
        return { connected: this.connected, outdated: this.outdated };
    }

    get enabled() {
        return this.settingsManager.get('roomSyncEnabled');
    }

    // Connects, reconnects or disconnects depending on the current settings
    applySettings() {
        if (!this.enabled) {
            this.disconnect();
            return;
        }

        const host = this.settingsManager.get('roomSyncHost');
        if (host !== this.host || !this.socket) {
            this.reconnect();
        }
    }

    reconnect() {
        this.disconnect();
        if (!this.enabled) return;

        this.connect();
    }

    connect() {
        this.host = this.settingsManager.get('roomSyncHost');

        let socket;
        try {
            socket = new WebSocket(`ws://${this.host}`);
        } catch (error) {
            // Invalid host, retrying won't help until the settings change
            console.warn(`[RoomSyncClient] Invalid host "${this.host}": ${error.message}`);
            return;
        }
        this.socket = socket;

        socket.addEventListener('open', () => {
            if (socket !== this.socket) return;

            console.log(`[RoomSyncClient] Connected to ${this.host}`);
            this.setStatus({ connected: true });
        });
        socket.addEventListener('message', (event) => {
            if (socket !== this.socket) return;

            this.handleMessage(event.data);
        });
        // A failed handshake only fires "error" without a following "close", so both have to be handled
        socket.addEventListener('error', () => this.handleSocketLost(socket));
        socket.addEventListener('close', () => this.handleSocketLost(socket));
    }

    handleSocketLost(socket) {
        if (socket !== this.socket) return;

        this.socket = null;
        this.setStatus({ connected: false, outdated: false });
        this.scheduleReconnect();
    }

    handleMessage(data) {
        let message;
        try {
            message = JSON.parse(data);
        } catch {
            console.warn(`[RoomSyncClient] Ignoring non-JSON message`);
            return;
        }
        if (typeof message !== 'object' || message === null || typeof message.type !== 'string') {
            console.warn(`[RoomSyncClient] Ignoring message without a type`);
            return;
        }

        if (message.type === 'hello') {
            const outdated = message.v !== VERSION || message.schema !== SCHEMA;
            if (outdated) {
                console.warn(`[RoomSyncClient] Version mismatch: game uses v${message.v}/schema ${message.schema}, client expects v${VERSION}/schema ${SCHEMA}`);
            }
            this.setStatus({ outdated });
            return;
        }

        this.emit('message', message);
    }

    disconnect() {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;

        if (this.socket) {
            const socket = this.socket;
            // Detach first so the close handler doesn't schedule a reconnect
            this.socket = null;
            socket.close();
        }
        this.setStatus({ connected: false, outdated: false });
    }

    scheduleReconnect() {
        clearTimeout(this.reconnectTimeout);
        if (!this.enabled) return;

        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect();
        }, RECONNECT_DELAY_MS);
    }

    setStatus({ connected = this.connected, outdated = this.outdated }) {
        if (this.connected === connected && this.outdated === outdated) return;

        this.connected = connected;
        this.outdated = outdated;
        this.emit('status-change', this.status);
    }
}
