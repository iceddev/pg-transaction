'use strict';

var when = require('when');

function begin(client){

  function resolver(resolve, reject){
    client.query('BEGIN', function(err, result){
      if(err){
        reject(err);
      } else {
        resolve(result);
      }
    });
  }

  return when.promise(resolver);
}

module.exports = begin;
