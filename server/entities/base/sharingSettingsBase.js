"use strict";

const mongoose    = require('mongoose');
const usershelper = require('../../usersHelper');
const logger      = require('../../logger');
const Q           = require('q');

class SharingBase {
  constructor() {
  }

  parse(req) {
    var deferred = Q.defer();
    let user_id = req.user_id;
  	let params = {};

  	usershelper.isAdmin(user_id, (err, isadmin) => {
  		if (err) deferred.reject(err);
  		// if user is admin user no filtering parameters will be imposed
  		if (isadmin)  {
        req.role = 'admin';
        return deferred.resolve(params);
      }
  		/* if user isn't amin user entity organisation-wide defaults (owd) will be imposed */
      // if entity owd is set to 'private' document ownership criteria is imposed
			if (this.level === 'private') {
				params.owner = user_id;
			// if entity owd is set to 'read only' no criteria should be imposed
      } else if (this.level === 'read only') {
      }
			return deferred.resolve(params);
  	});

    return deferred.promise;
  }
}

module.exports = SharingBase;
