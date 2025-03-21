"use client";
import { useEffect, useState } from "react";
import { useApolloClient, gql } from "@apollo/client";
import Link from "next/link";
import styled from "styled-components"; // Styled-components added back

// Styled Components for Table & Buttons
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;
  display: block;
  max-width: 100%;
  white-space: nowrap;

  th, td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #222; /* Dark background for contrast */
    color: white;
  }

  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
  }
`;

const Container = styled.div`
  overflow-x: auto;
`;

export default function CountriesPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountries, setSelectedCountries] = useState([]);
  const itemsPerPage = 10;
  const client = useApolloClient();

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

  const filteredCountries = countries.filter((country) =>
    country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedCountries = filteredCountries.slice(startIndex, endIndex);

  const handleSelectCountry = (country) => {
    if (selectedCountries.some((c) => c.cca2 === country.cca2)) {
      setSelectedCountries((prev) =>
        prev.filter((c) => c.cca2 !== country.cca2)
      );
    } else if (selectedCountries.length < 2) {
      setSelectedCountries((prev) => [...prev, country]);
    }
  };

  if (loading) {
    return <p>Loading countries...</p>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={fetchCountries}>Retry</button>
      </div>
    );
  }

  return (
    <Container>
      <h1>Country List</h1>
      <input
        type="text"
        placeholder="Search countries..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ padding: "10px", marginBottom: "15px", width: "100%", maxWidth: "300px" }}
      />

      {filteredCountries.length === 0 && <p>No countries found.</p>}

      {filteredCountries.length > 0 && (
        <Table>
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
        </Table>
      )}

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

      {selectedCountries.length === 2 && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid black" }}>
          <h2>Country Comparison</h2>
          <Table>
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
          </Table>
        </div>
      )}
    </Container>
  );
          }
