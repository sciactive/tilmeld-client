import { Nymph, Entity } from 'nymph-client';

export class Group extends Entity {
  constructor(id) {
    super(id);
    this.enabled = true;
    this.abilities = [];
    this.addressType = 'us';
  }

  $checkGroupname(...args) {
    return this.$serverCall('checkGroupname', args, true);
  }

  $checkEmail(...args) {
    return this.$serverCall('checkEmail', args, true);
  }

  $getAvatar(...args) {
    return this.$serverCall('getAvatar', args, true);
  }

  $getChildren(...args) {
    return this.$serverCall('getChildren', args, true);
  }

  $getDescendants(...args) {
    return this.$serverCall('getDescendants', args, true);
  }

  $getLevel(...args) {
    return this.$serverCall('getLevel', args, true);
  }

  $isDescendant(...args) {
    return this.$serverCall('isDescendant', args, true);
  }

  static getPrimaryGroups(...args) {
    return Group.serverCallStatic('getPrimaryGroups', args);
  }

  static getSecondaryGroups(...args) {
    return Group.serverCallStatic('getSecondaryGroups', args);
  }
}

// The name of the server class
Group.class = 'Tilmeld\\Entities\\Group';

Nymph.setEntityClass(Group.class, Group);

export default Group;
