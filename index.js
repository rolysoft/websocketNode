const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// Almacenar conexiones con un identificador (por ejemplo, userID)
const clients = new Map();

wss.on('connection', (ws, req) => {
    // Suponiendo que el usuario envía su ID después de conectar
    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.error('Mensaje inválido:', message);
            return;
        }

        if (data.type === 'register') {
            // Registrar al usuario en el mapa con su ID
            clients.set(data.userID, ws);
            console.log(`Usuario ${data.userID} registrado.`);

            var test = SingletonFactory.getInstance();

        } else if (data.type === 'message') {
            // Enviar mensaje a un usuario específico
            const recipientSocket = clients.get(data.to);
            if (recipientSocket) {
                recipientSocket.send(JSON.stringify({ from: data.userID, message: data.message }));
            } else {
                console.log(`Usuario ${data.to} no encontrado.`);
            }
        }
    });

    ws.on('close', () => {
        // Eliminar usuario desconectado
        for (const [userID, client] of clients.entries()) {
            if (client === ws) {
                clients.delete(userID);
                console.log(`Usuario ${userID} desconectado.`);
                break;
            }
        }
    });


    var SingletonFactory = (function () {
        function SingletonClass() {

            let interval = setInterval(() => {

                // Aqui la logica para enviar fichas asignadas a usuario X (query oracle)

                let c = Math.floor(Math.random() * 8);
                console.log(c);

                let user = 'usuario' + c;
                const recipientSocket = clients.get('usuario' + c);
                if (recipientSocket) {
                    recipientSocket.send(JSON.stringify({ from: 'SYS', data: `${c + Math.floor(Math.random() * 8)}` }));
                }
            }, 1000);
        }
        var instance;
        return {
            getInstance: function () {
                if (instance == null) {
                    instance = new SingletonClass();
                    // Hide the constructor so the returned object can't be new'd...
                    instance.constructor = null;
                }
                return instance;
            }
        };
    })();
});

console.log('Servidor WebSocket corriendo en ws://localhost:8080');