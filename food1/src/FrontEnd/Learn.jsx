import React from 'react';
import { useLocation } from 'react-router-dom';

const Learn = () => {
  const query = new URLSearchParams(useLocation().search).get('query'); // Get the search query from URL

  return (
    <div>
      <h1>Search Results for: {query}</h1>
      {/* You can add logic to display search results based on the query */}
    </div>
  );
};

export default Learn;
