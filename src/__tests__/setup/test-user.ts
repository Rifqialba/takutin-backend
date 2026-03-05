export const createTestUser = () => {
  const unique = Date.now() + Math.random();

  return {
    email: `test${unique}@mail.com`,
    username: `testuser${unique}`,
    password: 'password123'
  };
};