var util = require('util');
var XMLRPCParser = require('./xmlrpcparser');
var StanzaError = require('junction').StanzaError;

module.exports = function rpc(services) {
  methods = {};
  
  // @todo: Implement a way to namespace these methods with prefixes.
  for (var i = 0, len = arguments.length; i < len; ++i) {
    var service = arguments[i];
    Object.keys(service).forEach(function (key) {
      methods[key] = service[key];
    });
  }
  
  return function rpc(req, res, next) {
    if (!req.is('iq') || !res) { return next(); }
    var query = req.getChild('query', 'jabber:iq:rpc');
    if (!query) { return next(); }
    
    if (req.attrs.type != 'set') {
      var err = new StanzaError();
      err.type = 'modify';
      err.condition = 'bad-request';
      return next(err);
    }
    
    var methodCall = query.getChild('methodCall');
    if (!methodCall) {
      var err = new StanzaError();
      err.type = 'modify';
      err.condition = 'bad-request';
      return next(err);
    }
    
    
    var parser = new XMLRPCParser(methodCall);
    var invocation = parser.parse(methodCall);
    console.log('name: ' + invocation.name);
    console.log('params: ' + util.inspect(invocation.params));
  }
}
