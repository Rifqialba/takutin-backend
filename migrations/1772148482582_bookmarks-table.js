exports.up = (pgm) => {
  pgm.createTable('bookmarks', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE'
    },
    story_id: {
      type: 'uuid',
      notNull: true,
      references: 'stories(id)',
      onDelete: 'CASCADE'
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  pgm.addConstraint('bookmarks', 'unique_user_story_bookmark', {
    unique: ['user_id', 'story_id']
  });

  pgm.createIndex('bookmarks', 'user_id');
  pgm.createIndex('bookmarks', 'story_id');
};

exports.down = (pgm) => {
  pgm.dropTable('bookmarks');
};