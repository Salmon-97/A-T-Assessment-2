"use client";
import { useEffect, useState } from "react";
import { useApolloClient, gql } from "@apollo/client";
import Link from "next/link"; // Import Link from Next.js

export default function CountriesPage() {
  const [countries, setCountries] = useState([]); // State to store countries data
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(null); // State to handle errors
  const [currentPage, setCurrentPage] = useState(1); // State for pagination
  const itemsPerPage = 10; // Number of items per page
  const client = useApolloClient(); // Apollo Client instance

  // Fetch countries data from the REST API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setCountries(data); // Set the fetched data to state

        // Cache the data using Apollo Client
        client.writeQuery({
          query: gql`
            query GetCountries {
              countries {
                name
                population
                area
                capital
                currencies
              }
            }
          `,
          data: { countries: data },
        });
      } catch (error) {
        setError(error.message); // Set error message if something goes wrong
      } finally {
        setLoading(false); // Set loading to false after the request completes
      }
    };

    fetchCountries();
  }, [client]);

  // Handle pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedCountries = countries.slice(startIndex, endIndex);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Country List</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Population</th>
            <th>Area</th>
            <th>Capital</th>
            <th>Currency</th>
          </tr>
        </thead>
        <tbody>
          {displayedCountries.map((country) => (
            <tr key={country.cca2}>
              <td>
                {/* Make the country name a link to its details page */}
                <Link href={`/country/${country.name.common}`}>
                  {country.name.common}
                </Link>
              </td>
              <td>{country.population?.toLocaleString() ?? "N/A"}</td>
              <td>{country.area?.toLocaleString() ?? "N/A"}</td>
              <td>{country.capital?.[0] ?? "N/A"}</td>
              <td>
                {country.currencies
                  ? Object.values(country.currencies)
                      .map((currency) => currency.name)
                      .join(", ")
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span> Page {currentPage} </span>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              prev < Math.ceil(countries.length / itemsPerPage) ? prev + 1 : prev
            )
          }
          disabled={endIndex >= countries.length}
        >
          Next
        </button>
      </div>
    </div>
  );
}