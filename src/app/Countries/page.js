"use client";
import { useEffect, useState } from "react";
import { useApolloClient, gql } from "@apollo/client";
import Link from "next/link";

export default function CountriesPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountries, setSelectedCountries] = useState([]);
  const itemsPerPage = 10;
  const client = useApolloClient();

  // Fetch countries data
  const fetchCountries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://restcountries.com/v3.1/all");
      if (!response.ok) {
        throw new Error("Failed to fetch data. Please try again later.");
      }
      const data = await response.json();
      setCountries(data);

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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, [client]);

  // Filter countries based on search query
  const filteredCountries = countries.filter((country) =>
    country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedCountries = filteredCountries.slice(startIndex, endIndex);

  // Handle country selection for comparison
  const handleSelectCountry = (country) => {
    if (selectedCountries.some((c) => c.cca2 === country.cca2)) {
      setSelectedCountries((prev) =>
        prev.filter((c) => c.cca2 !== country.cca2)
      );
    } else if (selectedCountries.length < 2) {
      setSelectedCountries((prev) => [...prev, country]);
    }
  };

  // **Loading State**
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <p>Loading countries...</p>
        <div className="spinner"></div>
        <style jsx>{`
          .spinner {
            margin: 10px auto;
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #333;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // **Error State**
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
        <p>Error: {error}</p>
        <button onClick={fetchCountries} style={{ padding: "10px" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Country List</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search countries..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          padding: "10px",
          marginBottom: "15px",
          width: "100%",
          maxWidth: "300px",
        }}
      />

      {/* No Results Found */}
      {filteredCountries.length === 0 && (
        <p style={{ textAlign: "center" }}>No countries found.</p>
      )}

      {/* Country Table */}
      {filteredCountries.length > 0 && (
        <table border="1">
          <thead>
            <tr>
              <th>Select</th>
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
                  <input
                    type="checkbox"
                    checked={selectedCountries.some(
                      (c) => c.cca2 === country.cca2
                    )}
                    onChange={() => handleSelectCountry(country)}
                    disabled={
                      selectedCountries.length >= 2 &&
                      !selectedCountries.some((c) => c.cca2 === country.cca2)
                    }
                  />
                </td>
                <td>
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
      )}

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
              prev < Math.ceil(filteredCountries.length / itemsPerPage)
                ? prev + 1
                : prev
            )
          }
          disabled={endIndex >= filteredCountries.length}
        >
          Next
        </button>
      </div>

      {/* Country Comparison Section */}
      {selectedCountries.length === 2 && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid black" }}>
          <h2>Country Comparison</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Feature</th>
                <th>{selectedCountries[0].name.common}</th>
                <th>{selectedCountries[1].name.common}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Population</td>
                <td>{selectedCountries[0].population.toLocaleString()}</td>
                <td>{selectedCountries[1].population.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Area (sq km)</td>
                <td>{selectedCountries[0].area.toLocaleString()}</td>
                <td>{selectedCountries[1].area.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Capital</td>
                <td>{selectedCountries[0].capital?.[0] ?? "N/A"}</td>
                <td>{selectedCountries[1].capital?.[0] ?? "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
