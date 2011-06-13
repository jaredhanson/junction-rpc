var MethodCall = require('./methodcall');

function XMLRPCParser() {
};

XMLRPCParser.prototype.parse = function(xml) {
  var name = null;
  var params = [];
  
  var methodNameEl = xml.getChild('methodName');
  if (!methodNameEl) { return null; }
  
  name = methodNameEl.getText();
  var paramsEl = xml.getChild('params');
  if (paramsEl) {
    paramsEl.getChildren('param').forEach(function(paramEl) {
      var param = parseValue(paramEl.getChild('value'));
      if (null != param) { params.push(param); }
    });
  }
  return new MethodCall(name, params);
}

function parseValue(xml) {
  var typeEl = xml.children[0];
  if (!typeEl) { return null; }
  
  // @todo: Implement support for dateTime.iso8601 types.
  // @todo: Implement support for base64 types.
  switch (typeEl.name) {
    case 'boolean':
      return (typeEl.getText() == '1' ? true : false);
    case 'i4':
    case 'int':
      return parseInt(typeEl.getText());
    case 'double':
      return parseFloat(typeEl.getText());
    case 'string':
      return typeEl.getText();
    case 'array':
      return parseArray(typeEl);
    case 'struct':
      return parseStruct(typeEl);
  }
}

function parseArray(xml) {
  var dataEl = xml.getChild('data');
  if (!dataEl) { return null; }
  
  var array = [];
  dataEl.getChildren('value').forEach(function(valueEl) {
    var element = parseValue(valueEl);
    if (null != element) { array.push(element); }
  });
  return array;
}

function parseStruct(xml) {
  var struct = {}
  xml.getChildren('member').forEach(function(memberEl) {
    var name = null, value = null;
    var nameEl = memberEl.getChild('name');
    if (nameEl) { name = nameEl.getText(); }
    var valueEl = memberEl.getChild('value');
    if (valueEl) { value = parseValue(valueEl); }
    
    if (null != name && null != value) { struct[name] = value; }
  });
  return struct;
}


module.exports = XMLRPCParser;
