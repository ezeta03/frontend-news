import React, { useState, useEffect } from 'react';

// Componente para mostrar una sección de noticias
const NewsSection = ({ title, news }) => {
  if (!news || news.length === 0) {
    return null; // No renderiza la sección si no hay noticias
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((article) => (
          <div key={article.id} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between news-article-card">
            <div>
              <h3 className="text-lg font-medium text-blue-700 mb-2 hover:underline">
                <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a>
              </h3>
              <p className="text-gray-600 text-sm mb-3">{article.description}</p>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
              <span>Fuente: {article.source}</span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente principal de la aplicación
const App = () => {
  const [selectedRegion, setSelectedRegion] = useState('Perú');
  const [selectedTopic, setSelectedTopic] = useState('Todos'); // Nuevo estado para el filtro de tema
  const [searchTerm, setSearchTerm] = useState(''); // Nuevo estado para el término de búsqueda
  const [allRegionalNews, setAllRegionalNews] = useState([]); // Almacena todas las noticias de la región sin filtro de tema
  const [loading, setLoading] = useState(false); // Estado para indicar si las noticias están cargando

  // Función para obtener noticias de la API de GNews
  const fetchNews = async (region, topic) => {
    setLoading(true); // Iniciar estado de carga
    const GNEWS_API_KEY = 'cf79cb98bbebc78502570c775a02bfef'; // ¡IMPORTANTE: Reemplaza con tu clave API real de GNews!

    // Si la clave API no está configurada (es una cadena vacía o nula/undefined)
    if (!GNEWS_API_KEY) {
      console.error("Error: GNEWS_API_KEY no configurada. Por favor, asegúrate de haberla reemplazado con tu clave real.");
      setAllRegionalNews([]);
      setLoading(false);
      return;
    }

    let query = '';
    let lang = 'es'; // Idioma español
    let country = ''; // País para filtrar

    // Construir la consulta y el país según la región y el tema
    if (topic === 'Fibra óptica') {
      query = 'fibra óptica';
    } else if (topic === 'Temas Específicos') {
      // Consulta para los temas combinados: internet/fibra, tecnología operadores, regulación
      query = 'internet OR "fibra óptica" OR telecomunicaciones OR operadores OR tecnología OR regulación OR normativa';
    } else { // 'Todos'
      query = 'telecomunicaciones OR internet OR "fibra óptica" OR regulación';
    }

    if (region === 'Perú') {
      country = 'pe';
    } else if (region === 'Latinoamérica') {
      // Para 'Latinoamérica', haremos una búsqueda general en español.
      country = ''; // No especificar país para una búsqueda más amplia en LATAM
      lang = 'es'; // Asegurar idioma español
    } else if (region === 'El Mundo') {
      country = ''; // Sin filtro de país para noticias globales
    }

    let apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=${lang}&token=${GNEWS_API_KEY}`;

    if (country) {
      apiUrl += `&country=${country}`;
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Mapear los datos de la API de GNews a nuestro formato
      const formattedNews = data.articles.map(article => ({
        id: article.url, // Usar la URL como ID único
        region: region, // Asignar la región según el filtro actual
        title: article.title,
        description: article.description || 'No hay descripción disponible.',
        source: article.source.name,
        url: article.url,
        publishedAt: article.publishedAt,
        // Asignar categorías basadas en el título/descripción (lógica simple)
        categories: [
          (article.title.toLowerCase().includes('fibra óptica') || article.description.toLowerCase().includes('fibra óptica') || article.title.toLowerCase().includes('internet') || article.description.toLowerCase().includes('internet')) ? 'internet_fibra' : null,
          (article.title.toLowerCase().includes('operadores') || article.description.toLowerCase().includes('operadores') || article.title.toLowerCase().includes('tecnología') || article.description.toLowerCase().includes('tecnología') || article.title.toLowerCase().includes('5g') || article.description.toLowerCase().includes('5g')) ? 'tecnologia_operadores' : null,
          (article.title.toLowerCase().includes('regulación') || article.description.toLowerCase().includes('regulación') || article.title.toLowerCase().includes('normativa') || article.description.toLowerCase().includes('normativa') || article.title.toLowerCase().includes('osiptel') || article.description.toLowerCase().includes('osiptel')) ? 'regulacion_normativa' : null,
        ].filter(Boolean), // Eliminar nulos
      }));

      setAllRegionalNews(formattedNews);
    } catch (error) {
      console.error("Error fetching news:", error);
      setAllRegionalNews([]); // Limpiar noticias en caso de error
      // Aquí podrías mostrar un mensaje de error al usuario en la UI
    } finally {
      setLoading(false); // Finalizar estado de carga
    }
  };

  // Efecto para cargar noticias cuando cambia la región o el tema seleccionado
  // Se llama a fetchNews con la región y el tema actuales
  useEffect(() => {
    fetchNews(selectedRegion, selectedTopic);
  }, [selectedRegion, selectedTopic]); // Dependencias: selectedRegion y selectedTopic

  // Lógica para aplicar el filtro de tema y el buscador de texto a las noticias
  const newsToDisplay = allRegionalNews.filter(article => {
    // Filtrar por tema
    const topicMatches =
      selectedTopic === 'Todos' ||
      (selectedTopic === 'Fibra óptica' && article.categories.includes('internet_fibra')) ||
      (selectedTopic === 'Temas Específicos' && (
        article.categories.includes('internet_fibra') ||
        article.categories.includes('tecnologia_operadores') ||
        article.categories.includes('regulacion_normativa')
      ));

    // Filtrar por término de búsqueda
    const searchTermLower = searchTerm.toLowerCase();
    const titleMatches = article.title.toLowerCase().includes(searchTermLower);
    const descriptionMatches = article.description.toLowerCase().includes(searchTermLower);
    const searchMatches = titleMatches || descriptionMatches;

    return topicMatches && searchMatches;
  });

  // Filtrar noticias por categorías específicas (ahora opera sobre newsToDisplay)
  const getNewsByCategory = (category) => {
    return newsToDisplay.filter(article => article.categories.includes(category));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-900 p-4 sm:p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-3">
          Noticias de Fibra Óptica y Telecomunicaciones
        </h1>
        <p className="text-lg text-gray-600">
          Resúmenes de las últimas noticias filtradas por región, tema y palabra clave.
        </p>
      </header>

      <nav className="flex flex-col sm:flex-row justify-center items-center mb-10 space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Filtro por Región */}
        <div className="bg-white p-2 rounded-full shadow-lg flex space-x-2">
          {['Perú', 'Latinoamérica', 'El Mundo'].map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ease-in-out
                ${selectedRegion === region
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Filtro por Tema */}
        <div className="bg-white p-2 rounded-full shadow-lg flex space-x-2">
          {['Todos', 'Fibra óptica', 'Temas Específicos'].map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ease-in-out
                ${selectedTopic === topic
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </nav>

   {/* Buscador de Texto */}
<div className="flex justify-center mb-8">
  <div className="news-search-bar w-full max-w-xl flex items-center bg-white rounded-full shadow-lg border border-blue-200 px-4 py-2">
    <svg
      className="w-6 h-6 text-blue-500 mr-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input
      type="text"
      placeholder="Buscar noticias por palabra clave..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="flex-1 bg-transparent border-none outline-none text-lg text-blue-900 placeholder-gray-400"
    />
  </div>
</div>

      <main className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center text-gray-500 text-xl py-10">
            Cargando noticias...
          </div>
        ) : newsToDisplay.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-10">
            No hay noticias disponibles para la selección actual o el término de búsqueda.
          </div>
        ) : (
          <>
            {/* Mostrar secciones específicas solo si el tema es 'Todos' o 'Temas Específicos' */}
            {(selectedTopic === 'Todos' || selectedTopic === 'Temas Específicos') && (
              <>
                <NewsSection
                  title={`Noticias de ${selectedRegion} sobre Servicios de Internet y Fibra Óptica`}
                  news={getNewsByCategory('internet_fibra')}
                />
                <NewsSection
                  title={`Noticias de ${selectedRegion} sobre Tecnología Asociada a Operadores de Telecomunicaciones`}
                  news={getNewsByCategory('tecnologia_operadores')}
                />
                <NewsSection
                  title={`Noticias de ${selectedRegion} sobre Regulación o Normativa del Sector`}
                  news={getNewsByCategory('regulacion_normativa')}
                />
              </>
            )}

            {/* Mostrar sección de Fibra Óptica si el tema es 'Fibra óptica' */}
            {selectedTopic === 'Fibra óptica' && (
              <NewsSection
                title={`Noticias de ${selectedRegion} sobre Fibra Óptica`}
                news={getNewsByCategory('internet_fibra')}
              />
            )}

            {/* Sección general de todas las noticias de la región y tema seleccionado */}
            <NewsSection
              title={`Todas las Noticias de ${selectedRegion} (${selectedTopic})`}
              news={newsToDisplay}
            />
          </>
        )}
      </main>

      <footer className="text-center text-gray-500 text-sm mt-12">
        <p>Desarrollado con React y Tailwind CSS.</p>
        <p>Datos de noticias obtenidos de GNews API.</p>
        <p className="text-red-500">
          ¡Recuerda reemplazar 'YOUR_GNEWS_API_KEY' con tu clave API real de GNews para obtener noticias en tiempo real!
        </p>
      </footer>
    </div>
  );
};

export default App;
