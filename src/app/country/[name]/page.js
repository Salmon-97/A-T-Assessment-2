"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CountryDetailsPage() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const [country, setCountry] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.log("API Response:", data); 
        setCountry(data[0]); 
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, [decodedName]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!country) return <p>No country data found.</p>; 

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