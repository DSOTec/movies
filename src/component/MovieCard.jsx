import React from 'react'

const MovieCard = ({ movie }) => {
  if (!movie) {
    return null
  }

  const {
    title,
    name,
    vote_average,
    poster_path,
    release_date,
    first_air_date,
    original_language,
  } = movie

  const displayTitle = title || name || 'Untitled'
  const displayYear = (release_date || first_air_date)?.split('-')[0] || 'N/A'
  const rating = typeof vote_average === 'number' ? vote_average.toFixed(1) : 'N/A'
  const language = original_language ? original_language.toUpperCase() : 'N/A'
  const posterUrl = poster_path
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : '/no-movie.png'

  return (
    <li className="movie-card">
      <img src={posterUrl} alt={displayTitle} />

      <div className="mt-4">
        <h3>{displayTitle}</h3>

        <div className="content">
          <div className="rating">
            <img src="star.svg" alt="Star Icon" />
            <p>{rating}</p>
          </div>

          <span>•</span>
          <p className="lang">{language}</p>

          <span>•</span>
          <p className="year">{displayYear}</p>
        </div>
      </div>
    </li>
  )
}

export default MovieCard
