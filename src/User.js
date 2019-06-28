/* global atob */
import { Nymph, Entity, PubSub } from 'nymph-client';

let currentToken = null;

export class User extends Entity {
  constructor(id) {
    super(id);
    this.enabled = true;
    this.abilities = [];
    this.groups = [];
    this.inheritAbilities = true;
    this.addressType = 'us';
  }

  $checkUsername(...args) {
    return this.$serverCall('checkUsername', args, true);
  }

  $checkEmail(...args) {
    return this.$serverCall('checkEmail', args, true);
  }

  $checkPhone(...args) {
    return this.$serverCall('checkPhone', args, true);
  }

  $getAvatar(...args) {
    return this.$serverCall('getAvatar', args, true);
  }

  $register(...args) {
    return this.$serverCall('register', args).then(data => {
      if (data.result) {
        for (let i = 0; i < User.registerCallbacks.length; i++) {
          User.registerCallbacks[i] && User.registerCallbacks[i](this);
        }
      }
      if (data.loggedin) {
        User.handleToken();
        for (let i = 0; i < User.loginCallbacks.length; i++) {
          User.loginCallbacks[i] && User.loginCallbacks[i](this);
        }
      }
      return Promise.resolve(data);
    });
  }

  $logout(...args) {
    return this.$serverCall('logout', args).then(data => {
      if (data.result) {
        User.currentUser = undefined;
        User.handleToken();
        for (let i = 0; i < User.logoutCallbacks.length; i++) {
          User.logoutCallbacks[i] && User.logoutCallbacks[i](this);
        }
      }
      return Promise.resolve(data);
    });
  }

  $gatekeeper(...args) {
    return this.$serverCall('gatekeeper', args, true);
  }

  $changePassword(...args) {
    return this.$serverCall('changePassword', args);
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
        for (let i = 0; i < User.loginCallbacks.length; i++) {
          User.loginCallbacks[i] && User.loginCallbacks[i](data.user);
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

  static handleToken(response) {
    let token;
    const authCookiePattern = /(?:(?:^|.*;\s*)TILMELDAUTH\s*=\s*([^;]*).*$)|^.*$/;
    if (response && response.headers.has('X-TILMELDAUTH')) {
      token = response.headers.get('X-TILMELDAUTH');
    } else if (
      typeof document !== 'undefined' &&
      document.cookie.match(authCookiePattern)
    ) {
      token = document.cookie.replace(authCookiePattern, '$1');
    } else {
      return;
    }
    if (currentToken !== token) {
      if (token === '') {
        Nymph.setXsrfToken(null);
        if (PubSub.pubsubURL != null) {
          PubSub.setToken(null);
        }
      } else {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const json =
          typeof atob === 'undefined'
            ? Buffer.from(base64, 'base64').toString('binary') // node
            : atob(base64); // browser
        const jwt = JSON.parse(json);
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

Nymph.on('response', response => User.handleToken(response));
User.handleToken();

export default User;
