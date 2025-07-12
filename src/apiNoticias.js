import axios from "axios";

const API_KEY = "cf79cb98bbebc78502570c775a02bfef";

export async function obtenerNoticias(query, region = "es") {
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    query
  )}&lang=es&country=${region}&max=10&token=${API_KEY}`;
  const { data } = await axios.get(url);
  return data.articles;
}