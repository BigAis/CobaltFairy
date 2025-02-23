
import { createClient } from "pexels";
const client = createClient("");

const fetchPhotos = (pagination, pages, query) => {
  if (!query) {
    query = "fun";
  }
  return new Promise((resolve, reject) => {
    client.photos
      .search({ query, per_page: pages, page: pagination })
      .then((photos) => {
        resolve(photos);
      })
      .catch((error) => reject(error));
  });
};

export default fetchPhotos;
