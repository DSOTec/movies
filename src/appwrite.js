import { Client, Databases, ID, Query } from 'appwrite'
import appwriteConfig from '../appwrite.config.json'

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || appwriteConfig.projectId
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || appwriteConfig.endpoint || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(PROJECT_ID)

const databases = new Databases(client)

const isConfigured = Boolean(PROJECT_ID && DATABASE_ID && COLLECTION_ID)

export const updateSearchCount = async (searchTerm, movie) => {
  if (!isConfigured) {
    console.warn('Appwrite credentials missing; skipping updateSearchCount call.')
    return
  }

  if (!searchTerm) {
    return
  }

  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm),
    ])

    if (result.documents.length > 0) {
      const doc = result.documents[0]

      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: (doc.count || 0) + 1,
      })
    } else {
      const posterUrl = movie?.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : movie?.poster_url

      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie?.id || movie?.movie_id || null,
        poster_url: posterUrl || null,
      })
    }
  } catch (error) {
    console.error('Failed to update search count', error)
  }
}

export const getTrendingMovies = async () => {
  if (!isConfigured) {
    console.warn('Appwrite credentials missing; returning empty trending movies list.')
    return []
  }

  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc('count'),
    ])

    return result.documents
  } catch (error) {
    console.error('Failed to load trending movies', error)
    return []
  }
}