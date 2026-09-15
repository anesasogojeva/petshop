export function resolveImageUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${process.env.REACT_APP_API_URL}/${path}`;
}
