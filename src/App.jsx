// import React from 'react'
// import { useState, useEffect } from 'react';

// const Card = ({ title }) => {
//   const [count, setCount] = useState(0);
//    const [hasLiked, setHasLiked] = useState(false);

//    useEffect(() => {
//     console.log(`The ${title} card has been ${hasLiked ? 'liked' : 'not liked'}`)
//    }, [hasLiked]);

//   return (
//     <div onClick={() => setCount(count + 1)} className='flex flex-wrap content-center m-4 p-4 bg-[green] text-white w-30'>
//        <h2>{title} <br/> {count || null}</h2> 
//        <button className='text-right cursor-pointer'  onClick={ () => setHasLiked(!hasLiked)}>
//          {hasLiked ? '❤️' : '🤍'}
//        </button>
//     </div>
//   )
// }

// const App = () => {
  

//   return (
//     <div>
//     <h2>Functional Arrow Component</h2>

//     <Card title="Star Wars" />
//     <Card title="Avatar" />
//     <Card title="The Lion King" />
//     </div>
//   )
// }

// export default App


import React, { useEffect, useState } from 'react'
import Search from './component/Search'
import MovieCard from './component/MovieCard'
import Spinner from './component/Spinner'
import { getTrendingMovies, updateSearchCount } from './appwrite'
//import hero from "/hero-img.png"
const App = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [movieList, setMovieList] = useState([])
  const [trendingMovies, setTrendingMovies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadTrendingMovies = async () => {
      try {
        const movies = await getTrendingMovies()

        if (Array.isArray(movies)) {
          setTrendingMovies(movies)
        }
      } catch (error) {
        console.error('Failed to load trending movies', error)
      }
    }

    loadTrendingMovies()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const trimmedQuery = searchTerm.trim()

    if (!trimmedQuery) {
      setMovieList([])
      setErrorMessage('')
      setIsLoading(false)
      return () => controller.abort()
    }

    const apiKey = import.meta.env.VITE_TMDB_API_KEY
    const accessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN

    if (!apiKey && !accessToken) {
      setErrorMessage('Missing TMDB credentials. Set VITE_TMDB_API_KEY or VITE_TMDB_ACCESS_TOKEN.')
      setMovieList([])
      setIsLoading(false)
      return () => controller.abort()
    }

    const fetchMovies = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const url = new URL('https://api.themoviedb.org/3/search/movie')
        url.searchParams.set('query', trimmedQuery)
        url.searchParams.set('include_adult', 'false')
        url.searchParams.set('language', 'en-US')
        url.searchParams.set('page', '1')

        if (apiKey) {
          url.searchParams.set('api_key', apiKey)
        }

        const headers = !apiKey && accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers,
        })

        if (!response.ok) {
          throw new Error(`TMDB request failed with status ${response.status}`)
        }

        const data = await response.json()
        const results = Array.isArray(data.results) ? data.results : []

        setMovieList(results)

        if (results[0]) {
          await updateSearchCount(trimmedQuery, results[0])
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        console.error('Failed to fetch movies', error)
        setErrorMessage('We could not load movies. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()

    return () => controller.abort()
  }, [searchTerm])

  const trendingAsMovies = trendingMovies.map((entry) => {
    if (entry && entry.searchTerm) {
      return {
        id: entry.movie_id || entry.$id,
        title: entry.searchTerm,
        poster_path: entry.poster_url,
        vote_average: entry.count,
      }
    }

    return entry
  })

  return (
    <main className='bg-[url("/BG.png")] bg-[#17113a] bg-no-repeat bg-cover min-h-screen w-full text-white'>
      <div className='pattern' />

      <div className='wrapper'> 
        <header className='flex flex-col items-center justify-center text-center gap-4 mb-8 pt-8'>
          <img className='w-32' src="./logo.png" alt="Logo" />
          <img className='' src="./hero-img.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
          <p>Search for a title to see ratings, languages, and release years.</p>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingAsMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Searches</h2>
            <ul>
              {trendingAsMovies.map((movie) => (
                <MovieCard key={movie.id ?? movie.$id} movie={movie} />
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p>{errorMessage}</p>
          ) : movieList.length > 0 ? (
            <ul>
              {movieList.map((movie) => (
                <MovieCard
                  key={movie.id ?? movie.movie_id ?? movie.$id}
                  movie={movie}
                />
              ))}
            </ul>
          ) : (
            <p>Try searching for a movie title.</p>
          )}
        </section>

      </div>


    </main>
  )
}

export default App