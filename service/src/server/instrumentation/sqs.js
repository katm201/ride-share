
const instrumentSQS = (shim, messageBrokerModule, moduleName) => {
  shim.setLibrary(shim)
  const { Client } = myMessageBrokerModule;

  shim.recordConsume(Client.prototype, 'getMessage', {
    destinationName: shim.FIRST,
    callback: shim.LAST,
    messageHandler: (shim, fn, name, args) => {
      const message = args[1];

      const { headers } = message.properties;

      const params = {
        routing_key: message.properties.routingKey,
      };

      return {
        parameters: params,
        headers,
      };
    },
  });
};

export default instrumentSQS;
