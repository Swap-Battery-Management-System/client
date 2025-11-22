import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect(token: string, userId: string) {
    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.socket?.emit("register", userId);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, payload?: any) {
    this.socket?.emit(event, payload);
  }
}

export const socketService = new SocketService();
