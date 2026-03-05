exports.up = (pgm) => {
  pgm.createTable('follows', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    follower_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE'
    },
    following_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE'
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  // Composite unique constraint to prevent double follow
  pgm.addConstraint('follows', 'unique_follower_following', {
    unique: ['follower_id', 'following_id']
  });

  // Prevent users from following themselves
  pgm.addConstraint('follows', 'no_self_follow', {
    check: 'follower_id != following_id'
  });

  pgm.createIndex('follows', 'follower_id');
  pgm.createIndex('follows', 'following_id');
};

exports.down = (pgm) => {
  pgm.dropTable('follows');
};