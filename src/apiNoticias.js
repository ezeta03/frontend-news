import axios from "axios";

const API_KEY = "873dc99c494f42b89a59d102e3db1e04";

export async function obtenerNoticias(query, fromDate, toDate) {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
    query
  )}&language=es&from=${fromDate}&to=${toDate}&sortBy=publishedAt&apiKey=${API_KEY}`;
  const { data } = await axios.get(url);
  return data.articles;
}