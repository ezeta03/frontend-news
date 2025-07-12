import "./index.css";
import React, { useEffect, useState } from "react";
import { obtenerNoticias } from "./apiNoticias";

function SeccionNoticias({ titulo, noticias }) {
  return (
    <section>
      <h2>{titulo}</h2>
      {noticias.length === 0 ? (
        <p>
          <em>
            No se encontraron novedades significativas en el sector
            telecomunicaciones para la fecha indicada.
          </em>
        </p>
      ) : (
        noticias.map((n, idx) => (
          <article key={idx} style={{ marginBottom: "2em" }}>
            <strong>
              📅 {new Date(n.publishedAt).toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}{" "}
              – {n.title}
            </strong>
            <p>
              <b>
                {n.description
                  ? n.description.split(".")[0] + "."
                  : "Noticia relevante del sector de telecomunicaciones."}
              </b>{" "}
              {n.content ? n.content : ""}
            </p>
            <p>
              Fuente:{" "}
              <a href={n.url} target="_blank" rel="noopener noreferrer">
                {n.source.name}
              </a>
            </p>
          </article>
        ))
      )}
    </section>
  );
}

function App() {
  const [noticiasPeru, setNoticiasPeru] = useState([]);
  const [noticiasLatam, setNoticiasLatam] = useState([]);
  const [noticiasMundo, setNoticiasMundo] = useState([]);

  useEffect(() => {
    // Perú
    obtenerNoticias("fibra óptica OR internet OR telecomunicaciones", "pe").then(setNoticiasPeru);
    // América Latina (ejemplo: México)
    obtenerNoticias("fibra óptica OR internet OR telecomunicaciones", "mx").then(setNoticiasLatam);
    // Internacional (idioma español, sin país)
    obtenerNoticias("fibra óptica OR internet OR telecomunicaciones", "es").then(setNoticiasMundo);
  }, []);

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "2em auto",
        background: "rgba(255,255,255,0.07)",
        borderRadius: "18px",
        boxShadow: "0 8px 32px 0 #0a234255",
        padding: "2em 1.5em",
      }}
    >
      <h1>Resumen diario de noticias de telecomunicaciones</h1>
      <SeccionNoticias titulo="Noticias en Perú" noticias={noticiasPeru} />
      <SeccionNoticias
        titulo="Noticias en América Latina"
        noticias={noticiasLatam}
      />
      <SeccionNoticias
        titulo="Noticias internacionales"
        noticias={noticiasMundo}
      />
    </div>
  );
}

export default App;