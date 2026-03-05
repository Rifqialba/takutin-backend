exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    content: {
      type: 'text',
      notNull: true
    },
    story_id: {
      type: 'uuid',
      notNull: true,
      references: 'stories(id)',
      onDelete: 'CASCADE'
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE'
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  pgm.createIndex('comments', 'story_id');
  pgm.createIndex('comments', 'user_id');
  pgm.createIndex('comments', 'created_at');
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
};