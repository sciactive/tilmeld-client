/* global atob */
import { Nymph, Entity, PubSub } from 'nymph-client';

let currentToken = null;

export class User extends Entity {
  constructor(id) {
    super(id);
    this.data.enabled = true;
    this.data.abilities = [];
    this.data.groups = [];
    this.data.inheritAbilities = true;
    this.data.addressType = 'us';
  }

  checkUsername(...args) {
    return this.serverCall('checkUsername', args, true);
  }

  checkEmail(...args) {
    return this.serverCall('checkEmail', args, true);
  }

  checkPhone(...args) {
    return this.serverCall('checkPhone', args, true);
  }

  getAvatar(...args) {
    return this.serverCall('getAvatar', args, true);
  }

  register(...args) {
    return this.serverCall('register', args).then(data => {
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

  logout(...args) {
    return this.serverCall('logout', args).then(data => {
      if (data.result) {
        User.currentUser = undefined;
        User.handleToken();
        for (const callback of User.logoutCallbacks) {
          callback();
        }
      }
      return Promise.resolve(data);
    });
  }

  gatekeeper(...args) {
    return this.serverCall('gatekeeper', args, true);
  }

  changePassword(...args) {
    return this.serverCall('changePassword', args);
  }

  static byUsername(username) {
    return Nymph.getEntity(
      { class: User.class },
      { type: '&', strict: ['username', username] }
    );
  }

  static current(...args) {
    if (User.currentUser !== undefined) {
      return Promise.resolve(User.currentUser);
    }
    if (!User.currentUserPromise) {
      User.currentUserPromise = User.serverCallStatic('current', args).then(
        user => {
          User.currentUser = user;
          User.currentUserPromise = null;
          return user;
        }
      );
    }
    return User.currentUserPromise;
  }

  static loginUser(...args) {
    return User.serverCallStatic('loginUser', args).then(data => {
      if (data.result) {
        User.currentUser = data.user;
        User.handleToken();
        for (const callback of User.loginCallbacks) {
          callback(data.user);
        }
      }
      return Promise.resolve(data);
    });
  }

  static sendRecoveryLink(...args) {
    return User.serverCallStatic('sendRecoveryLink', args);
  }

  static recover(...args) {
    return User.serverCallStatic('recover', args);
  }

  static getClientConfig(...args) {
    if (User.clientConfig) {
      return Promise.resolve(User.clientConfig);
    }
    if (!User.clientConfigPromise) {
      User.clientConfigPromise = User.serverCallStatic(
        'getClientConfig',
        args
      ).then(config => {
        User.clientConfig = config;
        User.clientConfigPromise = null;
        return config;
      });
    }
    return User.clientConfigPromise;
  }

  static handleToken() {
    if (typeof document === 'undefined') {
      return;
    }
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)TILMELDAUTH\s*=\s*([^;]*).*$)|^.*$/,
      '$1'
    );
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

  static on(event, callback) {
    if (!this.hasOwnProperty(event + 'Callbacks')) {
      return false;
    }
    this[event + 'Callbacks'].push(callback);
    return true;
  }

  static off(event, callback) {
    if (!this.hasOwnProperty(event + 'Callbacks')) {
      return false;
    }
    const i = this[event + 'Callbacks'].indexOf(callback);
    if (i > -1) {
      this[event + 'Callbacks'].splice(i, 1);
    }
    return true;
  }
}

// The name of the server class
User.class = 'Tilmeld\\Entities\\User';
User.registerCallbacks = [];
User.loginCallbacks = [];
User.logoutCallbacks = [];
User.clientConfig = undefined;
User.clientConfigPromise = undefined;

Nymph.setEntityClass(User.class, User);

Nymph.on('response', () => User.handleToken());
User.handleToken();

export default User;
