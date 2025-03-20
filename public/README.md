Project Name
- Accolade Tech Assessment

Project Overview

- This project is a Next.js web application that fetches and displays country data from the REST Countries API. The app utilizes Apollo Client for state management and caching.

Features

- Fetch and Display Country List: Retrieves country data and displays it in a paginated table.

- Country Details Page: Dynamic route for viewing details of a selected country by clicking on the country name.

- Search Functionality: Users can search for countries from the displayed list using the search bar.

- Country Comparison: Allows users to compare two countries based on population, area, etc.

- Error Handling & Loading States: Ensures a smooth user experience with appropriate messages and loaders.

- Styled Components: All styling is done using Styled Components.

Technologies Used

- Next.js

- React

- Apollo Client

- REST Countries API

- Styled Components


Steps

- Clone the repository.

- Navigate to the project directory.

- Install dependencies.

- Start the development server.

- Open the application in your browser at.

Usage

- Browse the list of countries.

- Click on a country to view detailed information.

- Use the search bar to filter displayed countries.

- Compare two countries based on population, area, and GDP.

Deployment

(Provide the deployment link here once the app is deployed)

Author

[Munirat Salmon]


The CHALLENGES i faced using Apollo Client with REST Countries API and how I SOLVED it.
- Apollo Client is specifically designed to work with GraphQL APIs, but the REST Countries API is a RESTful API. This means that Apollo Client cannot directly fetch data from it since it expects a GraphQL schema and queries.  

How I Solved It  
Since I was required to use Apollo Client, but the API was a REST API, I did the following:  
1. Used `fetch` for API Calls: Instead of making requests via Apollo Client, I used JavaScript’s built-in `fetch` function to retrieve data from the REST Countries API.  

2. Manually Cached the Data in Apollo Client: After fetching the data, I used Apollo Client’s `writeQuery` method to store the data in the Apollo cache, allowing it to be accessed as if it were retrieved via GraphQL.   

This hybrid approach allowed me to meet the Apollo Client requirement while ensuring that the REST API data was properly fetched and displayed.

