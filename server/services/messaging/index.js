'use strict';

const io = require('socket.io');
const logger = require('../../logger');
const _ = require('underscore');
const OPCODES = require('./opcodes');

class SocketService {
  constructor() {
    this.connections = [];
  }

  listen(serverInstance) {
    this.wss = new io(serverInstance);
    logger.info('socket initializing');
    this.wss.on('connection', (ws) => {
      this.onConnection(ws);
    });
  }

  close() {
    this.wss.close();
  }

  onConnection(ws) {
    this.connections.push({state: 'not identified', socket: ws});
    logger.info('websocket connection opened, connections count: ' + this.connections.length);

    ws.on('disconnect', () => {
      var index = _.findIndex(this.connections, {socket: ws});
      if (index !== -1) {
        this.connections.splice(index, 1);
      }
      logger.info('websocket connection close, connections count: ' + this.connections.length);
    });

    ws.on('message', (event) => {
      this.onMessage(ws, event);
    });
  }

  onMessage(ws, event) {
    logger.info('socket::onMessage');
    var data = JSON.parse(event.data);
    logger.info(data);
    if (data && (data.code || data.code === OPCODES.IDENTIFICATION)) {
      switch (data.code) {
        case OPCODES.IDENTIFICATION:
          console.log("Identification");
          this.onIdentification(ws, data);
          break;
        case OPCODES.ACTION:
          console.log("Action");
          this.onAction(ws, data);
          break;
        default:
          console.warn("Unknown opcode");
          break;
      }
    } else {
      console.error("Nothing to parse");
    }
  }

  onIdentification(ws, data) {
    var index = _.findIndex(this.connections, {socket: ws});
    if (index !== -1) {
      this.connections[index].state = data.type;
    } else {
      logger.warn('Did not find the connection');
    }
  }

  onAction(ws, data) {
    var index = _.findIndex(this.connections, {socket: ws});
    if (index !== -1) {
      var target = this.connections[index].state === 'HomeDesktopApp' ? 'HomeApp' : 'HomeDesktopApp';
      this.connections.forEach(connection => {
        if (connection.state === target) {
          this.send(connection.socket, JSON.stringify(data));
        }
      });
    } else {
      logger.warn('Did not find the connection');
    }
  }

  send(ws, message) {
    ws.emit('message', {data: message});
  }


  onDisconnect(currentConnection) {
    logger.info('messaging::onDisconnect');
    this.connections.splice(this.connections.indexOf(currentConnection), 1);
  }
}

module.exports = SocketService;
