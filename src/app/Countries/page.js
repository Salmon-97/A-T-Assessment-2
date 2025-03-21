"use client";
import { useEffect, useState } from "react";
import { useApolloClient, gql } from "@apollo/client";
import Link from "next/link";
import styled from "styled-components"; // Import styled-components

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
    return <LoadingMessage>Loading countries...</LoadingMessage>;
  }

  if (error) {
    return (
      <ErrorMessage>
        <p>Error: {error}</p>
        <button onClick={fetchCountries}>Retry</button>
      </ErrorMessage>
    );
  }

  return (
    <Container>
      <Title>Country List</Title>

      <SearchBar
        type="text"
        placeholder="Search countries..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {filteredCountries.length === 0 ? (
        <NoResults>No countries found.</NoResults>
      ) : (
        <StyledTable>
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
        </StyledTable>
      )}

      <Pagination>
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
      </Pagination>

      {selectedCountries.length === 2 && (
        <ComparisonContainer>
          <h2>Country Comparison</h2>
          <StyledTable>
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
          </StyledTable>
        </ComparisonContainer>
      )}
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: auto;
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
`;

const SearchBar = styled.input`
  padding: 10px;
  margin-bottom: 15px;
  width: 100%;
  max-width: 300px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const NoResults = styled.p`
  text-align: center;
  font-weight: bold;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;

  th, td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
  }

  th {
    background-color: #f4f4f4;
  }
`;

const Pagination = styled.div`
  margin-top: 20px;
`;

const ComparisonContainer = styled.div`
  margin-top: 20px;
  padding: 10px;
  border: 1px solid black;
`;

const LoadingMessage = styled.p`
  text-align: center;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: red;
`;
