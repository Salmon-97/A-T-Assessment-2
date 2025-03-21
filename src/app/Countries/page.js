"use client";
import { useEffect, useState } from "react";
import { useApolloClient, gql } from "@apollo/client";
import Link from "next/link";
import styled from "styled-components"; 


const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

const SearchBar = styled.input`
  padding: 10px;
  margin-bottom: 15px;
  width: 100%;
  max-width: 300px;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto; /* Enables horizontal scroll on mobile */
`;

const Table = styled.table`
  width: 100%;
  max-width: 800px;
  border-collapse: collapse;
  margin: auto;

  thead {
    background-color: #333; /* Dark header background */
    color: white; /* White text for visibility */
  }

  th, td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const ComparisonBox = styled.div`
  margin-top: 20px;
  padding: 10px;
  border: 1px solid black;
  text-align: center;
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

  return (
    <PageWrapper>
      <h1>Country List</h1>

    
      <SearchBar
        type="text"
        placeholder="Search countries..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      
      {filteredCountries.length === 0 && <p>No countries found.</p>}

      
      <TableWrapper>
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
                    onChange={() => setSelectedCountries((prev) =>
                      prev.some((c) => c.cca2 === country.cca2)
                        ? prev.filter((c) => c.cca2 !== country.cca2)
                        : prev.length < 2 ? [...prev, country] : prev
                    )}
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
      </TableWrapper>

    
      <ButtonContainer>
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
      </ButtonContainer>

      
      {selectedCountries.length === 2 && (
        <ComparisonBox>
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
        </ComparisonBox>
      )}
    </PageWrapper>
  );
        }
