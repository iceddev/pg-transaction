'use strict';

var when = require('when');
var nodefn = require('when/node');

var begin = require('./lib/begin');
var commit = require('./lib/commit');
var rollback = require('./lib/rollback');

function pgTransaction(client, transaction, done){

  function release(err){
    // on successful rollback, release the client and rethrow the error that caused the rollback
    done();
    throw err;
  }

  function destroy(err){
    // upon failed rollback, destroy the client and rethrow the error
    done(err);
    throw err;
  }

  return begin(client)
    .then(function(){
      var defer = when.defer();
      var cb = nodefn.createCallback(defer.resolver);
      var tx = transaction(client, cb);

      if(when.isPromiseLike(tx)){
        return when.race([defer.promise, tx]);
      }

      return defer.promise;
    })
    .then(function(result){
      // on successful transaction, commit and yield the original result
      return commit(client).yield(result);
    })
    .catch(function(err){
      // on failed transaction, rollback the transaction
      return rollback(client).yield(err).then(release, destroy);
    });
}

module.exports = pgTransaction;
