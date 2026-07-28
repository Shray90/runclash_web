export const cookies = () => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
});
export const redirect = jest.fn();
export const notFound = jest.fn();
export const NextResponse = {
  json: jest.fn(),
  redirect: jest.fn(),
};
