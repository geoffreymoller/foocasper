var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug'
});

var args = casper.cli.args;
var options = casper.cli.options;

var URI = options.URI || 'http://localhost:8081/spec/browser/suite_runner.html';
if(options.match){
  URI += '?match=' + options.match
}

casper.start(URI, function(self){
  function noop(){};
  this.waitForSelector('div.progress-bar-log div', noop, noop, 500000);
});

var payload;
casper.then(function(self){

  payload = this.evaluate(function() {

    var testNodes = document.querySelectorAll('div.progress-bar-log div');
    summary = testNodes[0].innerText;
    runtime = testNodes[1].innerText;
    var failures = document.querySelectorAll('div.failure');
    failures = parseFailures(failures);
    return {summary: summary, runtime: runtime, failures: failures};

    function parseFailures(failures){
      var messages = [];
      if(failures.length){
        for (var i = 0; i < failures.length; i++) {
          var message = failures[i].querySelector('a.title').innerText;
          messages.push(message);
        }
      }
      return messages;
    }

  })
});

casper.then(function(self){
  var summary = payload.summary.split(':')[1].split(',');
  var failed = +summary[0].split(' ')[1];
  var status = failed ? 'ERROR' : 'INFO';
  this.echo('');
  this.echo(payload.summary, status);
  this.echo(payload.runtime, status);
  if(failed && payload.failures.length){
    for(var i = 0; i < payload.failures.length; i++){
      this.echo(payload.failures[i], status);
    }
  }
  this.echo('');
});

casper.run();

