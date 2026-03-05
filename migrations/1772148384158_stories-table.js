exports.up = (pgm) => {
  // Create stories table
  pgm.createTable('stories', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    title: {
      type: 'varchar(255)',
      notNull: true
    },
    content: {
      type: 'text',
      notNull: true
    },
    excerpt: {
      type: 'text'
    },
    cover_image: {
      type: 'text'
    },
    author_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE'
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'draft',
      check: "status IN ('draft', 'published')"
    },
    view_count: {
      type: 'integer',
      notNull: true,
      default: 0
    },
    published_at: {
      type: 'timestamp'
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

  // Create indexes
  pgm.createIndex('stories', 'author_id');
  pgm.createIndex('stories', 'status');
  pgm.createIndex('stories', 'created_at');
  pgm.createIndex('stories', 'published_at');
  pgm.createIndex('stories', 'view_count');
};

exports.down = (pgm) => {
  pgm.dropTable('stories');
};