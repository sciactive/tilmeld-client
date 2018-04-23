import {Nymph, Entity} from 'nymph-client';

export class User extends Entity {
  // === Constructor ===

  constructor (id) {
    super(id);
    this.data.enabled = true;
    this.data.abilities = [];
    this.data.groups = [];
    this.data.inheritAbilities = true;
    this.data.addressType = 'us';
  }

  // === Instance Methods ===

  checkUsername (...args) {
    return this.serverCall('checkUsername', args, true);
  }

  checkEmail (...args) {
    return this.serverCall('checkEmail', args, true);
  }

  checkPhone (...args) {
    return this.serverCall('checkPhone', args, true);
  }

  getAvatar (...args) {
    return this.serverCall('getAvatar', args, true);
  }

  register (...args) {
    return this.serverCall('register', args).then((data) => {
      if (data.result) {
        for (const callback of User.registerCallbacks) {
          const that = this;
          callback(that);
        }
      }
      if (data.loggedin) {
        for (const callback of User.loginCallbacks) {
          const that = this;
          callback(that);
        }
      }
      return Promise.resolve(data);
    });
  }

  logout (...args) {
    return this.serverCall('logout', args).then((data) => {
      if (data.result) {
        for (const callback of User.logoutCallbacks) {
          callback();
        }
      }
      return Promise.resolve(data);
    });
  }

  gatekeeper (...args) {
    return this.serverCall('gatekeeper', args, true);
  }

  changePassword (...args) {
    return this.serverCall('changePassword', args);
  }

  // === Static Methods ===

  static byUsername (username) {
    return Nymph.getEntity(
      {'class': User.class},
      {'type': '&',
        'strict': ['username', username]
      }
    );
  }

  static current (...args) {
    return User.serverCallStatic('current', args);
  }

  static loginUser (...args) {
    return User.serverCallStatic('loginUser', args).then((data) => {
      if (data.result) {
        for (const callback of User.loginCallbacks) {
          callback(data.user);
        }
      }
      return Promise.resolve(data);
    });
  }

  static sendRecoveryLink (...args) {
    return User.serverCallStatic('sendRecoveryLink', args);
  }

  static recover (...args) {
    return User.serverCallStatic('recover', args);
  }

  static getClientConfig (...args) {
    return User.serverCallStatic('getClientConfig', args);
  }

  static on (eventType, callback) {
    if (eventType === 'register') {
      User.registerCallbacks.push(callback);
    } else if (eventType === 'login') {
      User.loginCallbacks.push(callback);
    } else if (eventType === 'logout') {
      User.logoutCallbacks.push(callback);
    }
  }
}

// === Static Properties ===

User.etype = 'tilmeld_user';
// The name of the server class
User.class = 'Tilmeld\\Entities\\User';
User.registerCallbacks = [];
User.loginCallbacks = [];
User.logoutCallbacks = [];

Nymph.setEntityClass(User.class, User);

export default User;
