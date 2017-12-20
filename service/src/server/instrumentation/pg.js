

const findBatchQueryArg = function (shim, batch, fnName, args) {
  const sql = (args[0] && args[0][0]) || '';
  return sql.query || sql;
};

const instrumentPostgres = function (shim, postgres, moduleName) {
  shim.setDatastore(shim.POSTGRES);

  const proto = postgres.Client.prototype;
  shim.recordOperations(proto, ['connect', 'shutdown'], { callback: shim.LAST });
  shim.recordQuery(proto, '_innerExecute', { query: shim.FIRST, callback: shim.LAST });
  shim.recordBatchQuery(proto, 'batch', {
    query: findBatchQueryArg,
    callback: shim.LAST,
  });
};

export default instrumentPostgres;
