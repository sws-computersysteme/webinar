
var util = require('util');
var stream = require('stream');

function UniformLineEndings() {
    stream.Transform.call(this);
}

UniformLineEndings.prototype._transform = function (chunk, enc, cb) {
    var str = chunk.toString()
    if (this.__prior_ending_char == '\r' && str[0] == '\n') str = str.substring(1)
    this.__prior_ending_char = str[str.length-1]
    str = str.replace(/\r\n|\n|\r/g, '\n')
    this.push(str);
    cb();
  };

fs.createReadStream(file).pipe(new UniformLineEndings()).pipe(parser);