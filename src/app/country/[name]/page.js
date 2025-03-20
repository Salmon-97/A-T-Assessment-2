"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CountryDetailsPage() {
  const { name } = useParams(); // Get the country name from the URL
  const decodedName = decodeURIComponent(name); // Decode the country name
  const [country, setCountry] = useState(null); // State to store country details
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(null); // State to handle errors

  // Fetch country details from the REST API
  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await fetch(
          `https://restcountries.com/v3.1/name/${decodedName}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        console.log("API Response:", data); // Debugging: Log the API response
        setCountry(data[0]); // Set the fetched data to state
      } catch (error) {
        setError(error.message); // Set error message if something goes wrong
      } finally {
        setLoading(false); // Set loading to false after the request completes
      }
    };

    fetchCountry();
  }, [decodedName]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!country) return <p>No country data found.</p>; // Handle missing data

  return (
    <div>
      <h1>{country.name.common}</h1>
      <p>Population: {country.population?.toLocaleString() ?? "N/A"}</p>
      <p>Area: {country.area?.toLocaleString() ?? "N/A"} km²</p>
      <p>Capital: {country.capital?.[0] ?? "N/A"}</p>
      <p>
        Currency:{" "}
        {country.currencies
          ? Object.values(country.currencies)
              .map((currency) => currency.name)
              .join(", ")
          : "N/A"}
      </p>
      <p>
        Languages:{" "}
        {country.languages
          ? Object.values(country.languages).join(", ")
          : "N/A"}
      </p>
      <p>Region: {country.region ?? "N/A"}</p>
      <p>Subregion: {country.subregion ?? "N/A"}</p>
      <img
        src={country.flags.png}
        alt={`Flag of ${country.name.common}`}
        style={{ width: "200px", height: "auto" }}
      />
    </div>
  );
}