"use client";
import { useEffect, useState } from "react";
import { useApolloClient, gql } from "@apollo/client";
import Link from "next/link";
import styled from "styled-components"; 


const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background: #007bff;
  color: white;
  padding: 10px;
  text-align: left;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: left;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background: #f2f2f2;
  }
`;

const Button = styled.button`
  padding: 8px 12px;
  margin: 5px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background: #0056b3;
  }
  &:disabled {
    background: gray;
    cursor: not-allowed;
  }
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

      {filteredCountries.length === 0 && (
        <p style={{ textAlign: "center" }}>No countries found.</p>
      )}

      {filteredCountries.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Select</Th>
              <Th>Name</Th>
              <Th>Population</Th>
              <Th>Area</Th>
              <Th>Capital</Th>
              <Th>Currency</Th>
            </tr>
          </thead>
          <tbody>
            {displayedCountries.map((country) => (
              <Tr key={country.cca2}>
                <Td>
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
                </Td>
                <Td>
                  <Link href={`/country/${country.name.common}`}>
                    {country.name.common}
                  </Link>
                </Td>
                <Td>{country.population?.toLocaleString() ?? "N/A"}</Td>
                <Td>{country.area?.toLocaleString() ?? "N/A"}</Td>
                <Td>{country.capital?.[0] ?? "N/A"}</Td>
                <Td>
                  {country.currencies
                    ? Object.values(country.currencies)
                        .map((currency) => currency.name)
                        .join(", ")
                    : "N/A"}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <div>
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span> Page {currentPage} </span>
        <Button
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
        </Button>
      </div>
    </div>
  );
}
