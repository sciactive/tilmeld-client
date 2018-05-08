/* global atob */
import {Nymph, Entity, PubSub} from 'nymph-client';

let currentToken = null;

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
        User.handleToken();
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
        User.handleToken();
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
        User.handleToken();
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

  static handleToken () {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)TILMELDAUTH\s*=\s*([^;]*).*$)|^.*$/, '$1');
    if (currentToken !== token) {
      if (token === '') {
        Nymph.setXsrfToken(null);
        if (PubSub.pubsubURL != null) {
          PubSub.setToken(null);
        }
      } else {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jwt = JSON.parse(atob(base64));
        Nymph.setXsrfToken(jwt.xsrfToken);
        if (PubSub.pubsubURL != null) {
          PubSub.setToken(token);
        }
      }
    }
    currentToken = token;
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

// The name of the server class
User.class = 'Tilmeld\\Entities\\User';
User.registerCallbacks = [];
User.loginCallbacks = [];
User.logoutCallbacks = [];

Nymph.setEntityClass(User.class, User);

User.handleToken();

export default User;
