import { Head } from '@inertiajs/react';

const RED = '#E30613';

type SearchResult = {
    id: string;
    label: string;
    url: string;
    groupTitle: string | null;
    sectorLabel: string | null;
    sectorHref: string | null;
};

export default function SearchResults({
    query,
    results,
}: {
    query: string;
    results: SearchResult[];
}) {
    return (
        <>
            <Head title={`Resultados: ${query}`} />

            <div
                style={{
                    maxWidth: '720px',
                    margin: '0 auto',
                    padding: '40px 24px 80px',
                }}
            >
                <div
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '9px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: '#999',
                        marginBottom: '8px',
                    }}
                >
                    resultados de búsqueda
                </div>
                <h1
                    style={{
                        fontFamily: "'Archivo', sans-serif",
                        fontSize: '28px',
                        fontWeight: 800,
                        margin: '0 0 8px',
                        lineHeight: 1.2,
                    }}
                >
                    {query || '—'}
                </h1>
                <div
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        color: '#999',
                        marginBottom: '32px',
                    }}
                >
                    {results.length === 0
                        ? 'sin resultados'
                        : `${results.length} resultado${results.length === 1 ? '' : 's'}`}
                </div>

                {results.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                        }}
                    >
                        {results.map((result) => (
                            <a
                                key={result.id}
                                href={result.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'block',
                                    textDecoration: 'none',
                                    color: '#000',
                                    padding: '14px 16px',
                                    border: '1px solid #eee',
                                    transition: 'background .15s, color .15s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = RED;
                                    e.currentTarget.style.color = '#fff';
                                    e.currentTarget.querySelectorAll('div').forEach((d) => {
                                        d.style.color = '#fff';
                                    });
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '';
                                    e.currentTarget.style.color = '';
                                    e.currentTarget.querySelectorAll('div').forEach((d) => {
                                        d.style.color = '';
                                    });
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 700,
                                        fontSize: '14px',
                                    }}
                                >
                                    {result.label}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: '10px',
                                        letterSpacing: '0.04em',
                                        color: '#999',
                                        marginTop: '3px',
                                    }}
                                >
                                    {[result.sectorLabel, result.groupTitle]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

SearchResults.layout = { active: 'home', label: 'Inicio—' };
