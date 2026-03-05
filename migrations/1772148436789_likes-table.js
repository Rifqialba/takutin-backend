exports.up = (pgm) => {
  pgm.createTable('likes', {
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

  // Composite unique constraint to prevent double likes
  pgm.addConstraint('likes', 'unique_user_story', {
    unique: ['user_id', 'story_id']
  });

  pgm.createIndex('likes', 'user_id');
  pgm.createIndex('likes', 'story_id');
};

exports.down = (pgm) => {
  pgm.dropTable('likes');
};