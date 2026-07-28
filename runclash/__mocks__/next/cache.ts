export const revalidatePath = jest.fn();
export const revalidateTag = jest.fn();
export const updateTag = jest.fn();
export const unstable_cache = jest.fn(() => Promise.resolve(null));
